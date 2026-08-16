import React, { useEffect, useState } from 'react';
import BattleArena from './BattleArena';

const Hero = () => {
  const [particles, setParticles] = useState([]); 
  const [showBattle, setShowBattle] = useState(false);

  useEffect(() => {
    // Generate floating particles
    const particleSymbols = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'class', 'import', 'export', 'async', 'await', '=>', '{}', '[]', '()', 
      'true', 'false', 'null', 'undefined', 'console.log', 'map', 'filter', 'reduce'
    ];

    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      symbol: particleSymbols[Math.floor(Math.random() * particleSymbols.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 8,
      color: i % 2 === 0 ? 'text-cyan-400' : i % 3 === 0 ? 'text-purple-400' : i % 4 === 0 ? 'text-orange-400' : 'text-green-400'
    }));

    setParticles(newParticles);

    // Trigger battle animation after component mounts
    setTimeout(() => {
      setShowBattle(true);
    }, 500);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
      {/* Background Pattern */}
      <div 
        className="absolute top-0 left-0 w-full h-full z-[1]"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(0, 191, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(204, 0, 0, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(255, 69, 0, 0.05) 0%, transparent 50%),
            #000000
          `,
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, rgba(0, 191, 255, 0.1) 100%),
            linear-gradient(45deg, transparent 98%, rgba(204, 0, 0, 0.08) 100%),
            linear-gradient(135deg, transparent 98%, rgba(138, 43, 226, 0.06) 100%)
          `,
          backgroundSize: '150px 150px, 100px 100px, 200px 200px',
          animation: 'patternMove 30s linear infinite'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute w-full h-full z-[2]">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute font-mono text-xs opacity-40 ${particle.color}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              animation: 'particleFloat 12s ease-in-out infinite',
              filter: 'drop-shadow(0 0 6px currentColor)'
            }}
          >
            {particle.symbol}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Hero Header */}
        <div className="text-center">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-tight opacity-0"
            style={{
              background: 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'heroTextReveal 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.8s',
              lineHeight: '1.1',
              letterSpacing: '-0.03em'
            }}
          >
            Code faster than your rival.<br />Win the match.
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-gray-300 mb-8 font-normal opacity-0"
            style={{
              animation: 'heroTextReveal 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.3s'
            }}
          >
            Choose DSA or CP → Set topics → Battle in &lt;60s
          </p>

          {/* Battle Animation Section - Compact */}
          <div className="relative h-72 mb-8 flex items-center justify-center">
            {/* Left Coding Warrior - ENHANCED */}
            <div 
  className={`absolute transition-all duration-1000 ease-out ${
    showBattle ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
  }`}
  style={{
    left: '-20px',
    transitionDelay: '0.2s'
  }}
>
              <div className="relative">
                {/* ULTRA ENHANCED Coding Warrior SVG */}
                <svg
                  width="220"
                  height="300"
                  viewBox="0 0 220 300"
                  className="drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 35px rgba(0, 191, 255, 0.95)) drop-shadow(0 0 50px rgba(0, 255, 255, 0.6))',
                    animation: 'warriorFloat 3s ease-in-out infinite'
                  }}
                >
                  {/* Cyber Cape/Energy Field */}
                  <path
                    d="M 95,60 Q 50,70 40,100 L 35,130 Q 30,160 35,180 L 40,200 Q 45,210 50,200 L 70,150 L 80,100"
                    fill="rgba(0, 191, 255, 0.12)"
                    stroke="#00BFFF"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                    style={{
                      animation: 'energyCape 4s ease-in-out infinite'
                    }}
                  />

                  {/* Advanced Head with AR Headset */}
                  <ellipse
                    cx="110"
                    cy="35"
                    rx="18"
                    ry="20"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  
                  {/* AR/VR Headset - Full wrap */}
                  <path
                    d="M 88,32 L 132,32 L 135,35 L 135,40 L 85,40 L 85,35 Z"
                    fill="rgba(0, 255, 255, 0.5)"
                    stroke="#00FFFF"
                    strokeWidth="2"
                    style={{
                      filter: 'drop-shadow(0 0 10px #00FFFF)',
                      animation: 'headsetPulse 2s ease-in-out infinite'
                    }}
                  />
                  
                  {/* Headset Lens Details */}
                  <rect x="92" y="34" width="12" height="5" fill="#00FFFF" rx="1" opacity="0.8" />
                  <rect x="116" y="34" width="12" height="5" fill="#00FFFF" rx="1" opacity="0.8" />
                  
                  {/* Antenna/Sensors */}
                  <line x1="88" y1="30" x2="85" y2="22" stroke="#00FFFF" strokeWidth="2" />
                  <circle cx="85" cy="20" r="2.5" fill="#00FFFF" style={{ filter: 'drop-shadow(0 0 6px #00FFFF)' }} />
                  <line x1="132" y1="30" x2="135" y2="22" stroke="#00FFFF" strokeWidth="2" />
                  <circle cx="135" cy="20" r="2.5" fill="#00FFFF" style={{ filter: 'drop-shadow(0 0 6px #00FFFF)' }} />
                  
                  {/* Neck Guard with Circuit Pattern */}
                  <polygon
                    points="98,50 122,50 120,62 100,62"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2"
                  />
                  <line x1="102" y1="52" x2="118" y2="52" stroke="#00FFFF" strokeWidth="0.8" opacity="0.6" />
                  <line x1="102" y1="56" x2="118" y2="56" stroke="#00FFFF" strokeWidth="0.8" opacity="0.6" />
                  
                  {/* Advanced Armored Torso with Tech Panels */}
                  <polygon
                    points="110,62 140,80 135,155 85,155 80,80"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="3"
                  />
                  
                  {/* Shoulder Pads - Heavy Armor */}
                  <polygon
                    points="80,80 70,85 72,100 82,95"
                    fill="url(#blueGradient)"
                    stroke="#00FFFF"
                    strokeWidth="2.5"
                  />
                  <polygon
                    points="140,80 150,85 148,100 138,95"
                    fill="url(#blueGradient)"
                    stroke="#00FFFF"
                    strokeWidth="2.5"
                  />
                  
                  {/* Central Power Core - Pulsing */}
                  <polygon
                    points="110,85 122,95 110,105 98,95"
                    fill="rgba(0, 255, 255, 0.4)"
                    stroke="#00FFFF"
                    strokeWidth="2"
                  />
                  <circle
                    cx="110"
                    cy="95"
                    r="6"
                    fill="#00FFFF"
                    style={{
                      filter: 'drop-shadow(0 0 15px #00FFFF)',
                      animation: 'corePulse 1.2s ease-in-out infinite'
                    }}
                  />
                  
                  {/* Tech Panel Lines - Chest */}
                  <line x1="90" y1="115" x2="130" y2="115" stroke="#00FFFF" strokeWidth="2" opacity="0.8" />
                  <line x1="90" y1="125" x2="118" y2="125" stroke="#00FFFF" strokeWidth="2" opacity="0.6" />
                  <line x1="102" y1="125" x2="130" y2="125" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="90" y1="135" x2="125" y2="135" stroke="#00FFFF" strokeWidth="2" opacity="0.7" />
                  
                  {/* Circuit Pattern on Chest */}
                  <circle cx="95" cy="120" r="2" fill="#00FFFF" opacity="0.8" />
                  <circle cx="125" cy="120" r="2" fill="#00FFFF" opacity="0.8" />
                  <circle cx="110" cy="130" r="2" fill="#00FFFF" opacity="0.8" />
                  
                  {/* Left Arm - Cybernetic with Data Blade */}
                  <polygon
                    points="80,80 55,95 50,115 45,112 42,108 48,88 65,75"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  
                  {/* Forearm Tech Armor */}
                  <polygon
                    points="50,115 45,112 30,135 35,142"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  <line x1="48" y1="118" x2="38" y2="130" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="44" y1="122" x2="34" y2="134" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  
                  {/* DATA BLADE - Glowing Energy Sword */}
                  <g style={{ filter: 'drop-shadow(0 0 12px #00FFFF)' }}>
                    <path
                      d="M 35,142 L 28,152 L 18,175 L 15,185 L 12,195 L 16,197 L 20,187 L 24,177 L 32,155 L 38,145"
                      fill="rgba(0, 255, 255, 0.25)"
                      stroke="#00FFFF"
                      strokeWidth="3"
                      style={{ animation: 'bladeGlow 1.5s ease-in-out infinite' }}
                    />
                    <path
                      d="M 20,155 L 17,165 L 15,175 L 14,185 L 13,192"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                  </g>
                  
                  {/* Blade Handle/Hilt */}
                  <rect
                    x="32"
                    y="140"
                    width="8"
                    height="14"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2"
                    rx="2"
                  />
                  <circle cx="36" cy="147" r="2" fill="#00FFFF" />
                  
                  {/* Right Arm - Extended with Multiple Holographic Screens */}
                  <polygon
                    points="140,80 165,95 170,115 175,112 178,108 172,88 155,75"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  
                  {/* Forearm with Gauntlet */}
                  <polygon
                    points="170,115 175,112 188,130 183,138"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  <line x1="172" y1="118" x2="182" y2="128" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="176" y1="122" x2="186" y2="132" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  
                  {/* Multi-Screen Holographic Display */}
                  <g style={{ filter: 'drop-shadow(0 0 12px #00FFFF)' }}>
                    {/* Main Screen */}
                    <rect
                      x="178"
                      y="125"
                      width="35"
                      height="28"
                      fill="rgba(0, 191, 255, 0.15)"
                      stroke="#00FFFF"
                      strokeWidth="2.5"
                      rx="3"
                      style={{ animation: 'screenGlow 2s ease-in-out infinite' }}
                    />
                    {/* Code Lines on Main Screen */}
                    <line x1="182" y1="131" x2="206" y2="131" stroke="#00FFFF" strokeWidth="1.2" opacity="0.9" />
                    <line x1="182" y1="136" x2="202" y2="136" stroke="#00FFFF" strokeWidth="1.2" opacity="0.7" />
                    <line x1="182" y1="141" x2="208" y2="141" stroke="#00FFFF" strokeWidth="1.2" opacity="0.8" />
                    <line x1="182" y1="146" x2="200" y2="146" stroke="#00FFFF" strokeWidth="1.2" opacity="0.6" />
                    
                    {/* Secondary Floating Screen */}
                    <rect
                      x="185"
                      y="108"
                      width="22"
                      height="15"
                      fill="rgba(0, 255, 255, 0.1)"
                      stroke="#00FFFF"
                      strokeWidth="1.5"
                      rx="2"
                      opacity="0.8"
                    />
                    <line x1="188" y1="113" x2="202" y2="113" stroke="#00FFFF" strokeWidth="0.8" />
                    <line x1="188" y1="118" x2="198" y2="118" stroke="#00FFFF" strokeWidth="0.8" />
                  </g>
                  
                  {/* Enhanced Belt/Waist with Power Cells */}
                  <rect
                    x="87"
                    y="153"
                    width="46"
                    height="10"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  <circle cx="110" cy="158" r="4" fill="#00FFFF" style={{ filter: 'drop-shadow(0 0 8px #00FFFF)' }} />
                  <rect x="95" y="155" width="5" height="6" fill="#00FFFF" opacity="0.6" />
                  <rect x="120" y="155" width="5" height="6" fill="#00FFFF" opacity="0.6" />
                  
                  {/* Heavily Armored Legs */}
                  <polygon
                    points="87,163 78,215 72,255 78,262 90,220 95,173"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="3"
                  />
                  <polygon
                    points="133,163 142,215 148,255 142,262 130,220 125,173"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="3"
                  />
                  
                  {/* Thigh Armor Panels */}
                  <line x1="88" y1="175" x2="93" y2="175" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="88" y1="185" x2="92" y2="185" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="127" y1="175" x2="132" y2="175" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="128" y1="185" x2="132" y2="185" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
                  
                  {/* Advanced Knee Guards with Tech */}
                  <polygon
                    points="84,205 80,218 88,222 92,209"
                    fill="rgba(0, 255, 255, 0.5)"
                    stroke="#00FFFF"
                    strokeWidth="2"
                  />
                  <circle cx="86" cy="215" r="3" fill="#00FFFF" opacity="0.8" />
                  
                  <polygon
                    points="136,205 140,218 132,222 128,209"
                    fill="rgba(0, 255, 255, 0.5)"
                    stroke="#00FFFF"
                    strokeWidth="2"
                  />
                  <circle cx="134" cy="215" r="3" fill="#00FFFF" opacity="0.8" />
                  
                  {/* Shin Guards with Circuits */}
                  <line x1="75" y1="230" x2="80" y2="230" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
                  <line x1="74" y1="240" x2="79" y2="240" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
                  <line x1="140" y1="230" x2="145" y2="230" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
                  <line x1="141" y1="240" x2="146" y2="240" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
                  
                  {/* Heavy Combat Boots */}
                  <polygon
                    points="72,255 78,262 85,268 80,272 68,266"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  <polygon
                    points="148,255 142,262 135,268 140,272 152,266"
                    fill="url(#blueGradient)"
                    stroke="#00BFFF"
                    strokeWidth="2.5"
                  />
                  <line x1="74" y1="260" x2="82" y2="260" stroke="#00FFFF" strokeWidth="1.2" />
                  <line x1="140" y1="260" x2="148" y2="260" stroke="#00FFFF" strokeWidth="1.2" />
                  
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0066CC" />
                      <stop offset="40%" stopColor="#0080FF" />
                      <stop offset="70%" stopColor="#00BFFF" />
                      <stop offset="100%" stopColor="#00FFFF" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Matrix-Style Code Rain */}
                <div className="absolute -left-8 top-10 opacity-70">
                  {['function()', '{code}', 'return;', 'async', 'await'].map((code, i) => (
                    <div
                      key={i}
                      className="text-cyan-400 font-mono text-[10px] font-bold"
                      style={{
                        animation: `matrixRain 2.5s linear infinite`,
                        animationDelay: `${i * 0.4}s`,
                        filter: 'drop-shadow(0 0 5px #00FFFF)',
                        marginBottom: '6px'
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                
                {/* Energy Particles - Enhanced */}
                <div className="absolute inset-0">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-cyan-400 rounded-full"
                      style={{
                        width: `${3 + Math.random() * 4}px`,
                        height: `${3 + Math.random() * 4}px`,
                        top: `${10 + i * 8}%`,
                        left: `${15 + (i % 4) * 25}%`,
                        animation: `particleOrbit ${1.8 + i * 0.15}s ease-in-out infinite`,
                        animationDelay: `${i * 0.12}s`,
                        boxShadow: '0 0 15px rgba(0, 191, 255, 1)',
                        filter: 'blur(0.3px)'
                      }}
                    />
                  ))}
                </div>
                
                {/* Binary Data Stream */}
                <div className="absolute -right-12 top-16 opacity-65">
                  {['010', '101', '110', '001', '111'].map((code, i) => (
                    <div
                      key={i}
                      className="text-cyan-300 font-mono text-[11px] font-bold"
                      style={{
                        animation: `binaryStream 2.2s ease-out infinite`,
                        animationDelay: `${i * 0.25}s`,
                        filter: 'drop-shadow(0 0 6px #00FFFF)',
                        marginBottom: '8px'
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                
                {/* Power Aura */}
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-cyan-400"
                  style={{
                    animation: 'auraExpand 3s ease-out infinite',
                    opacity: 0
                  }}
                />
              </div>
            </div>

            {/* VS in Center */}
            <div 
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out ${
                showBattle ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-180'
              }`}
              style={{
                transitionDelay: '0.8s'
              }}
            >
              <div className="relative">
                <div 
                  className="text-7xl md:text-9xl font-black relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, #FF0040 0%, #FFD700 50%, #8A2BE2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
                    filter: 'drop-shadow(0 0 25px rgba(255, 0, 64, 0.7))'
                  }}
                >
                  VS
                </div>
                <div 
                  className="absolute inset-0 text-7xl md:text-9xl font-black"
                  style={{
                    color: '#FFD700',
                    filter: 'blur(25px)',
                    opacity: 0.7,
                    animation: 'lightning 2s ease-in-out infinite'
                  }}
                >
                  VS
                </div>
                {/* Energy Rings */}
                {[0, 0.3, 0.6].map((delay, i) => (
                  <div 
                    key={i}
                    className="absolute top-1/2 left-1/2 border-4 rounded-full"
                    style={{
                      width: '160px',
                      height: '160px',
                      borderColor: i % 2 === 0 ? '#FFD700' : '#8A2BE2',
                      transform: 'translate(-50%, -50%)',
                      animation: 'expandRing 2s ease-out infinite',
                      animationDelay: `${delay}s`,
                      opacity: 0
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right Coding Warrior - ENHANCED MIRRORED */}
            <div 
  className={`absolute transition-all duration-1000 ease-out ${
    showBattle ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
  }`}
  style={{
    right: '-20px',
    transitionDelay: '0.2s',
    transform: showBattle ? 'scaleX(-1) translateX(0)' : 'scaleX(-1) translateX(-100%)'
  }}
>
              <div className="relative">
                <svg
                  width="220"
                  height="300"
                  viewBox="0 0 220 300"
                  className="drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 35px rgba(255, 0, 64, 0.95)) drop-shadow(0 0 50px rgba(255, 69, 0, 0.6))',
                    animation: 'warriorFloat 3s ease-in-out infinite 0.5s'
                  }}
                >
                  {/* Same enhanced structure with red theme */}
                  <path d="M 95,60 Q 50,70 40,100 L 35,130 Q 30,160 35,180 L 40,200 Q 45,210 50,200 L 70,150 L 80,100" fill="rgba(255, 0, 64, 0.12)" stroke="#FF0040" strokeWidth="2" strokeDasharray="5,3" style={{ animation: 'energyCape 4s ease-in-out infinite' }} />
                  <ellipse cx="110" cy="35" rx="18" ry="20" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <path d="M 88,32 L 132,32 L 135,35 L 135,40 L 85,40 L 85,35 Z" fill="rgba(255, 69, 0, 0.5)" stroke="#FF4500" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px #FF4500)', animation: 'headsetPulse 2s ease-in-out infinite' }} />
                  <rect x="92" y="34" width="12" height="5" fill="#FF4500" rx="1" opacity="0.8" />
                  <rect x="116" y="34" width="12" height="5" fill="#FF4500" rx="1" opacity="0.8" />
                  <line x1="88" y1="30" x2="85" y2="22" stroke="#FF4500" strokeWidth="2" />
                  <circle cx="85" cy="20" r="2.5" fill="#FF4500" style={{ filter: 'drop-shadow(0 0 6px #FF4500)' }} />
                  <line x1="132" y1="30" x2="135" y2="22" stroke="#FF4500" strokeWidth="2" />
                  <circle cx="135" cy="20" r="2.5" fill="#FF4500" style={{ filter: 'drop-shadow(0 0 6px #FF4500)' }} />
                  <polygon points="98,50 122,50 120,62 100,62" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2" />
                  <line x1="102" y1="52" x2="118" y2="52" stroke="#FF4500" strokeWidth="0.8" opacity="0.6" />
                  <line x1="102" y1="56" x2="118" y2="56" stroke="#FF4500" strokeWidth="0.8" opacity="0.6" />
                  <polygon points="110,62 140,80 135,155 85,155 80,80" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="3" />
                  <polygon points="80,80 70,85 72,100 82,95" fill="url(#redGradient)" stroke="#FF4500" strokeWidth="2.5" />
                  <polygon points="140,80 150,85 148,100 138,95" fill="url(#redGradient)" stroke="#FF4500" strokeWidth="2.5" />
                  <polygon points="110,85 122,95 110,105 98,95" fill="rgba(255, 69, 0, 0.4)" stroke="#FF4500" strokeWidth="2" />
                  <circle cx="110" cy="95" r="6" fill="#FF4500" style={{ filter: 'drop-shadow(0 0 15px #FF4500)', animation: 'corePulse 1.2s ease-in-out infinite' }} />
                  <line x1="90" y1="115" x2="130" y2="115" stroke="#FF4500" strokeWidth="2" opacity="0.8" />
                  <line x1="90" y1="125" x2="118" y2="125" stroke="#FF4500" strokeWidth="2" opacity="0.6" />
                  <line x1="102" y1="125" x2="130" y2="125" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="90" y1="135" x2="125" y2="135" stroke="#FF4500" strokeWidth="2" opacity="0.7" />
                  <circle cx="95" cy="120" r="2" fill="#FF4500" opacity="0.8" />
                  <circle cx="125" cy="120" r="2" fill="#FF4500" opacity="0.8" />
                  <circle cx="110" cy="130" r="2" fill="#FF4500" opacity="0.8" />
                  <polygon points="80,80 55,95 50,115 45,112 42,108 48,88 65,75" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <polygon points="50,115 45,112 30,135 35,142" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <line x1="48" y1="118" x2="38" y2="130" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="44" y1="122" x2="34" y2="134" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <g style={{ filter: 'drop-shadow(0 0 12px #FF4500)' }}>
                    <path d="M 35,142 L 28,152 L 18,175 L 15,185 L 12,195 L 16,197 L 20,187 L 24,177 L 32,155 L 38,145" fill="rgba(255, 69, 0, 0.25)" stroke="#FF4500" strokeWidth="3" style={{ animation: 'bladeGlow 1.5s ease-in-out infinite' }} />
                    <path d="M 20,155 L 17,165 L 15,175 L 14,185 L 13,192" stroke="#FFD700" strokeWidth="1.5" opacity="0.9" />
                  </g>
                  <rect x="32" y="140" width="8" height="14" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2" rx="2" />
                  <circle cx="36" cy="147" r="2" fill="#FF4500" />
                  <polygon points="140,80 165,95 170,115 175,112 178,108 172,88 155,75" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <polygon points="170,115 175,112 188,130 183,138" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <line x1="172" y1="118" x2="182" y2="128" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="176" y1="122" x2="186" y2="132" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <g style={{ filter: 'drop-shadow(0 0 12px #FF4500)' }}>
                    <rect x="178" y="125" width="35" height="28" fill="rgba(255, 0, 64, 0.15)" stroke="#FF4500" strokeWidth="2.5" rx="3" style={{ animation: 'screenGlow 2s ease-in-out infinite' }} />
                    <line x1="182" y1="131" x2="206" y2="131" stroke="#FF4500" strokeWidth="1.2" opacity="0.9" />
                    <line x1="182" y1="136" x2="202" y2="136" stroke="#FF4500" strokeWidth="1.2" opacity="0.7" />
                    <line x1="182" y1="141" x2="208" y2="141" stroke="#FF4500" strokeWidth="1.2" opacity="0.8" />
                    <line x1="182" y1="146" x2="200" y2="146" stroke="#FF4500" strokeWidth="1.2" opacity="0.6" />
                    <rect x="185" y="108" width="22" height="15" fill="rgba(255, 69, 0, 0.1)" stroke="#FF4500" strokeWidth="1.5" rx="2" opacity="0.8" />
                    <line x1="188" y1="113" x2="202" y2="113" stroke="#FF4500" strokeWidth="0.8" />
                    <line x1="188" y1="118" x2="198" y2="118" stroke="#FF4500" strokeWidth="0.8" />
                  </g>
                  <rect x="87" y="153" width="46" height="10" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <circle cx="110" cy="158" r="4" fill="#FF4500" style={{ filter: 'drop-shadow(0 0 8px #FF4500)' }} />
                  <rect x="95" y="155" width="5" height="6" fill="#FF4500" opacity="0.6" />
                  <rect x="120" y="155" width="5" height="6" fill="#FF4500" opacity="0.6" />
                  <polygon points="87,163 78,215 72,255 78,262 90,220 95,173" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="3" />
                  <polygon points="133,163 142,215 148,255 142,262 130,220 125,173" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="3" />
                  <line x1="88" y1="175" x2="93" y2="175" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="88" y1="185" x2="92" y2="185" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="127" y1="175" x2="132" y2="175" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <line x1="128" y1="185" x2="132" y2="185" stroke="#FF4500" strokeWidth="1.5" opacity="0.7" />
                  <polygon points="84,205 80,218 88,222 92,209" fill="rgba(255, 69, 0, 0.5)" stroke="#FF4500" strokeWidth="2" />
                  <circle cx="86" cy="215" r="3" fill="#FF4500" opacity="0.8" />
                  <polygon points="136,205 140,218 132,222 128,209" fill="rgba(255, 69, 0, 0.5)" stroke="#FF4500" strokeWidth="2" />
                  <circle cx="134" cy="215" r="3" fill="#FF4500" opacity="0.8" />
                  <line x1="75" y1="230" x2="80" y2="230" stroke="#FF4500" strokeWidth="1.5" opacity="0.6" />
                  <line x1="74" y1="240" x2="79" y2="240" stroke="#FF4500" strokeWidth="1.5" opacity="0.6" />
                  <line x1="140" y1="230" x2="145" y2="230" stroke="#FF4500" strokeWidth="1.5" opacity="0.6" />
                  <line x1="141" y1="240" x2="146" y2="240" stroke="#FF4500" strokeWidth="1.5" opacity="0.6" />
                  <polygon points="72,255 78,262 85,268 80,272 68,266" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <polygon points="148,255 142,262 135,268 140,272 152,266" fill="url(#redGradient)" stroke="#FF0040" strokeWidth="2.5" />
                  <line x1="74" y1="260" x2="82" y2="260" stroke="#FF4500" strokeWidth="1.2" />
                  <line x1="140" y1="260" x2="148" y2="260" stroke="#FF4500" strokeWidth="1.2" />
                  
                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#990000" />
                      <stop offset="40%" stopColor="#CC0000" />
                      <stop offset="70%" stopColor="#FF0040" />
                      <stop offset="100%" stopColor="#FF4500" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute -left-8 top-10 opacity-70">
                  {['class{}', '<html>', 'import', 'export', 'fetch()'].map((code, i) => (
                    <div key={i} className="text-red-400 font-mono text-[10px] font-bold"
                      style={{ animation: `matrixRain 2.5s linear infinite`, animationDelay: `${i * 0.4}s`, filter: 'drop-shadow(0 0 5px #FF4500)', marginBottom: '6px' }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="absolute inset-0">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute bg-red-500 rounded-full"
                      style={{ width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`,
                        top: `${10 + i * 8}%`, left: `${15 + (i % 4) * 25}%`,
                        animation: `particleOrbit ${1.8 + i * 0.15}s ease-in-out infinite`,
                        animationDelay: `${i * 0.12}s`,
                        boxShadow: '0 0 15px rgba(255, 0, 64, 1)', filter: 'blur(0.3px)'
                      }}
                    />
                  ))}
                </div>
                
                <div className="absolute -right-12 top-16 opacity-65">
                  {['010', '101', '110', '001', '111'].map((code, i) => (
                    <div key={i} className="text-red-400 font-mono text-[11px] font-bold"
                      style={{ animation: `binaryStream 2.2s ease-out infinite`, animationDelay: `${i * 0.25}s`,
                        filter: 'drop-shadow(0 0 6px #FF4500)', marginBottom: '8px'
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-red-500"
                  style={{ animation: 'auraExpand 3s ease-out infinite', opacity: 0 }}
                />
              </div>
            </div>
          </div>
          
          {/* Hero Features - Moved closer */}
          <div 
            className="flex flex-col md:flex-row justify-center gap-12 mt-6 opacity-0"
            style={{
              animation: 'heroTextReveal 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 3.8s'
            }}
          >
            <div className="flex items-center gap-4 text-white text-base font-medium">
              <i className="fas fa-zap text-2xl text-yellow-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}></i>
              <span>Lightning-fast Matching</span>
            </div>
            <div className="flex items-center gap-4 text-white text-base font-medium">
              <i className="fas fa-globe text-2xl text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}></i>
              <span>Worldwide Arena</span>
            </div>
            <div className="flex items-center gap-4 text-white text-base font-medium">
              <i className="fas fa-crown text-2xl text-purple-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}></i>
              <span>Real-time Leaderboards</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENHANCED CSS Animations */}
      <style>{`
        @keyframes warriorFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1.5deg); }
        }

        @keyframes headsetPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }

        @keyframes bladeGlow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.4; }
        }

        @keyframes screenGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }

        @keyframes energyCape {
          0%, 100% { d: path("M 95,60 Q 50,70 40,100 L 35,130 Q 30,160 35,180 L 40,200 Q 45,210 50,200 L 70,150 L 80,100"); }
          50% { d: path("M 95,60 Q 45,75 35,105 L 30,135 Q 25,165 30,185 L 35,205 Q 40,215 45,205 L 65,155 L 75,105"); }
        }

        @keyframes matrixRain {
          0% { transform: translateY(-15px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.9; }
          100% { transform: translateY(60px); opacity: 0; }
        }

        @keyframes binaryStream {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translateY(50px) translateX(-12px); opacity: 0; }
        }

        @keyframes particleOrbit {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(25px, -25px) scale(1.5); opacity: 0.2; }
        }

        @keyframes auraExpand {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }

        @keyframes lightning {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }

        @keyframes expandRing {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        @keyframes heroTextReveal {
          to { opacity: 1; }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes patternMove {
          0% { background-position: 0 0; }
          100% { background-position: 150px 150px; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
