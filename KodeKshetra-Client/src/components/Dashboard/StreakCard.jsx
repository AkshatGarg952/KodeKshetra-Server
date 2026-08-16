import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlameCurved, faFire, faTrophy, faCrown, faMedal } from '@fortawesome/free-solid-svg-icons';

function StreakCard({ user, className }) {
  const streaks = [
    {
      icon: faFire,
      value: user.currentStreak,
      label: 'Current Streak',
      isCurrent: true,
      colorClass: 'text-neon-cyan',
      bgClass: 'bg-neon-cyan/10 border-neon-cyan/30',
      iconBg: 'bg-neon-cyan/20 text-neon-cyan',
      glowClass: 'hover:shadow-[0_4px_20px_rgba(0,245,255,0.3)]',
    },
    {
      icon: faTrophy,
      value: user.maxStreak,
      label: 'Max Streak',
      isCurrent: false,
      colorClass: 'text-golden-amber',
      bgClass: 'bg-golden-amber/10 border-golden-amber/20',
      iconBg: 'bg-golden-amber/20 text-golden-amber',
      glowClass: 'hover:shadow-[0_4px_15px_rgba(255,176,0,0.2)]',
    },
    {
      icon: faCrown,
      value: user.currentWinStreak,
      label: 'Current Win Streak',
      isCurrent: true,
      colorClass: 'text-neon-cyan',
      bgClass: 'bg-neon-cyan/10 border-neon-cyan/30',
      iconBg: 'bg-neon-cyan/20 text-neon-cyan',
      glowClass: 'hover:shadow-[0_4px_20px_rgba(0,245,255,0.3)]',
    },
    {
      icon: faMedal,
      value: user.maxWinStreak,
      label: 'Max Win Streak',
      isCurrent: false,
      colorClass: 'text-golden-amber',
      bgClass: 'bg-golden-amber/10 border-golden-amber/20',
      iconBg: 'bg-golden-amber/20 text-golden-amber',
      glowClass: 'hover:shadow-[0_4px_15px_rgba(255,176,0,0.2)]',
    },
  ];

  return (
    <div className={`dashboard-card streak-card bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-golden-amber/30 backdrop-blur-3xl transition-all hover:-translate-y-1 hover:border-neon-cyan hover:shadow-[0_15px_40px_rgba(0,245,255,0.2)] p-6 relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-gradient-dashboard opacity-0 transition-opacity z-[1]"
        aria-hidden="true"
      ></div>
      <div className="card-header flex justify-between items-center mb-6 z-[2]">
        <h3 className="card-title flex items-center gap-2 text-xl font-bold text-text-primary">
          <FontAwesomeIcon icon={faFireFlameCurved} className="text-neon-cyan text-lg" />
          Streak Records
        </h3>
        {(user.currentStreak > 0 || user.currentWinStreak > 0) && (
          <span className="text-xs font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30 px-2 py-1 rounded-lg animate-pulse">
            🔥 Active
          </span>
        )}
      </div>
      <div className="streak-grid grid grid-cols-1 sm:grid-cols-2 gap-3 z-[2]">
        {streaks.map((streak, index) => (
          <div
            key={index}
            className={`streak-item flex items-center gap-3 p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${streak.bgClass} ${streak.glowClass}`}
          >
            <div className={`streak-icon w-10 h-10 rounded-lg flex items-center justify-center text-base ${streak.iconBg}`}>
              <FontAwesomeIcon icon={streak.icon} />
            </div>
            <div className="streak-info flex flex-col">
              <span className={`streak-value font-extrabold font-jetbrains ${streak.isCurrent ? 'text-2xl' : 'text-xl text-opacity-80'} ${streak.colorClass}`}>
                {streak.value}
                {streak.isCurrent && streak.value > 0 && (
                  <span className="text-sm ml-1 opacity-70">days</span>
                )}
              </span>
              <span className="streak-label text-xs text-text-muted">{streak.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StreakCard;