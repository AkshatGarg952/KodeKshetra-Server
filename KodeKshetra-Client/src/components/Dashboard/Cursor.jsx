import { useState, useEffect } from 'react';

function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const dashboardSymbols = ['{ }', '[ ]', '< >', '( )', '//', '++', '==', '!=', '->', '=>'];
  let symbolIndex = 0;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (Math.random() > 0.85) {
        const newTrail = {
          id: Date.now(),
          x: e.clientX + (Math.random() - 0.5) * 50,
          y: e.clientY + (Math.random() - 0.5) * 50,
          symbol: dashboardSymbols[symbolIndex % dashboardSymbols.length],
        };
        setTrail((prev) => [...prev, newTrail]);
        symbolIndex++;
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
        className="cursor fixed w-5 h-5 rounded-full bg-gradient-dashboard pointer-events-none z-[9999] mix-blend-screen transition-all duration-150 shadow-[0_0_25px_var(--neon-cyan)]"
        style={{ left: position.x - 10, top: position.y - 10 }}
        aria-hidden="true"
      ></div>
      {trail.map((t) => (
        <div
          key={t.id}
          className="cursor-trail fixed text-neon-cyan font-jetbrains text-xs font-medium transition-opacity duration-400 z-[9998] drop-shadow-[0_0_8px_var(--neon-cyan)]"
          style={{ left: t.x, top: t.y, opacity: 1 }}
          aria-hidden="true"
        >
          {t.symbol}
        </div>
      ))}
    </>
  );
}

export default Cursor;