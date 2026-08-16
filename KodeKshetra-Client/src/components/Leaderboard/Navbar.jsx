import React, { useState } from 'react';
import { FaChartLine, FaSignOutAlt, FaHome } from 'react-icons/fa';
import LogoutModal from './LogoutModal';
import { useNavigate } from "react-router-dom";


const Navbar = ({ showNotification }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);


  const handleClick = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleHomeClick = () => {
    navigate("/", { replace: true });
  };


  return (
    <>
      <nav
        className="fixed top-0 w-full bg-deep-black/95 backdrop-blur-3xl border-b-2 border-[var(--gradient-leaderboard)] z-40 animate-nav-slide"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center py-3 sm:py-5">
          <div className="text-2xl sm:text-3xl font-extrabold gradient-text-leaderboard animate-logo-glow tracking-tight">
            KodeKshetra
          </div>
          <div className="flex gap-4 sm:gap-6">
            <button
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-purple-500/10 text-purple-400 border-2 border-purple-400 font-semibold text-xs sm:text-sm hover:bg-purple-500 hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(168,85,247,0.4)] transition-all duration-300"
              onClick={handleHomeClick}
            >
              <FaHome />
              <span className="hidden sm:inline">HomePage</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-electric-cyan/10 text-electric-cyan border-2 border-electric-cyan font-semibold text-xs sm:text-sm hover:bg-electric-cyan hover:text-void-black hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,182,212,0.4)] transition-all duration-300"
              onClick={handleClick}
            >
              <FaChartLine />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-battle-crimson/10 text-battle-crimson border-2 border-battle-crimson font-semibold text-xs sm:text-sm hover:bg-battle-crimson hover:text-text-primary hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] transition-all duration-300"
              onClick={() => setShowModal(true)}
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      {showModal && <LogoutModal setShowModal={setShowModal} showNotification={showNotification} />}
    </>
  );
};


export default Navbar;
