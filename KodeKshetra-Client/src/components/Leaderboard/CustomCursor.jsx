import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const leaderboardSymbols = ['#1', '#2', '#3', 'TOP', 'WIN', 'FAST', 'HOT', 'RANK', 'STAR', 'ACE'];
  let symbolIndex = 0;

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return; // Disable cursor on touch devices

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      if (Math.random() > 0.85) {
        const newTrail = {
          id: Date.now(),
          x: e.clientX + (Math.random() - 0.5) * 50,
          y: e.clientY + (Math.random() - 0.5) * 50,
          symbol: leaderboardSymbols[symbolIndex % leaderboardSymbols.length],
        };
        symbolIndex++;
        setTrail((prev) => [...prev, newTrail]);

        setTimeout(() => {
          setTrail((prev) => prev.filter((t) => t.id !== newTrail.id));
        }, 800);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        className="fixed w-5 h-5 bg-gradient-leaderboard rounded-full pointer-events-none z-50 mix-blend-screen transition-all duration-150 ease-out shadow-[0_0_25px_var(--electric-cyan)] hidden sm:block"
        style={{ left: position.x - 10, top: position.y - 10 }}
        aria-hidden="true"
      />
      {trail.map((t) => (
        <div
          key={t.id}
          className="fixed text-electric-cyan font-jetbrains text-xs font-medium opacity-0 transition-opacity duration-400 ease-out shadow-[0_0_8px_var(--electric-cyan)] hidden sm:block"
          style={{ left: t.x, top: t.y, animation: 'fadeInOut 0.8s ease' }}
        >
          {t.symbol}
        </div>
      ))}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
