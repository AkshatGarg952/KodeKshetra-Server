import React, { useEffect, useState } from 'react';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0, symbol: '', visible: false });

  const codeSymbols = ['{ }', '[ ]', '( )', '< >', '&& ', '|| ', '++', '--', '=>', '==', '!=', '+=', '/*', '*/', '//', '...'];
  let symbolIndex = 0;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Enhanced trail effect
      if (Math.random() > 0.88) {
        const symbol = codeSymbols[symbolIndex % codeSymbols.length];
        setTrail({
          x: e.clientX + (Math.random() - 0.5) * 40,
          y: e.clientY + (Math.random() - 0.5) * 40,
          symbol,
          visible: true
        });
        
        setTimeout(() => {
          setTrail(prev => ({ ...prev, visible: false }));
        }, 600);
        
        symbolIndex++;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div 
        className="fixed w-5 h-5 rounded-full pointer-events-none z-[9999] mix-blend-screen transition-all duration-150 ease-out"
        style={{
          left: position.x - 10,
          top: position.y - 10,
          background: 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
          boxShadow: '0 0 25px #00BFFF'
        }}
      />
      <div 
        className={`fixed pointer-events-none z-[9998] text-cyan-400 font-mono text-xs font-medium transition-opacity duration-400 ${trail.visible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: trail.x,
          top: trail.y,
          filter: 'drop-shadow(0 0 8px currentColor)'
        }}
      >
        {trail.symbol}
      </div>
    </>
  );
};

export default Cursor;