import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ leaderboardState, setLeaderboardState, isNextPage }) => {
  const { currentPage, playersPerPage, isLoading } = leaderboardState;
  
  const goToPreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      setLeaderboardState((prev) => ({ ...prev, currentPage: prev.currentPage - 1, isLoading: true }));
      setTimeout(() => setLeaderboardState((prev) => ({ ...prev, isLoading: false })), 400);
    } 
  };

  const goToNextPage = () => {
    if (isNextPage && !isLoading) {
      setLeaderboardState((prev) => ({ ...prev, currentPage: prev.currentPage + 1, isLoading: true }));
      setTimeout(() => setLeaderboardState((prev) => ({ ...prev, isLoading: false })), 400);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-8 bg-slate-gray/30 border-t border-[rgba(124,58,237,0.3)] gap-4 sm:gap-0">
      <button
        className={`relative overflow-hidden flex items-center gap-2 px-4 sm:px-7 py-2 sm:py-4 bg-[linear-gradient(135deg,rgba(6,182,212,0.2),rgba(124,58,237,0.2))] text-electric-cyan rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-transparent transition-all duration-400 hover:bg-gradient-leaderboard hover:text-text-primary hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_35px_rgba(6,182,212,0.4)] hover:border-electric-cyan disabled:opacity-30 disabled:bg-[rgba(64,64,64,0.3)] disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none disabled:border-transparent disabled:transform-none group`}
        onClick={goToPreviousPage}
        disabled={currentPage <= 1 || isLoading}
      >
        <FaChevronLeft />
        <span className="hidden sm:inline">Previous</span>
        <div className="absolute top-0 left-[-100%] w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-[left] duration-[600ms] group-hover:left-full group-disabled:hidden" />
      </button>
      <div className="bg-[linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1))] px-4 sm:px-8 py-2 sm:py-4 rounded-2xl border-2 border-[rgba(124,58,237,0.4)] backdrop-blur-2xl shadow-[0_4px_15px_rgba(124,58,237,0.2)]">
        <span className="font-jetbrains font-bold text-text-primary text-sm sm:text-base shadow-[0_0_10px_var(--electric-cyan)]">
          Page {currentPage}
        </span>
      </div>
      <button
        className={`relative overflow-hidden flex items-center gap-2 px-4 sm:px-7 py-2 sm:py-4 bg-[linear-gradient(135deg,rgba(6,182,212,0.2),rgba(124,58,237,0.2))] text-electric-cyan rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-transparent transition-all duration-400 hover:bg-gradient-leaderboard hover:text-text-primary hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_35px_rgba(6,182,212,0.4)] hover:border-electric-cyan disabled:opacity-30 disabled:bg-[rgba(64,64,64,0.3)] disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none disabled:border-transparent disabled:transform-none group`}
        onClick={goToNextPage}
        disabled={!isNextPage || isLoading}
      >
        <span className="hidden sm:inline">Next</span>
        <FaChevronRight />
        <div className="absolute top-0 left-[-100%] w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-[left] duration-[600ms] group-hover:left-full group-disabled:hidden" />
      </button>
    </div>
  );
};

export default Pagination;