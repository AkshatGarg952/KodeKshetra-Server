import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const WeaponCache = () => {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true
  });

  const weapons = [
    {
      id: 'ide',
      icon: 'fas fa-code',
      title: 'Pro-Grade IDE',
      description: 'Browser-native development environment featuring syntax highlighting, intelligent auto-completion, and instant code execution with live result streaming.',
      specs: ['Multi-language Support', 'Real-time Collaboration', 'Advanced Debugging'],
      color: {
        border: 'border-blue-400',
        glow: 'shadow-[0_0_40px_rgba(0,191,255,0.2)]',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        spec: 'bg-blue-500/10 text-blue-400 border-blue-400'
      }
    },
    {
      id: 'speed',
      icon: 'fas fa-bolt',
      title: 'Lightning Matchmaking',
      description: 'Sub-3 second opponent pairing powered by WebSocket technology. Our global player pool ensures you\'ll always find a worthy challenger, any time of day.',
      specs: ['Global Player Pool', 'Skill-based Matching', 'Real-time Queuing'],
      color: {
        border: 'border-orange-500',
        glow: 'shadow-[0_0_40px_rgba(255,69,0,0.2)]',
        text: 'text-orange-500',
        bg: 'bg-orange-500/10',
        spec: 'bg-orange-500/10 text-orange-500 border-orange-500'
      }
    },
    {
      id: 'precision',
      icon: 'fas fa-bullseye',
      title: 'Precision Targeting',
      description: 'Laser-focused topic selection including Dynamic Programming, Graph Algorithms, Tree Structures, Array Operations, plus our wildcard Random mode for the adventurous.',
      specs: ['Topic Specialization', 'Difficulty Scaling', 'Custom Challenges'],
      color: {
        border: 'border-purple-600',
        glow: 'shadow-[0_0_40px_rgba(138,43,226,0.2)]',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        spec: 'bg-purple-500/10 text-purple-400 border-purple-600'
      }
    },
    {
      id: 'power',
      icon: 'fas fa-crown',
      title: 'Leaderboard Dominance',
      description: 'Real-time ranking updates across global, regional, and friend circles. Specialized leaderboards for each topic area to showcase your domain expertise.',
      specs: ['Global Rankings', 'Topic Leaderboards', 'Achievement System'],
      color: {
        border: 'border-yellow-500',
        glow: 'shadow-[0_0_40px_rgba(255,215,0,0.2)]',
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        spec: 'bg-yellow-500/10 text-yellow-400 border-yellow-500'
      }
    },
    {
      id: 'enhancement',
      icon: 'fas fa-gamepad',
      title: 'Gamification Engine',
      description: 'Tiered achievement system with exclusive badges, streak multipliers that amplify your XP gains, and milestone rewards that mark your coding journey.',
      specs: ['XP Multipliers', 'Badge Collection', 'Streak Rewards'],
      color: {
        border: 'border-green-500',
        glow: 'shadow-[0_0_40px_rgba(0,255,65,0.2)]',
        text: 'text-green-400',
        bg: 'bg-green-500/10',
        spec: 'bg-green-500/10 text-green-400 border-green-500'
      }
    },
    {
      id: 'intelligence',
      icon: 'fas fa-chart-area',
      title: 'Analytics Dashboard',
      description: 'Comprehensive battle analytics with performance heatmaps, detailed match replays, and strategic insights to identify your strengths and growth areas.',
      specs: ['Performance Metrics', 'Match Replays', 'Growth Insights'],
      color: {
        border: 'border-cyan-400',
        glow: 'shadow-[0_0_40px_rgba(0,255,255,0.2)]',
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        spec: 'bg-cyan-500/10 text-cyan-400 border-cyan-400'
      }
    }
  ];

  return (
    <section className="py-32 bg-black relative overflow-hidden" id="features">
      {/* Background Effects */}
      <div 
        className="absolute top-0 left-0 w-full h-full z-[1] opacity-[0.02]"
        style={{
          background: `
            linear-gradient(45deg, transparent 49%, #00BFFF 50%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #9932CC 50%, transparent 51%)
          `,
          backgroundSize: '200px 200px, 150px 150px',
          animation: 'weaponGrid 20s linear infinite'
        }}
      />

      <div className="max-w-7xl mx-auto px-8 relative z-[2]">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-mono text-sm text-cyan-400 opacity-70 tracking-[3px]">
            &lt; ARSENAL &gt;
          </div>
          
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight relative"
            style={{
              background: 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Weapon Cache
            <span 
              className="absolute top-0 left-0 w-full h-full opacity-0"
              style={{
                background: 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'neuralGlitch 4s ease-in-out infinite'
              }}
            >
              WEAPON CACHE
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Advanced arsenal of tools and capabilities for dominating the competitive coding battlefield
          </p>
        </div>

        {/* Weapons Grid */}
        <div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto"
        >
          {weapons.map((weapon, index) => (
            <WeaponCard 
              key={weapon.id} 
              weapon={weapon} 
              index={index}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const WeaponCard = ({ weapon, index, inView }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Special front side for Pro-Grade IDE (first card)
  const renderIDEFrontSide = () => (
    <div 
      className="absolute w-full h-full [backface-visibility:hidden] rounded-3xl border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,255,255,0.2)] backdrop-blur-[20px] overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))'
      }}
    >
      {/* Code Icon in top area */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="text-cyan-400 text-6xl relative animate-[weaponPulse_3s_ease-in-out_infinite]">
          &lt;/&gt;
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          Pro-Grade IDE
        </h3>
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );

  // Default front side for other cards
  const renderDefaultFrontSide = () => (
    <div 
      className={`absolute w-full h-full [backface-visibility:hidden] rounded-3xl flex flex-col items-center justify-center p-8 border-2 ${weapon.color.border} ${weapon.color.glow} backdrop-blur-[20px]`}
      style={{
        background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))'
      }}
    >
      <i 
        className={`${weapon.icon} text-6xl ${weapon.color.text} mb-8 animate-[weaponPulse_3s_ease-in-out_infinite]`}
        style={{
          filter: 'drop-shadow(0 0 20px currentColor)'
        }}
      />
      <h3 className="text-2xl text-white mb-4 font-bold">{weapon.title}</h3>
    </div>
  );

  return (
    <div 
      className="h-96 md:h-[400px] relative [perspective:1000px] cursor-pointer"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(50px)',
        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 200}ms`
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className={`relative w-full h-full text-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front Side */}
        {weapon.id === 'ide' ? renderIDEFrontSide() : renderDefaultFrontSide()}

        {/* Back Side */}
        <div 
          className={`absolute w-full h-full [backface-visibility:hidden] rounded-3xl flex flex-col items-center justify-center p-8 border-2 ${weapon.color.border} ${weapon.color.glow} backdrop-blur-[20px] [transform:rotateY(180deg)]`}
          style={{
            background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))'
          }}
        >
          <div className="text-left w-full">
            <h3 className={`text-2xl ${weapon.color.text} mb-6 font-bold text-center`}>
              {weapon.title}
            </h3>
            <p className="text-base text-gray-300 leading-relaxed mb-6">
              {weapon.description}
            </p>
            <div className="flex flex-col gap-2 mb-8">
              {weapon.specs.map((spec, specIndex) => (
                <span 
                  key={specIndex}
                  className={`${weapon.color.spec} px-4 py-2 rounded-xl text-sm font-medium border`}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeaponCache;
