import React from 'react';
import { FaDiscord, FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer
      className="bg-void-black py-8 sm:py-16 border-t-2 border-[var(--gradient-leaderboard)] relative"
      id="contact"
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-leaderboard shadow-[0_0_15px_var(--electric-cyan)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="footer-section">
            <h3 className="text-electric-cyan mb-4 sm:mb-6 font-extrabold text-lg sm:text-xl shadow-[0_0_8px_var(--electric-cyan)]">
              CodeVersus
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Pioneering the future of competitive programming through real-time battles, gamified
              learning experiences, and a thriving global community of code warriors. Join thousands of
              developers who are elevating their skills daily.
            </p>
            <div className="flex gap-4 sm:gap-6 mt-6 sm:mt-8">
              {[
                { icon: <FaDiscord />, color: '#5865F2', brandColor: '#5865F2', name: 'Discord' },
                { icon: <FaXTwitter />, color: '#FFFFFF', brandColor: '#000000', name: 'X' },
                { icon: <FaGithub />, color: '#FFFFFF', brandColor: '#000000', name: 'GitHub' },
                { icon: <FaLinkedin />, color: '#0077B5', brandColor: '#0077B5', name: 'LinkedIn' },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 hover:scale-125 hover:-translate-y-1 transition-all duration-400"
                  style={{
                    backgroundColor: `${social.color}15`,
                    borderColor: social.color,
                    color: social.color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = social.brandColor;
                    e.currentTarget.style.borderColor = social.brandColor;
                    e.currentTarget.style.color = (social.name === 'X' || social.name === 'GitHub') ? '#FFFFFF' : '#000000';
                    e.currentTarget.style.boxShadow = `0 0 30px ${social.brandColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${social.color}15`;
                    e.currentTarget.style.borderColor = social.color;
                    e.currentTarget.style.color = social.color;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-section">
            <h3 className="text-electric-cyan mb-4 sm:mb-6 font-extrabold text-lg sm:text-xl shadow-[0_0_8px_var(--electric-cyan)]">
              Join the Arena
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Ready to test your coding mettle against the world's best? Enter our battle arena where
              algorithms meet adrenaline, and every line of code counts toward victory.
            </p>
          </div>
        </div>
        <div className="border-t border-electric-cyan pt-6 sm:pt-8 text-center">
          <nav className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            {['Privacy & Security', 'Terms of Battle', 'Support Center', 'Developer API'].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-text-secondary text-sm sm:text-base relative hover:text-electric-cyan transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-leaderboard after:transition-width after:duration-300 hover:after:w-full"
                >
                  {link}
                </a>
              ),
            )}
          </nav>
          <p className="text-text-secondary text-sm sm:text-base">
            &copy; 2025 CodeVersus. All rights reserved. Crafting the ultimate competitive coding
            experience.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
