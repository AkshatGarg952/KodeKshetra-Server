import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';

// Each badge gets a unique gradient + emoji icon so they're all visually distinct
const BADGE_STYLES = [
  { emoji: '🏆', gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)', glow: 'rgba(255,215,0,0.5)' },    // First Win - Gold trophy
  { emoji: '🎯', gradient: 'linear-gradient(135deg, #00BFFF, #0080FF)', glow: 'rgba(0,191,255,0.5)' },   // Sharp Shooter - Blue target
  { emoji: '⚡', gradient: 'linear-gradient(135deg, #FF0040, #8A2BE2)', glow: 'rgba(255,0,64,0.5)' },    // Unstoppable - Red lightning
  { emoji: '📐', gradient: 'linear-gradient(135deg, #00F5FF, #32CD32)', glow: 'rgba(0,245,255,0.5)' },   // Mr. Consistent - Cyan
  { emoji: '👑', gradient: 'linear-gradient(135deg, #FFB000, #FF4500)', glow: 'rgba(255,176,0,0.5)' },   // Comeback King - Amber
  { emoji: '🌱', gradient: 'linear-gradient(135deg, #32CD32, #00F5FF)', glow: 'rgba(50,205,50,0.5)' },   // Rookie - Green
  { emoji: '💪', gradient: 'linear-gradient(135deg, #9932CC, #FF0040)', glow: 'rgba(153,50,204,0.5)' },  // Grinder - Purple
  { emoji: '🎰', gradient: 'linear-gradient(135deg, #EC4899, #8A2BE2)', glow: 'rgba(236,72,153,0.5)' },  // Clutch Winner - Pink
  { emoji: '🔢', gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)', glow: 'rgba(6,182,212,0.5)' },  // Array Ace - Cyan-blue
  { emoji: '🔤', gradient: 'linear-gradient(135deg, #F97316, #EF4444)', glow: 'rgba(249,115,22,0.5)' },  // String Slayer - Orange
  { emoji: '🔗', gradient: 'linear-gradient(135deg, #A855F7, #06B6D4)', glow: 'rgba(168,85,247,0.5)' },  // Linked List Legend - Purple-cyan
  { emoji: '📦', gradient: 'linear-gradient(135deg, #EF4444, #F97316)', glow: 'rgba(239,68,68,0.5)' },   // Stack Commander - Red-orange
  { emoji: '🚶', gradient: 'linear-gradient(135deg, #22C55E, #A855F7)', glow: 'rgba(34,197,94,0.5)' },   // Queue Conqueror - Green-purple
  { emoji: '🌳', gradient: 'linear-gradient(135deg, #16A34A, #065F46)', glow: 'rgba(22,163,74,0.5)' },   // Tree Tamer - Dark green
  { emoji: '🕸️', gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)', glow: 'rgba(124,58,237,0.5)' }, // Graph Guru - Deep purple
  { emoji: '🏗️', gradient: 'linear-gradient(135deg, #D97706, #92400E)', glow: 'rgba(217,119,6,0.5)' },  // Heap Handler - Brown-amber
  { emoji: '🌲', gradient: 'linear-gradient(135deg, #059669, #10B981)', glow: 'rgba(5,150,105,0.5)' },   // Trie Titan - Emerald
  { emoji: '#️⃣', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)', glow: 'rgba(8,145,178,0.5)' },  // Hash Hero - Teal
  { emoji: '📊', gradient: 'linear-gradient(135deg, #6D28D9, #4C1D95)', glow: 'rgba(109,40,217,0.5)' },  // Segment Tree Slayer - Deep violet
  { emoji: '🌲', gradient: 'linear-gradient(135deg, #047857, #065F46)', glow: 'rgba(4,120,87,0.5)' },    // Fenwick Fighter - Forest green
  { emoji: '🔵', gradient: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', glow: 'rgba(29,78,216,0.5)' },   // DSU Destroyer - Deep blue
  { emoji: '🔨', gradient: 'linear-gradient(135deg, #DC2626, #991B1B)', glow: 'rgba(220,38,38,0.5)' },   // Brute Force Warrior - Dark red
  { emoji: '⚔️', gradient: 'linear-gradient(135deg, #475569, #94A3B8)', glow: 'rgba(71,85,105,0.5)' },  // Sorting Samurai - Steel
  { emoji: '🔍', gradient: 'linear-gradient(135deg, #0369A1, #0284C7)', glow: 'rgba(3,105,161,0.5)' },   // Searching Sniper - Sky blue
  { emoji: '💰', gradient: 'linear-gradient(135deg, #CA8A04, #FACC15)', glow: 'rgba(202,138,4,0.5)' },   // Greedy Gladiator - Gold
  { emoji: '♟️', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)', glow: 'rgba(124,58,237,0.5)' },  // DP King - Purple-pink
  { emoji: '🔄', gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)', glow: 'rgba(8,145,178,0.5)' },   // Recursion Ruler - Cyan
  { emoji: '🧩', gradient: 'linear-gradient(135deg, #BE185D, #9D174D)', glow: 'rgba(190,24,93,0.5)' },   // Backtracking Boss - Deep pink
  { emoji: '🔢', gradient: 'linear-gradient(135deg, #1E40AF, #3B82F6)', glow: 'rgba(30,64,175,0.5)' },   // Bit Beast - Blue
  { emoji: '🔬', gradient: 'linear-gradient(135deg, #9333EA, #A855F7)', glow: 'rgba(147,51,234,0.5)' },  // Math Magician - Purple
  { emoji: '📐', gradient: 'linear-gradient(135deg, #0F766E, #14B8A6)', glow: 'rgba(15,118,110,0.5)' },  // Geometry Genius - Teal
  { emoji: '🎨', gradient: 'linear-gradient(135deg, #F43F5E, #FB7185)', glow: 'rgba(244,63,94,0.5)' },   // Pattern Pro - Rose
];

function BadgeIcon({ badge, index, compact = false }) {
  const style = BADGE_STYLES[(badge.id - 1) % BADGE_STYLES.length];

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ height: compact ? '80px' : '96px', width: compact ? '80px' : '96px', margin: '0 auto' }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-2xl opacity-40"
        style={{ background: style.gradient, filter: 'blur(8px)' }}
      />
      {/* Main badge body */}
      <div
        className="relative w-full h-full rounded-2xl flex items-center justify-center"
        style={{
          background: style.gradient,
          boxShadow: `0 4px 20px ${style.glow}`,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <span style={{ fontSize: compact ? '28px' : '36px', lineHeight: 1 }} role="img">
          {style.emoji}
        </span>
      </div>
    </div>
  );
}


function BadgesCard({ badgesData, showModal, className, badgesCount }) {
  const MAX_VISIBLE = 11;

  const displayedBadges = badgesData.slice(0, MAX_VISIBLE);
  const hasMore = badgesData.length > MAX_VISIBLE;

  while (displayedBadges.length < 12) {
    displayedBadges.push({
      id: `empty-${displayedBadges.length}`,
      title: '',
      image: '',
      description: '',
      quantity: 0,
      empty: true,
    });
  }

  if (hasMore) {
    displayedBadges[11] = {
      id: 'note-card',
      note: 'Click below to see all badges',
    };
  }

  return (
    <div
      className={`dashboard-card badges-main-card bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-electric-purple/30 backdrop-blur-3xl transition-all hover:-translate-y-1 hover:border-neon-cyan hover:shadow-[0_15px_40px_rgba(0,245,255,0.2)] p-6 relative overflow-hidden flex flex-col ${className}`}
    >
      <div
        className="absolute inset-0 bg-gradient-dashboard opacity-0 transition-opacity z-[1]"
        aria-hidden="true"
      ></div>

      {/* Header */}
      <div className="card-header flex justify-between items-center mb-6 z-[2]">
        <h3 className="card-title flex items-center gap-2 text-xl font-bold text-text-primary">
          <FontAwesomeIcon icon={faAward} className="text-neon-cyan text-lg" />
          Achievement Gallery
        </h3>
        <div className="badges-count bg-gradient-dashboard px-3 py-1 rounded-xl font-bold text-xs text-text-primary">
          <span>{badgesCount} Earned</span>
        </div>
      </div>

      {/* Gallery: Fixed 4x3 */}
      <div
        className="badges-main-gallery grid grid-cols-4 grid-rows-3 gap-4 justify-center z-[2] flex-1 mb-6"
        id="badges-main-gallery"
      >
        {displayedBadges.map((badge, index) => (
          <div
            key={badge.id}
            className={`badge-main-item bg-slate-gray/50 rounded-2xl border-2 border-electric-purple/30 text-center transition-all hover:border-electric-purple hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,0,255,0.3)] p-3 relative flex flex-col items-center justify-center gap-2 ${
              badge.empty ? 'opacity-20 pointer-events-none' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            title={badge.description || badge.title || ''}
          >
            {/* Quantity Badge */}
            {badge.quantity && badge.quantity > 0 && !badge.note && (
              <div className="absolute top-2 right-2 bg-neon-cyan/20 border border-neon-cyan px-1.5 py-0.5 rounded-md text-neon-cyan text-xs font-semibold z-10">
                ×{badge.quantity}
              </div>
            )}

            {/* Badge Icon (only for real badges, not empty or note) */}
            {!badge.empty && !badge.note && (
              <BadgeIcon badge={badge} index={index} compact />
            )}

            {/* Badge Title */}
            {badge.title && (
              <h4 className="badge-main-title font-semibold text-xs text-text-primary text-center leading-tight">
                {badge.title}
              </h4>
            )}

            {/* Note for overflow card */}
            {badge.note && (
              <p className="text-xs text-text-secondary font-medium text-center px-1">{badge.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Show All Button */}
      <button
        className="show-all-badges-btn bg-gradient-dashboard text-text-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 justify-center transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,0,255,0.4)] z-[2]"
        onClick={() => showModal('badges-modal')}
      >
        Show All Badges
      </button>
    </div>
  );
}

export default BadgesCard;
