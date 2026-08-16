import React from 'react';

function Notification({ message, type }) {
  const bgClass =
    type === 'success'
      ? 'bg-[linear-gradient(45deg,#2cff05,#00ff88)] border-[2px_solid_#2cff05]'
      : type === 'warning'
      ? 'bg-[linear-gradient(45deg,#ff8800,#ffaa00)] border-[2px_solid_#ff8800]'
      : 'bg-[linear-gradient(45deg,#00c6ff,#7928ca)] border-[2px_solid_#00c6ff]';

  return (
    <div
      className={`notification fixed top-5 right-5 p-4 rounded-xl text-white font-semibold z-[1000] animate-slide-in shadow-[0_4px_15px_rgba(0,0,0,0.3)] backdrop-blur-[10px] ${bgClass}`}
    >
      {message}
    </div>
  );
}

export default Notification;