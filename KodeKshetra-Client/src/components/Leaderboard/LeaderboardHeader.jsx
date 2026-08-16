import React from 'react';
import { FaClock, FaCalendarWeek } from 'react-icons/fa';

const LeaderboardHeader = ({ leaderboardState, setLeaderboardState }) => {
  const handleFilterChange = (filter) => {
    if (filter !== leaderboardState.currentFilter) {
      setLeaderboardState((prev) => ({
        ...prev,
        currentFilter: filter,
        currentPage: 1,
        isLoading: true,
      }));
      setTimeout(() => {
        setLeaderboardState((prev) => ({ ...prev, isLoading: false }));
      }, 800);
    }
  };

  return (
    <div className="text-center mb-16">
      <div className="mb-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold gradient-text-champion tracking-tight animate-title-glow">
          Arena Leaderboard
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light mt-4">
          Battle-tested warriors ranked by skill and dedication
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 bg-slate-gray/30 p-4 rounded-2xl border border-[rgba(124,58,237,0.2)] backdrop-blur-3xl max-w-md mx-auto">
        <button
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            leaderboardState.currentFilter === 1
              ? 'bg-gradient-leaderboard text-text-primary shadow-[0_4px_15px_rgba(124,58,237,0.3)]'
              : 'text-text-secondary hover:bg-electric-cyan/10 hover:text-electric-cyan hover:-translate-y-0.5'
          }`}
          data-filter="1"
          onClick={() => handleFilterChange(1)}
        >
          <FaClock />
          <span>Past 24 Hours</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            leaderboardState.currentFilter === 7
              ? 'bg-gradient-leaderboard text-text-primary shadow-[0_4px_15px_rgba(124,58,237,0.3)]'
              : 'text-text-secondary hover:bg-electric-cyan/10 hover:text-electric-cyan hover:-translate-y-0.5'
          }`}
          data-filter="7"
          onClick={() => handleFilterChange(7)}
        >
          <FaCalendarWeek />
          <span>Past 7 Days</span>
        </button>
      </div>
    </div>
  );
};

export default LeaderboardHeader;