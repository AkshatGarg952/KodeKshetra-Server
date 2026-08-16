import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { SERVER_URL } from '../../config.js';
import { disconnectSocket } from '../socket.js';

const LogoutModal = ({ setShowModal }) => {
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    if (!loading) setShowModal(false); // prevent closing while logging out
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${SERVER_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to logout");
      }

      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      disconnectSocket();

      window.location.href = "/";
    } catch (error) {
      alert("Cannot logout. Please try again.");
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[10000] flex items-center justify-center animate-[fadeIn_0.3s_ease]"
      onClick={closeModal}
    >
      <div
        className={`relative bg-[linear-gradient(145deg,rgba(30,41,59,0.95),rgba(13,13,13,0.9))] rounded-2xl p-4 sm:p-8 border-2 border-battle-crimson shadow-[0_20px_60px_rgba(239,68,68,0.3)] text-center max-w-[90%] sm:max-w-md animate-[scaleIn_0.3s_ease] ${loading ? "blur-sm pointer-events-none" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-20">
            <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-battle-crimson/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-battle-crimson text-3xl sm:text-4xl">
          <FaSignOutAlt />
        </div>
        <h3 className="text-text-primary mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Confirm Logout</h3>
        <p className="text-text-secondary mb-6 sm:mb-8 text-sm sm:text-base">
          Are you sure you want to leave the arena? Your current session will be ended.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-text-muted bg-transparent text-text-secondary rounded-xl font-space transition-all duration-300 hover:bg-text-muted/20 text-sm sm:text-base disabled:opacity-50"
            onClick={closeModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-battle-crimson bg-battle-crimson text-white rounded-xl font-space transition-all duration-300 hover:bg-battle-crimson/80 text-sm sm:text-base disabled:opacity-50"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LogoutModal;
