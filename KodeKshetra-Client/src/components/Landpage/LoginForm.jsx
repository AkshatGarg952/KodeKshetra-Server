import React, { forwardRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { establishSocketConnection } from "../socket.js";
import { SERVER_URL } from "../../config.js";

const LoginForm = forwardRef(({ setShowLogin, setShowRegister }, ref) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleClose = () => {
    if (!loading) setShowLogin(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (res.ok) {
        sessionStorage.setItem("userId", data.user._id);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userEmail", data.user.email);
        establishSocketConnection();
        navigate("/leaderboard", { replace: true });
      } else {
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center px-4">
      <div
        ref={ref}
        className="relative bg-[linear-gradient(145deg,rgba(13,13,13,0.98),rgba(26,26,26,0.95))] rounded-2xl p-8 border-2 border-electric-blue shadow-[0_0_30px_rgba(0,191,255,0.4)] w-full max-w-md"
      >
        {/* Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-20">
            <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-500 flex items-center justify-center group hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all duration-300 disabled:opacity-50"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-black text-text-primary mb-6 text-center font-space-grotesk">
          Login to CodeVersus
        </h2>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 transition-all duration-300 ${loading ? "blur-sm pointer-events-none" : ""}`}
        >
          <div>
            <label className="block text-sm font-jetbrains-mono text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-jetbrains-mono text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-bold text-lg text-white bg-gradient-fire shadow-[0_8px_25px_rgba(255,69,0,0.4)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,215,0,0.6)] transition-all duration-300 disabled:opacity-50"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary font-jetbrains-mono mt-4">
          Don't have an account?{' '}
          <button
            onClick={handleSwitchToRegister}
            className="text-cyber-cyan hover:text-neon-green transition-colors duration-300"
            disabled={loading}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
});

export default LoginForm;
