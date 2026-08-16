import React, {useState, useRef, useEffect} from 'react';
import Navbar from './components/Landpage/Navbar';
import Hero from './components/Landpage/Hero';
import NeuralNetwork from './components/Landpage/NeuralNetwork';
import WeaponCache from './components/Landpage/WeaponCache';
import Testimonials from './components/Landpage/Testimonials';
import Footer from './components/Landpage/Footer';
import Cursor from './components/Landpage/Cursor';
import LoginForm from './components/Landpage/LoginForm';
import RegisterForm from './components/Landpage/RegisterForm';
import './landpage.css';
function LandPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const loginRef = useRef(null);
  const registerRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (loginRef.current && !loginRef.current.contains(event.target)) ||
        (registerRef.current && !registerRef.current.contains(event.target))
      ) {
        setShowLogin(false);
        setShowRegister(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="fixed w-5 h-5 bg-gradient-cyber rounded-full pointer-events-none z-50 mix-blend-screen shadow-[0_0_25px_var(--electric-blue)] transition-all duration-150" id="cursor"></div>
      <div className="fixed pointer-events-none z-40 text-cyber-cyan font-jetbrains-mono text-xs font-medium opacity-0 transition-opacity duration-400" id="cursor-trail"></div>
      <Cursor />
      <Navbar 
      setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}/>
      <Hero />
      <NeuralNetwork />
      <WeaponCache />
      <Testimonials />
      <Footer />
      {showLogin && (
        <LoginForm
          ref={loginRef}
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
        />
      )}
      {showRegister && (
        <RegisterForm
          ref={registerRef}
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
        />
      )}
    </div>
  );
}

export default LandPage;