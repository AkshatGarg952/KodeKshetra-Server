import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const BADGE_STYLES = [
  { emoji: '🏆', gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)', glow: 'rgba(255,215,0,0.5)' },
  { emoji: '🎯', gradient: 'linear-gradient(135deg, #00BFFF, #0080FF)', glow: 'rgba(0,191,255,0.5)' },
  { emoji: '⚡', gradient: 'linear-gradient(135deg, #FF0040, #8A2BE2)', glow: 'rgba(255,0,64,0.5)' },
  { emoji: '📐', gradient: 'linear-gradient(135deg, #00F5FF, #32CD32)', glow: 'rgba(0,245,255,0.5)' },
  { emoji: '👑', gradient: 'linear-gradient(135deg, #FFB000, #FF4500)', glow: 'rgba(255,176,0,0.5)' },
  { emoji: '🌱', gradient: 'linear-gradient(135deg, #32CD32, #00F5FF)', glow: 'rgba(50,205,50,0.5)' },
  { emoji: '💪', gradient: 'linear-gradient(135deg, #9932CC, #FF0040)', glow: 'rgba(153,50,204,0.5)' },
  { emoji: '🎰', gradient: 'linear-gradient(135deg, #EC4899, #8A2BE2)', glow: 'rgba(236,72,153,0.5)' },
  { emoji: '🔢', gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)', glow: 'rgba(6,182,212,0.5)' },
  { emoji: '🔤', gradient: 'linear-gradient(135deg, #F97316, #EF4444)', glow: 'rgba(249,115,22,0.5)' },
  { emoji: '🔗', gradient: 'linear-gradient(135deg, #A855F7, #06B6D4)', glow: 'rgba(168,85,247,0.5)' },
  { emoji: '📦', gradient: 'linear-gradient(135deg, #EF4444, #F97316)', glow: 'rgba(239,68,68,0.5)' },
  { emoji: '🚶', gradient: 'linear-gradient(135deg, #22C55E, #A855F7)', glow: 'rgba(34,197,94,0.5)' },
  { emoji: '🌳', gradient: 'linear-gradient(135deg, #16A34A, #065F46)', glow: 'rgba(22,163,74,0.5)' },
  { emoji: '🕸️', gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)', glow: 'rgba(124,58,237,0.5)' },
  { emoji: '🏗️', gradient: 'linear-gradient(135deg, #D97706, #92400E)', glow: 'rgba(217,119,6,0.5)' },
  { emoji: '🌲', gradient: 'linear-gradient(135deg, #059669, #10B981)', glow: 'rgba(5,150,105,0.5)' },
  { emoji: '#️⃣', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)', glow: 'rgba(8,145,178,0.5)' },
  { emoji: '📊', gradient: 'linear-gradient(135deg, #6D28D9, #4C1D95)', glow: 'rgba(109,40,217,0.5)' },
  { emoji: '🌲', gradient: 'linear-gradient(135deg, #047857, #065F46)', glow: 'rgba(4,120,87,0.5)' },
  { emoji: '🔵', gradient: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', glow: 'rgba(29,78,216,0.5)' },
  { emoji: '🔨', gradient: 'linear-gradient(135deg, #DC2626, #991B1B)', glow: 'rgba(220,38,38,0.5)' },
  { emoji: '⚔️', gradient: 'linear-gradient(135deg, #475569, #94A3B8)', glow: 'rgba(71,85,105,0.5)' },
  { emoji: '🔍', gradient: 'linear-gradient(135deg, #0369A1, #0284C7)', glow: 'rgba(3,105,161,0.5)' },
  { emoji: '💰', gradient: 'linear-gradient(135deg, #CA8A04, #FACC15)', glow: 'rgba(202,138,4,0.5)' },
  { emoji: '♟️', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)', glow: 'rgba(124,58,237,0.5)' },
  { emoji: '🔄', gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)', glow: 'rgba(8,145,178,0.5)' },
  { emoji: '🧩', gradient: 'linear-gradient(135deg, #BE185D, #9D174D)', glow: 'rgba(190,24,93,0.5)' },
  { emoji: '🔢', gradient: 'linear-gradient(135deg, #1E40AF, #3B82F6)', glow: 'rgba(30,64,175,0.5)' },
  { emoji: '🔬', gradient: 'linear-gradient(135deg, #9333EA, #A855F7)', glow: 'rgba(147,51,234,0.5)' },
  { emoji: '📐', gradient: 'linear-gradient(135deg, #0F766E, #14B8A6)', glow: 'rgba(15,118,110,0.5)' },
  { emoji: '🎨', gradient: 'linear-gradient(135deg, #F43F5E, #FB7185)', glow: 'rgba(244,63,94,0.5)' },
];

function BadgesModal({ activeModal, hideModal, badgesData }) {
  return (
    <div
      className={`modal-overlay fixed inset-0 bg-black/80 backdrop-blur-lg z-[10000] flex items-center justify-center transition-all duration-300 ${
        activeModal === 'badges-modal' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      onClick={(e) =>
        e.target.classList.contains('modal-overlay') && hideModal('badges-modal')
      }
    >
      <div
        className="modal-container badges-modal-container bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-neon-cyan backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,245,255,0.3)] max-w-4xl w-[90%] max-h-[80vh] transition-transform duration-300"
        style={{ transform: activeModal === 'badges-modal' ? 'scale(1)' : 'scale(0.8)' }}
      >
        {/* Header */}
        <div className="modal-header flex justify-between items-center p-6 border-b border-neon-cyan/20">
          <h3 className="text-xl font-bold text-text-primary">Achievement Gallery</h3>
          <button
            className="close-modal w-10 h-10 rounded-full bg-flame-red/20 text-flame-red flex items-center justify-center transition-all hover:bg-flame-red hover:text-text-primary hover:scale-110"
            onClick={() => hideModal('badges-modal')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content p-6">
          <div className="badges-gallery grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5 max-h-[60vh] overflow-y-auto pr-2">
            {badgesData.map((badge, index) => {
              const style = BADGE_STYLES[(badge.id - 1) % BADGE_STYLES.length];
              return (
                <div
                  key={badge.id}
                  className="badge-gallery-item bg-slate-gray/50 rounded-2xl p-5 border-2 border-electric-purple/30 text-center transition-all hover:border-electric-purple hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,0,255,0.3)] relative flex flex-col items-center gap-3"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  title={badge.description}
                >
                  {/* Quantity Badge */}
                  {badge.quantity && badge.quantity > 0 && (
                    <div className="absolute top-3 right-3 bg-neon-cyan/20 border border-neon-cyan px-2 py-0.5 rounded-md text-neon-cyan text-xs font-semibold">
                      ×{badge.quantity}
                    </div>
                  )}

                  {/* Badge Icon */}
                  <div className="relative" style={{ width: '80px', height: '80px' }}>
                    <div
                      className="absolute inset-0 rounded-2xl opacity-40"
                      style={{ background: style.gradient, filter: 'blur(8px)' }}
                    />
                    <div
                      className="relative w-full h-full rounded-2xl flex items-center justify-center"
                      style={{
                        background: style.gradient,
                        boxShadow: `0 4px 20px ${style.glow}`,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <span style={{ fontSize: '32px', lineHeight: 1 }} role="img">{style.emoji}</span>
                    </div>
                  </div>

                  {/* Badge Title */}
                  <h4 className="badge-gallery-title text-sm font-bold text-text-primary leading-tight">
                    {badge.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


export default BadgesModal;
