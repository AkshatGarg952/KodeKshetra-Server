/**
 * WaitingPage1 — Private Room Waiting Screen
 *
 * Shown after the user creates a private battle room and waits for an opponent to join.
 *
 * Socket event flow:
 *   1. On mount:   emits `joinBattleRoom` and `resumeBattleState` so the user re-joins
 *      the room after a page refresh without losing their slot.
 *   2. `battleStart`       – Opponent has joined; navigate to /battlepage.
 *   3. `battleJoinError`   – Room is full or invalid; navigate back to /dashboard.
 *   4. `battleResult`      – Battle already finalised (e.g. opponent won while this
 *      user was disconnected); persist result and navigate to /battlepage to show modal.
 *   5. `connect`           – Socket reconnected; re-emit join events so the server
 *      remembers this socket.
 *   6. Cleanup:  all listeners are removed on unmount to prevent memory leaks.
 */
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faCircleNotch,
  faTimesCircle,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { establishSocketConnection } from "./components/socket.js";
import { persistBattleResult } from "./features/battle/sessionStorage.js";
import "./index.css";

const WaitingPage1 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Guard that prevents duplicate navigations when multiple socket events fire
   * simultaneously (e.g. battleStart + connect both fire on reconnect).
   * @type {React.MutableRefObject<boolean>}
   */
  const hasNavigatedRef = useRef(false);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const { roomId, battle } = location.state || {};
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    document.querySelector(".main-container")?.classList.add("animate-fadeIn");

    // Guard: must have a valid room and authenticated user
    if (!roomId || !userId) {
      navigate("/dashboard", { replace: true });
      return;
    }

    /**
     * Handles the `battleStart` server event.
     * Calculates a clock-offset to keep the battle timer in sync with the server.
     */
    const handleBattleStart = ({
      question,
      battleId,
      mode,
      topic,
      battleEndsAt,
      battleStartedAt,
      battleDurationSeconds,
      battleType,
      serverNow,
      roomId: activeRoomId,
    }) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      const serverTimeOffsetMs = typeof serverNow === "number" ? serverNow - Date.now() : 0;

      navigate("/battlepage", {
        state: {
          battle: {
            mode: mode || battle?.mode,
            topic: topic || battle?.topic,
            question,
            battleId,
            battleType,
            battleEndsAt,
            battleStartedAt,
            battleDurationSeconds,
            serverTimeOffsetMs,
          },
          roomId: activeRoomId || roomId,
        },
        replace: true,
      });
    };

    /**
     * Handles the `battleJoinError` server event.
     * Sends the user back to the dashboard when the room cannot be joined.
     */
    const handleBattleJoinError = () => {
      navigate("/dashboard", { replace: true });
    };

    /**
     * Handles the `battleResult` server event emitted when the battle was
     * already resolved (e.g. the user refreshed mid-result screen).
     * Persists the result and redirects to the battle page to display the modal.
     */
    const handleBattleResult = (note) => {
      const normalizedNote = typeof note === "string" ? note : (note?.result || "");
      const details = note && typeof note === "object" ? note : null;
      const battleContext = details?.battleContext || battle || null;
      persistBattleResult(normalizedNote, details);
      navigate("/battlepage", {
        state: { battle: battleContext, roomId },
        replace: true,
      });
    };

    const activeSocket = establishSocketConnection();
    if (!activeSocket) {
      navigate("/dashboard", { replace: true });
      return undefined;
    }

    /**
     * Emits the join events to the server.
     * Called both on initial mount and on socket reconnection.
     */
    const joinRoom = () => {
      activeSocket.emit("joinBattleRoom", { battle, userId, roomId });
      activeSocket.emit("resumeBattleState", {
        battleId: battle?.battleId || null,
        roomId,
      });
    };

    activeSocket.on("battleStart", handleBattleStart);
    activeSocket.on("battleJoinError", handleBattleJoinError);
    activeSocket.on("battleResult", handleBattleResult);
    activeSocket.on("connect", joinRoom);
    joinRoom();

    // Cleanup: remove all listeners when the component unmounts
    return () => {
      activeSocket.off("battleStart", handleBattleStart);
      activeSocket.off("battleJoinError", handleBattleJoinError);
      activeSocket.off("battleResult", handleBattleResult);
      activeSocket.off("connect", joinRoom);
    };
  }, [battle, navigate, roomId, userId]);

  /**
   * Confirmed leave handler.
   * Emits `leaveBattleRoom` so the server cleans up the room state,
   * then redirects to the dashboard.
   */
  const handleLeaveConfirmed = () => {
    const activeSocket = establishSocketConnection();
    activeSocket?.emit("leaveBattleRoom", { userId, roomId });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col overflow-hidden">
      <nav className="flex justify-between items-center p-4 md:p-8 bg-black/95 backdrop-blur-xl border-b-2 border-gradient-fire shadow-lg h-[70px] relative animate-neon-pulse">
        <div className="relative flex items-center">
          <span className="text-2xl md:text-[26px] font-extrabold text-gradient-void uppercase tracking-wider z-10">
            KodeKshetra
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] gradient-void rounded-full opacity-20 blur-xl z-0 animate-logo-glow" />
        </div>
        <div className="flex gap-6 md:gap-8">
          <a href="#home" className="text-gray-400 text-base md:text-lg font-semibold hover:text-cyan-400 transition-colors">
            Home
          </a>
          <a href="#profile" className="text-gray-400 text-base md:text-lg font-semibold hover:text-cyan-400 transition-colors">
            Profile
          </a>
        </div>
      </nav>

      <div className="main-container flex-1 flex justify-center items-center p-4 md:p-8 bg-radial-gradients">
        <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-blue-400 rounded-2xl p-6 md:p-8 max-w-xl w-full text-center shadow-2xl animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-cyber mb-6 text-shadow-blue">
            Room Creation in Process
          </h1>
          <div className="text-4xl md:text-5xl text-green-400 mb-6 animate-spin animate-neon-flicker">
            <FontAwesomeIcon icon={faSpinner} />
          </div>
          <div className="text-base md:text-lg text-gray-400 mb-8 font-mono">
            Waiting for the opponent to join the Room...
          </div>
          <div className="bg-black/80 border-2 border-pink-600 rounded-xl p-5 mb-8 shadow-glow-pink">
            <div className="flex items-center gap-3 text-base md:text-lg text-white mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-green-400 text-shadow-green" />
              <span>You</span>
            </div>
            <div className="flex items-center gap-3 text-base md:text-lg text-white">
              <FontAwesomeIcon icon={faCircleNotch} className="text-xl text-gray-500 animate-pulse" />
              <span>Opponent (Waiting...)</span>
            </div>
          </div>

          {/* Inline leave confirmation — avoids browser `confirm()` which blocks the event loop */}
          {!showLeaveConfirm ? (
            <button
              className="cancel-btn relative flex items-center gap-2 mx-auto bg-gradient-fire text-black py-3 px-6 md:px-7 rounded-xl text-sm md:text-base font-bold uppercase tracking-wide border-2 border-pink-600 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              onClick={() => setShowLeaveConfirm(true)}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              Leave Room
              <div className="btn-glow rounded-xl" />
            </button>
          ) : (
            <div className="animate-fadeIn">
              <p className="text-sm text-gray-300 mb-4">Are you sure you want to leave the room?</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2.5 px-5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)]"
                  onClick={handleLeaveConfirmed}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Yes, Leave
                </button>
                <button
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => setShowLeaveConfirm(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Stay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingPage1;
