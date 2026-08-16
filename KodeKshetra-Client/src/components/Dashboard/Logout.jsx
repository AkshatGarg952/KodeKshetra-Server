import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { SERVER_URL } from '../../config.js';
import { disconnectSocket } from '../socket.js';

const LogoutModal = ({ setShowModal, showNotification }) => {
  const closeModal = () => setShowModal(false);

  const handleLogout = async () => {
    try {
      closeModal();
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${SERVER_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to logout");

      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      disconnectSocket();

      window.location.href = "/";
    } catch (error) {
      alert("Cannot logout. Please try again.");
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      onClick={closeModal}
    >
      <div
        className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-2xl p-6 sm:p-8 border-2 border-red-600 shadow-[0_20px_60px_rgba(255,69,0,0.3)] text-center max-w-sm w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-red-600 text-3xl sm:text-4xl">
          <FaSignOutAlt />
        </div>
        <h3 className="text-white mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">
          Confirm Logout
        </h3>
        <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
          Are you sure you want to leave the arena? Your current session will be ended.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-500 bg-transparent text-gray-300 rounded-xl font-medium hover:bg-gray-500/20 text-sm sm:text-base transition"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-red-600 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 text-sm sm:text-base transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default LogoutModal;
