import React, { useState } from 'react';
import LogoutModal from './LogoutModal';
import { SERVER_URL } from '../../config.js';


function Navbar({ setShowLogin, setShowRegister }) {
  const [showModal, setShowModal] = useState(false);


  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(`${SERVER_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // If backend returns an error response
        throw new Error("Failed to logout");
      }

      // Clear session storage
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");

      // Reload page or redirect
      window.location.href = "/";
    } catch (error) {
      alert("Cannot logout. Please try again.");
      console.error("Logout failed:", error);
    }
  };

  const commonClasses =
    "no-underline text-text-primary font-medium text-base transition-all duration-300 relative py-2 hover:text-cyber-cyan hover:-translate-y-0.5 hover:shadow-[0_0_10px_var(--electric-blue)] whitespace-nowrap border-none bg-transparent cursor-pointer";

  const isLoggedIn =
    sessionStorage.getItem("userId") && sessionStorage.getItem("token");

  const navItems = [
    { label: "Features", section: "how-it-works" },
    { label: "Guide", section: "features" },
    { label: "Stories", section: "reviews" },
    ...(isLoggedIn
      ? [
        { label: "Leaderboard", action: () => (window.location.replace("/leaderboard")) },
        { label: "Logout", action: () => setShowModal(true) },

      ]
      : [
        { label: "Login", action: () => setShowLogin(true) },
        { label: "Register", action: () => setShowRegister(true) },
      ]),
  ];

  return (

    <>
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-2xl border-b-2 border-[var(--gradient-fire)] z-[1000] py-5 animate-[navSlide_1s_ease_forwards]">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="text-3xl font-extrabold bg-gradient-plasma bg-clip-text text-transparent animate-[logoGlow_4s_ease-in-out_infinite] tracking-tight">
            KodeKshetra
          </div>
          <ul className="flex list-none gap-12 items-center">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                {item.action ? (
                  <button onClick={item.action} className={commonClasses}>
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-cyber transition-all duration-400 group-hover:w-full"></span>
                  </button>
                ) : (
                  <a
                    href={`#${item.section}`}
                    onClick={(e) => handleNavClick(e, item.section)}
                    className={commonClasses}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-cyber transition-all duration-400 group-hover:w-full"></span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {showModal && <LogoutModal setShowModal={setShowModal} />}
    </>
  );
}

export default Navbar;
