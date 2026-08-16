import React from 'react';
import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const Notification = ({ message, type }) => {
  return (
    <div
      className="fixed top-20 sm:top-24 right-4 sm:right-5 bg-gradient-leaderboard text-white p-3 sm:p-4 rounded-xl border-2 border-electric-cyan backdrop-blur-3xl shadow-[0_8px_25px_rgba(6,182,212,0.3)] z-[10000] animate-[slideIn_0.4s_ease_forwards] animate-[slideOut_0.4s_ease_3s_forwards]"
    >
      <div className="flex items-center gap-2 text-sm sm:text-base">
        {type === 'info' ? <FaInfoCircle /> : <FaCheckCircle />}
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Notification;
