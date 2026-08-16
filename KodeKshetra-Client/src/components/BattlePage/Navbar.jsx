import React from "react";
import { useNavigate } from "react-router-dom"; // React Router v6+
import { establishSocketConnection } from "../socket.js"

function Navbar({ addNotification, timeRemaining, battleId, roomId }) {
  const navigate = useNavigate();

  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const userId = sessionStorage.getItem("userId");

  const handleLeaveBattle = async () => {
    const confirmed = window.confirm("Are you sure you want to leave the battle?");
    if (confirmed) {
      addNotification("You have left the battle!", "warning");
      // Emit the event as per your description
      const activeSocket = establishSocketConnection();
      activeSocket?.emit("battleEnded", {
        battleDetails: { battleId }, // add other battleDetails if needed
        userId,
        code: null,
        roomId,
        lost: true
      });
      // Redirect to dashboard, replacing history
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <nav className="navbar flex justify-between items-center p-4 bg-[rgba(0,0,0,0.95)] backdrop-blur-[25px] border-b-2 border-[var(--gradient-fire)] shadow-primary h-[70px] relative before:content-[''] before:absolute before:bottom-[-2px] before:left-0 before:w-full before:h-[2px] before:bg-gradient-fire before:animate-neon-pulse">
      {/* Left Logo */}
      <div className="navbar-left">
        <div className="logo relative flex items-center">
          <span className="logo-text text-2xl font-extrabold bg-gradient-plasma bg-clip-text text-transparent uppercase tracking-wider">
            KodeKshetra
          </span>
          <div className="logo-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-plasma rounded-full opacity-20 blur-[10px] animate-logo-glow-alt z-[1]"></div>
        </div>
      </div>

      {/* Timer */}
      <div className="navbar-center">
        <div className="timer flex items-center gap-2 bg-[rgba(13,13,13,0.8)] backdrop-blur-[10px] p-3 rounded-[20px] border-2 border-matrix-green shadow-[0_0_20px_rgba(0,191,255,0.6)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(57,255,20,0.2),transparent)] before:animate-timer-sweep">
          <i className="fas fa-clock text-matrix-green text-lg text-shadow-green"></i>
          <span
            id="timer"
            className={`timer-text font-fira-code text-xl font-bold text-text-primary text-shadow-green ${timeRemaining < 300 ? "text-neon-pink animate-neon-flicker" : ""
              }`}
          >
            {formatTime()}
          </span>
        </div>
      </div>

      {/* Leave Battle Button */}
      <div className="navbar-right">
        <button
          className="leave-battle-btn relative flex items-center gap-2 bg-transparent border-2 border-neon-pink text-neon-pink py-3 px-5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:text-text-primary hover:shadow-glow-pink hover:-translate-y-[2px] overflow-hidden"
          onClick={handleLeaveBattle}
        >
          <i className="fas fa-sign-out-alt"></i>
          Leave Battle
          <div className="btn-glow absolute top-0 left-0 w-full h-full bg-gradient-void opacity-0 transition-opacity duration-300 hover:opacity-30 z-[-1]"></div>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
