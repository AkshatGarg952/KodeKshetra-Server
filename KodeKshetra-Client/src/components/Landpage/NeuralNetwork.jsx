import React, { useState, useEffect, useRef } from 'react';

const NeuralNetwork = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [unlockedNodes, setUnlockedNodes] = useState([]);
  const autoPlayRef = useRef(null);

  const nodes = [
    {
      step: 1,
      id: 'PROTOCOL_INIT',
      color: 'crimson',
      icon: 'fas fa-rocket',
      title: 'Weapon Selection Matrix',
      description: 'Advanced arsenal selection system allowing strategic choice between Data Structures & Algorithms for foundational combat or Competitive Programming for elite tactical operations.',
      stats: ['DSA Core', 'CP Tactics', 'Elite Mode']
    },
    {
      step: 2,
      id: 'TARGET_ACQ',
      color: 'azure',
      icon: 'fas fa-crosshairs',
      title: 'Domain Targeting System',
      description: 'Precision-engineered topic selection interface covering Dynamic Programming mastery, Graph theory warfare, Array manipulation tactics, and Tree traversal strategies.',
      stats: ['Graph Theory', 'DP Mastery', 'Tree Logic']
    },
    {
      step: 3,
      id: 'RIVAL_BATTLE',
      color: 'emerald',
      icon: 'fas fa-users',
      title: 'Rival Matchmaking Engine',
      description: 'Sophisticated opponent pairing algorithm supporting private duels with friends or global matchmaking with skill-based ranking and compatibility analysis.',
      stats: ['Global Rank', 'Skill Match', 'Private Lobby']
    },
    {
      step: 4,
      id: 'ARENA_LIVE',
      color: 'violet',
      icon: 'fas fa-code',
      title: 'Real-Time Battle Arena',
      description: 'High-performance IDE environment featuring real-time code execution, live result streaming, syntax highlighting, and intelligent auto-completion systems.',
      stats: ['Live Exec', 'Auto-Complete', 'Syntax Highlight']
    },
    {
      step: 5,
      id: 'VICTORY_CORE',
      color: 'amber',
      icon: 'fas fa-trophy',
      title: 'Victory Achievement Core',
      description: 'Comprehensive victory tracking system with XP accumulation, prestigious badge unlocking, and dynamic leaderboard ranking across multiple skill categories.',
      stats: ['XP System', 'Badges', 'Leaderboard']
    }
  ];

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setActiveStep(prev => (prev % 5) + 1);
      }, 4000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying]);

  const handleNodeClick = (step) => {
    setIsAutoPlaying(false);
    setActiveStep(step);
    if (!unlockedNodes.includes(step)) {
      setUnlockedNodes(prev => [...prev, step]);
    }
  };

  const activeNode = nodes.find(n => n.step === activeStep);

  const getColorClasses = (color) => {
    const colors = {
      crimson: {
        text: 'text-red-400',
        bg: 'bg-red-500',
        border: 'border-red-500',
        glow: 'shadow-red-500/50',
        gradient: 'from-red-600 via-red-900 to-black'
      },
      azure: {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500',
        border: 'border-cyan-500',
        glow: 'shadow-cyan-500/50',
        gradient: 'from-cyan-600 via-cyan-900 to-black'
      },
      emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500',
        glow: 'shadow-emerald-500/50',
        gradient: 'from-emerald-600 via-emerald-900 to-black'
      },
      violet: {
        text: 'text-violet-400',
        bg: 'bg-violet-500',
        border: 'border-violet-500',
        glow: 'shadow-violet-500/50',
        gradient: 'from-violet-600 via-violet-900 to-black'
      },
      amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        glow: 'shadow-amber-500/50',
        gradient: 'from-amber-600 via-amber-900 to-black'
      }
    };
    return colors[color] || colors.azure;
  };

  const activeColors = getColorClasses(activeNode.color);

  return (
    <section className="bg-[#050510] relative overflow-hidden flex flex-col items-center justify-center py-12" id="how-it-works">

      {/* Background Cyber-Grid */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
        }}
      />

      {/* Title Section */}
      <div className="relative z-10 text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-12 bg-gray-500/50"></div>
          <span className="font-mono text-cyan-400 text-xs tracking-[0.3em]">SYSTEM ARCHITECTURE</span>
          <div className="h-[1px] w-12 bg-gray-500/50"></div>
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-gray-500 tracking-tight">
          Neural <span className="text-cyan-400">Interface</span>
        </h2>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[500px]">

        {/* LEFT COLUMN - NAVIGATION SPINAL CORD */}
        <div className="lg:col-span-4 flex flex-col justify-between relative order-2 lg:order-1">
          {/* Vertical Line */}
          <div className="absolute left-8 top-4 bottom-4 w-1 bg-gray-800 hidden lg:block rounded-full"></div>

          <div className="flex flex-col gap-6 h-full justify-center">
            {nodes.map((node) => {
              const isActive = activeStep === node.step;
              const colors = getColorClasses(node.color);

              return (
                <div
                  key={node.step}
                  onClick={() => handleNodeClick(node.step)}
                  className={`group relative pl-0 lg:pl-16 cursor-pointer transition-all duration-300 ${isActive ? 'scale-105 lg:translate-x-4' : 'opacity-60 hover:opacity-100'}`}
                >
                  {/* Connection Node Point (Desktop) */}
                  <div className={`absolute left-[26px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#050510] z-20 transition-all duration-300 hidden lg:block
                    ${isActive ? `${colors.border} ${colors.glow} shadow-[0_0_15px_currentColor]` : 'border-gray-700'}
                  `}>
                    {isActive && <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${colors.bg}`}></div>}
                  </div>

                  {/* Horizontal Connector Line (Desktop) */}
                  <div className={`absolute left-8 top-1/2 -translate-y-1/2 h-[2px] bg-gray-700 transition-all duration-300 hidden lg:block
                    ${isActive ? `w-8 ${colors.bg} ${colors.glow}` : 'w-0'}
                  `}></div>

                  {/* Card Content */}
                  <div className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-300 flex items-center gap-4
                    ${isActive
                      ? `bg-gray-900/80 ${colors.border} ring-1 ring-inset ${colors.text} shadow-lg`
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-600'}
                  `}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors duration-300 ${isActive ? `${colors.bg} text-black` : 'bg-gray-800 text-gray-400'}`}>
                      <i className={node.icon}></i>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-wider">0{node.step}</div>
                      <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{node.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN - HOLOGRAPHIC PROJECTION */}
        <div className="lg:col-span-8 relative h-[400px] lg:h-full order-1 lg:order-2">
          {/* Main Display Container */}
          <div className="absolute inset-0 rounded-3xl border border-gray-700 bg-[#0a0a15]/90 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500 flex flex-col md:flex-row">

            {/* Ambient Pulse Background */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-700 ${activeColors.bg}`}></div>

            {/* Content Side */}
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">

              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur-sm self-start mb-6">
                <span className={`w-2 h-2 rounded-full animate-pulse ${activeColors.bg}`}></span>
                <span className={`text-xs font-mono font-bold tracking-widest ${activeColors.text}`}>SYSTEM_ID: {activeNode.id}</span>
              </div>

              {/* Title with Glitch Effect */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                {activeNode.title}
              </h1>

              {/* Typewriter Description */}
              <p key={activeStep} className="text-lg text-gray-400 leading-relaxed min-h-[100px] animate-fade-in-up">
                {activeNode.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-800">
                {activeNode.stats.map((stat, i) => (
                  <div key={i} className="text-center group cursor-default">
                    <div className={`text-2xl mb-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${activeColors.text}`}>
                      <i className="fas fa-microchip"></i>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 group-hover:text-gray-300">{stat}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Side (Icon Projection) */}
            <div className={`w-full md:w-1/3 bg-gradient-to-b ${activeColors.gradient} relative flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>

              {/* Animated Big Icon */}
              <div key={activeStep} className="relative z-10 animate-float">
                <i className={`${activeNode.icon} text-9xl text-white opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transform transition-transform hover:scale-110 duration-500`}></i>
              </div>

              {/* Scanning Line Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent w-full h-[20%] animate-scan pointer-events-none"></div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes scan {
          0% { top: -20%; }
          100% { top: 120%; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default NeuralNetwork;
