/**
 * BattlePage — Live coding battle arena.
 *
 * This is the main battle screen where two players compete to solve a
 * programming problem within a fixed time window.
 *
 * ## Architecture overview
 *
 * The component integrates three distinct systems:
 *  1. **Timer** – a 1-second interval that derives remaining time from the
 *     server-authoritative `battleEndsAt` timestamp using `serverTimeOffsetMs`
 *     (the difference between server and client clocks computed at battle start).
 *  2. **Submission flow** – the user clicks "Submit", their code is validated
 *     against sample/hidden tests via the `/submit` HTTP endpoint, and on
 *     full-pass the battle result is emitted to the server over Socket.IO.
 *  3. **Socket.IO events** – a single persistent listener waits for the
 *     `battleResult` event, which the server emits once both players' results
 *     have been processed.
 *
 * ## Timer & auto-submit logic
 *
 * - `getSyncedTimeRemaining` computes `floor((battleEndsAt - (Date.now() + serverTimeOffsetMs)) / 1000)`.
 * - When the timer reaches 0, an **auto-submit** fires exactly once (guarded by
 *   `hasAutoSubmittedRef`) so the server always receives both players' submissions
 *   even if one player never clicks the submit button.
 * - `hasAutoSubmittedRef` is a plain ref (not state) to avoid triggering re-renders.
 *
 * ## State persistence (sessionStorage)
 *
 * Because the browser back button or an accidental refresh would wipe React state,
 * the battle context, room ID, waiting flag, and result details are persisted to
 * sessionStorage via helpers in `features/battle/sessionStorage.js`. They are
 * re-read on mount so the user can return to the in-progress battle.
 *
 * ## Socket event lifecycle
 *
 * | Event          | Direction       | Meaning                                       |
 * |----------------|-----------------|-----------------------------------------------|
 * | `battleEnded`  | client → server | Player's code and remaining time submitted    |
 * | `battleResult` | server → client | Battle resolved; carries winner/draw verdict  |
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditorPanel from "./components/BattlePage/EditorPanel";
import ErrorFormatter from "./components/BattlePage/ErrorFormatter";
import Navbar from "./components/BattlePage/Navbar";
import Notification from "./components/BattlePage/Notification";
import QuestionPanel from "./components/BattlePage/QuestionPanel";
import BattleResultModal from "./components/BattlePage/BattleResultModal.jsx";
import { establishSocketConnection } from "./components/socket.js";
import { SERVER_URL } from "./config.js";
import {
  clearBattleSession,
  getStoredBattle,
  getStoredBattleNote,
  getStoredBattleResultDetails,
  getStoredRoomId,
  getStoredServerTimeOffset,
  getStoredWaitingState,
  persistBattleContext,
  persistBattleResult,
  persistWaitingState,
} from "./features/battle/sessionStorage.js";

/**
 * Computes the number of seconds remaining in the battle, corrected for the
 * server-client clock skew.
 *
 * - When `battleEndsAt` is available (epoch ms from the server), remaining time
 *   is derived precisely from it.
 * - Falls back to the configured `battleDurationSeconds` before the battle starts.
 *
 * @param {number} battleEndsAt - Unix timestamp (ms) at which the battle ends.
 * @param {number} battleDurationSeconds - Total battle length in seconds.
 * @param {number} [serverTimeOffsetMs=0] - `serverNow - Date.now()` captured at battle start.
 * @returns {number} Remaining seconds, clamped to [0, +∞).
 */
function getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs = 0) {
  const syncedNow = Date.now() + serverTimeOffsetMs;
  if (battleEndsAt > 0) {
    return Math.max(0, Math.ceil((battleEndsAt - syncedNow) / 1000));
  }
  return battleDurationSeconds;
}

function BattlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Tracks the countdown interval handle so it can be cleared on re-render or unmount.
   * @type {React.MutableRefObject<ReturnType<typeof setInterval>|null>}
   */
  const intervalRef = useRef(null);

  /**
   * Prevents double auto-submission when the timer fires at the same tick the
   * user's manual submit succeeds.
   * @type {React.MutableRefObject<boolean>}
   */
  const hasAutoSubmittedRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Editor state – lifted up so the interval's auto-submit closure can read the
  // latest code/language without capturing a stale value.
  // ---------------------------------------------------------------------------
  const [parentCode, setParentCode] = useState("");
  const [parentLanguage, setParentLanguage] = useState("python");

  const [activeTab, setActiveTab] = useState("problem");
  const [output, setOutput] = useState("");
  const [notifications, setNotifications] = useState([]);

  // ---------------------------------------------------------------------------
  // Battle result state – also seeded from sessionStorage to survive refreshes
  // ---------------------------------------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [isWaiting, setIsWaiting] = useState(getStoredWaitingState);
  const [battleNote, setBattleNote] = useState(getStoredBattleNote);
  const [battleResultDetails, setBattleResultDetails] = useState(getStoredBattleResultDetails);

  // ---------------------------------------------------------------------------
  // Derived values from navigation state + sessionStorage fallback
  // ---------------------------------------------------------------------------
  const battle = getStoredBattle(location.state?.battle);
  const problem = battle?.question || {};
  const roomId = getStoredRoomId(location.state?.roomId);
  const userId = sessionStorage.getItem("userId");

  const serverTimeOffsetMs = Number.isFinite(Number(battle?.serverTimeOffsetMs))
    ? Number(battle.serverTimeOffsetMs)
    : getStoredServerTimeOffset();

  const battleDurationSeconds = Number(battle?.battleDurationSeconds || 1800);
  const battleEndsAt = Number(battle?.battleEndsAt || 0);

  const [timeRemaining, setTimeRemaining] = useState(() =>
    getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs),
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Persist battle context on every navigation state change (handles back-button refreshes)
  useEffect(() => {
    persistBattleContext(location.state?.battle, location.state?.roomId);
  }, [location.state]);

  // Re-sync the displayed timer whenever battle timing params arrive/change
  useEffect(() => {
    setTimeRemaining(getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs));
  }, [battleDurationSeconds, battleEndsAt, serverTimeOffsetMs]);

  // Show the result modal with a short delay so CSS animations have time to initialise
  useEffect(() => {
    if (!isWaiting && !battleNote) {
      setShowModal(false);
      return undefined;
    }
    const timeoutId = setTimeout(() => setShowModal(true), 50);
    return () => clearTimeout(timeoutId);
  }, [battleNote, isWaiting]);

  /**
   * Registers a transient notification toast.  The notification auto-dismisses
   * after 3.3 s by removing itself from state.
   * @param {string} message
   * @param {"success"|"error"|"info"} type
   */
  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3300);
  };

  /**
   * Emits `battleEnded` to the server over Socket.IO.
   *
   * Guards:
   * - `hasAutoSubmittedRef.current` – ensures we only send once.
   * - `isWaiting` / `battleNote` – prevents re-submission after a result arrived.
   * - `battle.battleId` – no-ops if the page is open outside a real battle.
   *
   * @param {{ code: string, language: string, timeRemaining: number }} params
   */
  const submitBattleResult = ({ code, language, timeRemaining: remainingTime }) => {
    if (hasAutoSubmittedRef.current || isWaiting || battleNote || !battle?.battleId) {
      return;
    }

    const activeSocket = establishSocketConnection();
    if (!activeSocket) {
      setOutput(<div className="text-red-400">Socket connection unavailable.</div>);
      return;
    }

    hasAutoSubmittedRef.current = true;
    activeSocket.emit("battleEnded", {
      battleDetails: {
        battleId: battle.battleId,
        timeRemaining: remainingTime,
        language,
      },
      userId,
      code,
      roomId,
    });

    setIsWaiting(true);
    persistWaitingState(true);
  };

  /**
   * Countdown interval effect.
   *
   * - Runs every 1 s and calls `getSyncedTimeRemaining` (rather than decrementing
   *   a counter) so drift never accumulates.
   * - Skipped if the battle is already resolved (`isWaiting`, `battleNote`) or
   *   if the timer is already at 0.
   * - Auto-submits with current code/language when `syncedTimeRemaining` hits 0.
   */
  useEffect(() => {
    const activeSocket = establishSocketConnection();
    if (!activeSocket) return undefined;

    // Skip if already resolved or timer has expired
    if (isWaiting || battleNote) return undefined;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs) <= 0) {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      const syncedTimeRemaining = getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs);
      setTimeRemaining(syncedTimeRemaining);

      // Auto-submit when time runs out
      if (syncedTimeRemaining <= 0 && !hasAutoSubmittedRef.current && battle?.battleId) {
        hasAutoSubmittedRef.current = true;
        activeSocket.emit("battleEnded", {
          battleDetails: {
            battleId: battle.battleId,
            timeRemaining: 0,
            language: parentLanguage,
          },
          userId,
          code: parentCode,
          roomId,
        });
        setIsWaiting(true);
        persistWaitingState(true);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [
    battle?.battleId,
    battleDurationSeconds,
    battleEndsAt,
    battleNote,
    isWaiting,
    parentCode,
    parentLanguage,
    roomId,
    serverTimeOffsetMs,
    userId,
  ]);

  /**
   * Socket.IO listener for the `battleResult` event.
   *
   * Mounted once on component mount and never torn down unless the component
   * unmounts.  Accepts both legacy string notes ("won"/"loss"/"draw") and
   * the newer object payload `{ result, battleResultDetails, ... }`.
   */
  useEffect(() => {
    const activeSocket = establishSocketConnection();
    if (!activeSocket) return undefined;

    const handleBattleResult = (note) => {
      const normalizedNote = typeof note === "string" ? note : (note?.result || "");
      const details = note && typeof note === "object" ? note : null;

      setBattleNote(normalizedNote);
      setBattleResultDetails(details);
      setIsWaiting(false);
      persistBattleResult(normalizedNote, details);
      persistWaitingState(false);
    };

    activeSocket.on("battleResult", handleBattleResult);
    return () => activeSocket.off("battleResult", handleBattleResult);
  }, []);

  /**
   * Runs the user's code against sample tests via the `/run` endpoint.
   * Displays the result in the output tab without triggering battle submission.
   *
   * @param {string} code
   * @param {string} language
   * @param {object} activeProblem
   */
  const handleRunCode = async (code, language, activeProblem) => {
    setActiveTab("output");
    setOutput(<div className="text-gray-400">Running...</div>);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${SERVER_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, language, problem: activeProblem }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      setOutput(<ErrorFormatter data={data} />);

      if (data.isError) {
        addNotification(`${data.errorType}`, "error");
      } else {
        addNotification("All test cases passed", "success");
      }
    } catch (error) {
      console.error(error);
      setOutput(
        <div className="text-red-400">
          <div className="mb-2 font-semibold">Error running code</div>
          <div className="text-sm">{error.message}</div>
        </div>,
      );
      addNotification("Failed to execute code", "error");
    }
  };

  /**
   * Submits the user's code against all hidden tests via the `/submit` endpoint.
   * On full-pass, emits `battleEnded` to the server to finalise the battle.
   *
   * Guards against:
   * - Re-submission after a result has already been received.
   * - Submission while the server is already processing the battle.
   *
   * @param {string} code
   * @param {string} language
   * @param {object} activeProblem
   */
  const handleSubmit = async (code, language, activeProblem) => {
    if (hasAutoSubmittedRef.current || isWaiting || battleNote) return;

    setActiveTab("output");
    setOutput(<div className="text-gray-400">Submitting...</div>);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${SERVER_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, language, problem: activeProblem }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      setOutput(<ErrorFormatter data={data} />);

      if (data.isError) {
        addNotification(`${data.errorType}`, "error");
        return;
      }

      addNotification("All test cases passed successfully!", "success");
      submitBattleResult({
        code,
        language,
        timeRemaining: getSyncedTimeRemaining(battleEndsAt, battleDurationSeconds, serverTimeOffsetMs),
      });
    } catch (error) {
      console.error(error);
      setOutput(
        <div className="text-red-400">
          <div className="mb-2 font-semibold">Error submitting code</div>
          <div className="text-sm">{error.message}</div>
        </div>,
      );
      addNotification("Failed to submit code", "error");
    }
  };

  /**
   * Clears all battle sessionStorage keys and navigates back to the dashboard.
   * Called when the user clicks "Return to Dashboard" in the result modal.
   */
  const handleDashboardRedirect = () => {
    clearBattleSession();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        addNotification={addNotification}
        timeRemaining={timeRemaining}
        battleId={battle?.battleId}
        roomId={roomId}
      />
      {/* Dim and disable interactions while waiting for the result */}
      <div
        className={`main-container flex h-[calc(100vh-70px)] gap-[2px] overflow-hidden bg-transparent ${
          isWaiting || battleNote ? "pointer-events-none blur-sm" : ""
        }`}
      >
        <QuestionPanel
          problem={problem}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          output={output}
        />
        <EditorPanel
          onRun={handleRunCode}
          onSubmit={handleSubmit}
          problem={problem}
          setParentCode={setParentCode}
          setParentLanguage={setParentLanguage}
        />
      </div>
      {notifications.map((notification) => (
        <Notification key={notification.id} message={notification.message} type={notification.type} />
      ))}
      <BattleResultModal
        battleNote={battleNote}
        battleResultDetails={battleResultDetails}
        isWaiting={isWaiting}
        onReturnToDashboard={handleDashboardRedirect}
        showModal={showModal}
      />
    </div>
  );
}

export default BattlePage;
