/**
 * WaitingPage2 — Matchmaking Queue Waiting Screen
 *
 * Shown after the user clicks "Find Match" from the Dashboard and enters the
 * public matchmaking queue.
 *
 * Socket event flow:
 *   1. On mount: emits `joinQueue` (queues the user server-side) and
 *      `resumeBattleState` (detects an already-matched battle after a refresh).
 *   2. `matchmakingQueued`         – Server acknowledged the queue entry; persist
 *      the server timestamp for later `resumeBattleState` lookups.
 *   3. `battleStart`               – A match was found; navigate to /battlepage.
 *   4. `cancelMatchmakingResponse` – Server confirmed cancellation; navigate to /dashboard.
 *   5. `matchmakingError`          – Error entering the queue; alert and redirect.
 *   6. `battleResult`              – Rare edge case: battle already resolved (e.g.
 *      user refreshed right as the battle ended); persist result and redirect.
 *   7. `connect_error`             – Socket failed to connect; redirect to dashboard.
 *   8. `connect`                   – Socket reconnected; re-emit `joinQueue` to
 *      stay in the queue across brief disconnects.
 *   9. Cleanup: all listeners are removed on unmount.
 */
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faCircleNotch,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { establishSocketConnection } from "./components/socket.js";
import {
  getStoredMatchmakingQueuedServerNow,
  persistBattleResult,
  persistMatchmakingQueuedServerNow,
} from "./features/battle/sessionStorage.js";
import "./index.css";

function WaitingPage2() {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Guard that prevents duplicate navigations when multiple socket events fire
   * simultaneously (e.g. battleStart + connect both fire on reconnect).
   * @type {React.MutableRefObject<boolean>}
   */
  const hasNavigatedRef = useRef(false);

  const { mode, topic } = location.state || {};
  const initialBattle = location.state?.battle || null;
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    document.querySelector(".main-container")?.classList.add("animate-fadeIn");

    // Guard: must have an authenticated user with a selected mode and topic
    if (!userId || !mode || !topic) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const activeSocket = establishSocketConnection();
    if (!activeSocket) {
      alert("Unable to connect to matchmaking right now. Please log in again.");
      navigate("/dashboard", { replace: true });
      return;
    }

    /**
     * Handles the `battleStart` event emitted by the server when a match is found.
     * Computes the server-client clock offset and navigates to the battle page.
     */
    const handleBattleStart = ({
      question,
      battleId,
      mode: battleMode,
      topic: battleTopic,
      battleType,
      opponent,
      battleEndsAt,
      battleStartedAt,
      battleDurationSeconds,
      serverNow,
      roomId,
    }) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      persistMatchmakingQueuedServerNow(null);

      const serverTimeOffsetMs = typeof serverNow === "number" ? serverNow - Date.now() : 0;

      navigate("/battlepage", {
        state: {
          battle: {
            topic: battleTopic || topic,
            mode: battleMode || mode,
            question,
            battleId,
            battleType,
            opponent,
            battleEndsAt,
            battleStartedAt,
            battleDurationSeconds,
            serverTimeOffsetMs,
          },
          roomId: roomId || null,
        },
        replace: true,
      });
    };

    /**
     * Handles the `cancelMatchmakingResponse` event.
     * On success, clears the stored queue timestamp and redirects to the dashboard.
     */
    const handleCancelMatchmakingResponse = ({ success, message }) => {
      if (success) {
        persistMatchmakingQueuedServerNow(null);
        navigate("/dashboard", { replace: true });
      } else {
        alert(message);
      }
    };

    /**
     * Handles the `matchmakingError` event when the server cannot queue the user.
     */
    const handleMatchmakingError = ({ message }) => {
      alert(message || "Unable to join matchmaking right now.");
      navigate("/dashboard", { replace: true });
    };

    /**
     * Handles the `battleResult` event for edge cases where the battle resolved
     * while the user was on this waiting screen (e.g. an instant timeout).
     */
    const handleBattleResult = (note) => {
      const normalizedNote = typeof note === "string" ? note : (note?.result || "");
      const details = note && typeof note === "object" ? note : null;
      const battleContext = details?.battleContext || initialBattle;
      persistMatchmakingQueuedServerNow(null);
      persistBattleResult(normalizedNote, details);
      navigate("/battlepage", {
        state: { battle: battleContext, roomId: null },
        replace: true,
      });
    };

    /**
     * Handles socket transport errors.
     */
    const handleConnectError = () => {
      alert("Matchmaking connection dropped. Please try joining queue again.");
      navigate("/dashboard", { replace: true });
    };

    /**
     * Emits queue-entry events.
     * Also sends `resumeBattleState` so the server can push an already-started
     * battle if the user refreshed during queue wait or just after match-found.
     */
    const emitJoinQueue = () => {
      activeSocket.emit("joinQueue", { userId, mode, topic });
      activeSocket.emit("resumeBattleState", {
        battleId: null,
        roomId: null,
        queuedServerNow: getStoredMatchmakingQueuedServerNow(),
      });
    };

    /**
     * Persists the server-side queue entry timestamp for reliable resume detection.
     */
    const handleMatchmakingQueued = ({ serverNow }) => {
      persistMatchmakingQueuedServerNow(serverNow);
    };

    activeSocket.on("battleStart", handleBattleStart);
    activeSocket.on("cancelMatchmakingResponse", handleCancelMatchmakingResponse);
    activeSocket.on("matchmakingError", handleMatchmakingError);
    activeSocket.on("matchmakingQueued", handleMatchmakingQueued);
    activeSocket.on("battleResult", handleBattleResult);
    activeSocket.on("connect_error", handleConnectError);
    activeSocket.on("connect", emitJoinQueue);
    emitJoinQueue();

    // Cleanup: remove all listeners when the component unmounts
    return () => {
      activeSocket.off("battleStart", handleBattleStart);
      activeSocket.off("cancelMatchmakingResponse", handleCancelMatchmakingResponse);
      activeSocket.off("matchmakingError", handleMatchmakingError);
      activeSocket.off("matchmakingQueued", handleMatchmakingQueued);
      activeSocket.off("battleResult", handleBattleResult);
      activeSocket.off("connect_error", handleConnectError);
      activeSocket.off("connect", emitJoinQueue);
    };
  }, [initialBattle, navigate, userId, mode, topic]);

  /**
   * Emits `cancelMatchmaking` to remove the user from the server queue.
   * The server will respond with `cancelMatchmakingResponse`.
   */
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel matchmaking?")) {
      const activeSocket = establishSocketConnection();
      activeSocket?.emit("cancelMatchmaking", { userId, mode, topic });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 md:p-8 bg-black/95 backdrop-blur-xl border-b-2 border-gradient-fire shadow-lg h-[70px] relative animate-neon-pulse">
        <div className="relative flex items-center">
          <span className="text-2xl md:text-[26px] font-extrabold text-gradient-void uppercase tracking-wider z-10">
            KodeKshetra
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] gradient-void rounded-full opacity-20 blur-xl z-0 animate-logo-glow" />
        </div>
        <div className="flex gap-6 md:gap-8">
          <a href="#home" className="text-gray-400 text-base md:text-lg font-semibold hover:text-cyan-400 hover:text-shadow-cyan transition-colors">
            Home
          </a>
          <a href="#profile" className="text-gray-400 text-base md:text-lg font-semibold hover:text-cyan-400 hover:text-shadow-cyan transition-colors">
            Profile
          </a>
          <a href="#logout" className="text-gray-400 text-base md:text-lg font-semibold hover:text-cyan-400 hover:text-shadow-cyan transition-colors">
            Logout
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-container flex-1 flex justify-center items-center p-4 md:p-8 bg-radial-gradients">
        <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-blue-400 rounded-2xl p-4 md:p-8 max-w-xl w-full text-center shadow-2xl animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-cyber mb-6 text-shadow-blue">
            Matchmaking is in Progress
          </h1>
          <div className="text-4xl md:text-5xl text-green-400 mb-6 animate-spin animate-neon-flicker">
            <FontAwesomeIcon icon={faSpinner} />
          </div>
          <div className="text-base md:text-lg text-gray-400 mb-8 font-mono">
            Waiting for a suitable opponent for you...
          </div>
          <div className="bg-black/80 border-2 border-pink-600 rounded-xl p-5 mb-8 shadow-glow-pink">
            <div className="flex items-center gap-3 text-base md:text-lg text-white mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-green-400 text-shadow-green" />
              <span>You</span>
            </div>
            <div className="flex items-center gap-3 text-base md:text-lg text-white">
              <FontAwesomeIcon icon={faCircleNotch} className="text-xl text-gray-500 animate-pulse" />
              <span>Opponent (Searching...)</span>
            </div>
          </div>
          <button
            className="cancel-btn relative flex items-center gap-2 bg-gradient-fire text-black py-3 px-6 md:px-7 rounded-xl text-sm md:text-base font-bold uppercase tracking-wide border-2 border-pink-600 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            Cancel Matchmaking
            <div className="btn-glow rounded-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaitingPage2;
