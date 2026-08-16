import React, { useEffect } from "react";
import LeaderboardEntry from "./LeaderboardEntry";
import Pagination from "./Pagination";
import { SERVER_URL } from "../../config.js";

const LeaderboardTable = ({ leaderboardState, setLeaderboardState, showNotification }) => {
  const { currentPage, currentFilter, isLoading, leaderboardData, isNextPage } =
    leaderboardState;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLeaderboardState((prev) => ({ ...prev, isLoading: true }));

        const res = await fetch(
          `${SERVER_URL}/leaderboard/${currentFilter}/${currentPage}`
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load leaderboard data.");
        }

        setLeaderboardState((prev) => ({
          ...prev,
          isLoading: false,
          leaderboardData: Array.isArray(data.data) ? data.data : [],
          isNextPage: data.isNextPage || false,
        }));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        showNotification(err.message || "Failed to load leaderboard data.", "error");
        setLeaderboardState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchLeaderboard();
  }, [currentFilter, currentPage, setLeaderboardState, showNotification]);

  const showLoadingEffect = () =>
    Array.from({ length: 10 }).map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-[40px_1fr_80px_80px] sm:grid-cols-[50px_1fr_100px_100px] md:grid-cols-[60px_1fr_120px_120px] lg:grid-cols-[80px_1fr_150px_150px] gap-2 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-6 mb-2 bg-slate-gray/40 rounded-2xl animate-skeleton-pulse"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-[linear-gradient(90deg,rgba(6,182,212,0.1)_0px,rgba(6,182,212,0.3)_40px,rgba(6,182,212,0.1)_80px)] bg-[length:200px_100%] rounded-lg animate-skeleton-shimmer"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    ));

  const EmptyState = () => {
    const handleShare = () => {
      const url = window.location.origin;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showNotification('Link copied! Share it with your friends 🔗', 'success');
        });
      } else {
        showNotification(`Share this link: ${url}`, 'info');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Animated trophy icon */}
        <div className="relative mb-8">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1))',
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 0 40px rgba(255,215,0,0.25), inset 0 0 20px rgba(255,215,0,0.1)',
              animation: 'pulse 2.5s ease-in-out infinite',
            }}
          >
            🏆
          </div>
          {/* Orbit dots */}
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-rank-gold/30"
            style={{ animation: 'spin 8s linear infinite' }}
          />
        </div>

        <h2
          className="text-3xl font-extrabold mb-3"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          The Arena Awaits
        </h2>
        <p className="text-text-secondary text-base mb-3 max-w-sm">
          {currentFilter === 1
            ? 'No battles fought in the last 24 hours.'
            : 'No battles fought in the last 7 days.'}
        </p>
        <p className="text-text-muted text-sm mb-8 max-w-sm">
          Be the first to battle and claim the <span className="text-rank-gold font-semibold">#1 spot</span>. Invite your friends to compete!
        </p>

        <button
          onClick={handleShare}
          className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm text-void-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,215,0,0.4)]"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
        >
          <span>🔗</span>
          Share &amp; Invite Friends
        </button>

        <p className="text-text-muted text-xs mt-4 opacity-60">
          Copies your KodeKshetra link to clipboard
        </p>
      </div>
    );
  };

  return (
    <div className="relative bg-[linear-gradient(145deg,rgba(13,13,13,0.95),rgba(30,41,59,0.9))] rounded-3xl border-2 border-[rgba(124,58,237,0.3)] backdrop-blur-3xl mb-16 shadow-[0_20px_60px_rgba(124,58,237,0.2)] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_98%,rgba(6,182,212,0.08)_100%),linear-gradient(45deg,transparent_98%,rgba(124,58,237,0.06)_100%)] bg-[length:120px_120px,80px_80px] animate-pattern-move z-0" />
      <div className="relative z-10">
        <div className="grid grid-cols-[40px_1fr_80px_80px] sm:grid-cols-[50px_1fr_100px_100px] md:grid-cols-[60px_1fr_120px_120px] lg:grid-cols-[80px_1fr_150px_150px] gap-2 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-8 border-b-2 border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] font-bold text-xs sm:text-sm text-text-accent uppercase tracking-wider">
          <div>Rank</div>
          <div>Player</div>
          <div>Battle Points</div>
          <div>Current Streak</div>
        </div>

        <div className="p-2 sm:p-4 min-h-[300px]">
          {isLoading ? (
            showLoadingEffect()
          ) : leaderboardData.length === 0 ? (
            <EmptyState />
          ) : (
            leaderboardData.map((player, index) => (
              <LeaderboardEntry
                key={player.rank}
                player={player}
                animationIndex={index}
              />
            ))
          )}
        </div>

        <Pagination
          leaderboardState={leaderboardState}
          setLeaderboardState={setLeaderboardState}
          isNextPage={isNextPage}
        />
      </div>
    </div>
  );
};

export default LeaderboardTable;
