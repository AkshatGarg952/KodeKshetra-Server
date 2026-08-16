import React from 'react';
import { FaCrown, FaMedal, FaAward, FaFire } from 'react-icons/fa';

const LeaderboardEntry = ({ player, animationIndex }) => {
  const rankStyles = {
    1: 'bg-[linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,165,0,0.1))] border-2 border-rank-gold shadow-[0_0_30px_rgba(255,215,0,0.4)]',
    2: 'bg-[linear-gradient(135deg,rgba(148,163,184,0.15),rgba(6,182,212,0.1))] border-2 border-rank-silver shadow-[0_0_30px_rgba(148,163,184,0.3)]',
    3: 'bg-[linear-gradient(135deg,rgba(205,127,50,0.15),rgba(184,115,51,0.1))] border-2 border-rank-bronze shadow-[0_0_30px_rgba(205,127,50,0.3)]',
  };
  const streak = Number.isFinite(Number(player.currentStreak))
    ? Number(player.currentStreak)
    : 0;

  return (
    <div
      className={`relative grid grid-cols-[40px_1fr_80px_80px] sm:grid-cols-[50px_1fr_100px_100px] md:grid-cols-[60px_1fr_120px_120px] lg:grid-cols-[80px_1fr_150px_150px] gap-2 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-6 mb-2 bg-slate-gray/40 rounded-2xl group hover:bg-slate-gray/60 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,182,212,0.2)] transition-all duration-300 animate-entry-slide ${rankStyles[player.rank] || 'border-transparent'}`}
      style={{ animationDelay: `${animationIndex * 50}ms` }}
    >
      {/* Lightning hover effect */}
      <div
        className="absolute top-0 left-[-100%] w-1/4 h-full bg-electric-cyan/50 blur-sm opacity-0 group-hover:animate-lightning"
        style={{ transform: 'skew(-20deg)' }}
      />

      {/* Rank */}
      <div
        className={`relative flex items-center justify-center font-extrabold text-base sm:text-xl ${
          player.rank === 1
            ? 'text-rank-gold shadow-[0_0_15px_rgba(255,215,0,0.8)]'
            : player.rank === 2
            ? 'text-rank-silver'
            : player.rank === 3
            ? 'text-rank-bronze'
            : ''
        }`}
      >
        {player.rank}
        {player.rank === 1 && (
          <FaCrown className="absolute -top-2 -right-2 text-sm text-rank-gold animate-crown-float" />
        )}
        {player.rank === 2 && (
          <FaMedal className="absolute -top-2 -right-2 text-sm text-rank-silver animate-crown-float" />
        )}
        {player.rank === 3 && (
          <FaAward className="absolute -top-2 -right-2 text-sm text-rank-bronze animate-crown-float" />
        )}
      </div>

      {/* Player info */}
      <div className="flex items-center gap-4">
        <div className="relative w-9 sm:w-10 md:w-[50px] h-9 sm:h-10 md:h-[50px] rounded-full bg-gradient-leaderboard flex items-center justify-center border-4 border-electric-cyan/50 overflow-hidden">
          <img
            src={player.profilePicture}
            alt={player.username}
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(transparent,rgba(255,255,255,0.3),transparent)] animate-avatar-spin" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">{player.username}</h3>
          <p className="text-xs sm:text-sm text-text-accent font-medium uppercase tracking-wider">
            Player
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-base sm:text-lg font-extrabold text-digital-yellow font-jetbrains">
          {player.points != null ? player.points.toLocaleString() : 0}
        </div>
        <div className="text-xs text-text-muted uppercase tracking-wider">Battle Points</div>
      </div>

      {/* Streak */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-streak-orange">
          <FaFire className="animate-fire-flicker" />
          {streak}
        </div>
        <div className="text-xs text-text-muted uppercase tracking-wider">Current Streak</div>
      </div>

      {/* Shine hover effect */}
      <div className="absolute top-0 left-[-100%] w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] transition-[left] duration-[600ms] group-hover:left-full" />
    </div>
  );
};

export default LeaderboardEntry;
