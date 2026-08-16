import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faDoorOpen, faPlusCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LogoutModal from './Logout.jsx';

function Navbar({ showModal, showNotification }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <nav
      className="fixed top-0 w-full bg-deep-black/95 backdrop-blur-3xl border-b-2 border-[var(--gradient-dashboard)] z-[1000] py-5 animate-navSlide"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <div className="logo flex items-center text-3xl font-extrabold tracking-tight">
          <span className="logo-code bg-gradient-logo-code bg-clip-text text-transparent animate-logoCodeGlow">
            Kode
          </span>
          <span className="logo-versus bg-gradient-logo-versus bg-clip-text text-transparent animate-logoVersusGlow">
            Kshetra
          </span>
        </div>
        <div className="nav-actions flex gap-4">
          <button
            onClick={() => navigate('/leaderboard', { replace: true })}
            className="nav-btn leaderboard-btn flex items-center gap-2 px-4 py-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border-2 border-neon-cyan font-semibold text-sm transition-all hover:bg-neon-cyan hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,245,255,0.4)]"
          >
            <FontAwesomeIcon icon={faTrophy} />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          <button
            onClick={() => showModal('join-queue-modal')}
            className="nav-btn join-queue-btn flex items-center gap-2 px-4 py-3 rounded-xl bg-matrix-lime/10 text-matrix-lime border-2 border-matrix-lime font-semibold text-sm transition-all hover:bg-matrix-lime hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(50,205,50,0.4)]"
          >
            <FontAwesomeIcon icon={faDoorOpen} />
            <span className="hidden sm:inline">Join Queue</span>
          </button>

          <button
            onClick={() => showModal('join-room-modal')}
            className="nav-btn join-room-btn flex items-center gap-2 px-4 py-3 rounded-xl bg-matrix-lime/10 text-matrix-lime border-2 border-matrix-lime font-semibold text-sm transition-all hover:bg-matrix-lime hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(50,205,50,0.4)]"
          >
            <FontAwesomeIcon icon={faDoorOpen} />
            <span className="hidden sm:inline">Join Room</span>
          </button>

          <button
            onClick={() => showModal('create-room-modal')}
            className="nav-btn create-room-btn flex items-center gap-2 px-4 py-3 rounded-xl bg-golden-amber/10 text-golden-amber border-2 border-golden-amber font-semibold text-sm transition-all hover:bg-golden-amber hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,176,0,0.4)]"
          >
            <FontAwesomeIcon icon={faPlusCircle} />
            <span className="hidden sm:inline">Create Room</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="nav-btn logout-btn flex items-center gap-2 px-4 py-3 rounded-xl bg-flame-red/10 text-flame-red border-2 border-flame-red font-semibold text-sm transition-all hover:bg-flame-red hover:text-text-primary hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,69,0,0.4)]"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Render LogoutModal when showLogoutModal is true */}
      {showLogoutModal && (
        <LogoutModal
          setShowModal={setShowLogoutModal}
          showNotification={showNotification}
        />
      )}
    </nav>
  );
}

export default Navbar;
