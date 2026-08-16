import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faShieldAlt, faGamepad, faStar } from '@fortawesome/free-solid-svg-icons';

function StatsCard({ user, className }) {
  const winRate = user.totalBattles > 0
    ? ((user.wins / user.totalBattles) * 100).toFixed(1)
    : '0.0';
  const winRateNum = parseFloat(winRate);

  return (
    <div className={`dashboard-card stats-card bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-matrix-lime/30 backdrop-blur-3xl transition-all hover:-translate-y-1 hover:border-neon-cyan hover:shadow-[0_15px_40px_rgba(0,245,255,0.2)] p-6 relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-gradient-dashboard opacity-0 transition-opacity z-[1]"
        aria-hidden="true"
      ></div>
      <div className="card-header flex justify-between items-center mb-6 z-[2]">
        <h3 className="card-title flex items-center gap-2 text-xl font-bold text-text-primary">
          <FontAwesomeIcon icon={faChartBar} className="text-neon-cyan text-lg" />
          Battle Statistics
        </h3>
      </div>
      <div className="stats-grid flex flex-col gap-4 z-[2]">

        {/* Win/Loss Row */}
        <div className="stat-item battles-stat flex items-center gap-4 p-4 bg-matrix-lime/10 rounded-xl border border-matrix-lime/20">
          <div className="stat-icon w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-stats text-text-primary">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          <div className="stat-content flex-1">
            <div className="stat-numbers flex items-baseline gap-2 mb-1">
              <span className="won text-2xl font-extrabold text-matrix-lime font-jetbrains">{user.wins}</span>
              <span className="divider text-text-muted text-lg">W</span>
              <span className="text-text-muted mx-1">/</span>
              <span className="lost text-2xl font-extrabold text-flame-red font-jetbrains">{user.losses}</span>
              <span className="divider text-text-muted text-lg">L</span>
            </div>
            <div className="stat-label text-xs text-text-muted mb-2 uppercase tracking-wide">Win / Loss</div>
            {/* Win Rate Progress Bar */}
            <div className="win-rate-bar w-full bg-slate-gray/60 rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${winRateNum}%`,
                  background: winRateNum >= 60
                    ? 'linear-gradient(90deg, #32CD32, #00F5FF)'
                    : winRateNum >= 40
                    ? 'linear-gradient(90deg, #FFB000, #32CD32)'
                    : 'linear-gradient(90deg, #FF4500, #FFB000)',
                }}
              ></div>
            </div>
            <div className="win-rate text-xs text-matrix-lime font-semibold">{winRate}% Win Rate</div>
          </div>
        </div>

        {/* Total Battles + Win Rate side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-item flex items-center gap-3 p-4 bg-matrix-lime/10 rounded-xl border border-matrix-lime/20">
            <div className="stat-icon w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-stats text-text-primary">
              <FontAwesomeIcon icon={faGamepad} />
            </div>
            <div className="stat-content">
              <span className="stat-value text-xl font-extrabold text-text-primary font-jetbrains block">
                {user.totalBattles.toLocaleString()}
              </span>
              <div className="stat-label text-xs text-text-muted">Total Battles</div>
            </div>
          </div>
          <div className="stat-item flex items-center gap-3 p-4 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20">
            <div className="stat-icon w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-neon-cyan/30 to-electric-purple/20 text-neon-cyan">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="stat-content">
              <span className="stat-value text-xl font-extrabold text-neon-cyan font-jetbrains block">{winRate}%</span>
              <div className="stat-label text-xs text-text-muted">Win Rate</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StatsCard;
