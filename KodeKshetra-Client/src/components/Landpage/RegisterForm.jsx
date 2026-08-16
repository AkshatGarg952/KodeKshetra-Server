import React, { forwardRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { establishSocketConnection } from "../socket.js";
import { SERVER_URL } from "../../config.js";

const RegisterForm = forwardRef(({ setShowLogin, setShowRegister }, ref) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeId, setLeetcodeId] = useState("");
  const [codeforcesId, setCodeforcesId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSwitchToLogin = () => {
    if (!loading) {
      setShowRegister(false);
      setShowLogin(true);
    }
  };

  const handleClose = () => {
    if (!loading) setShowRegister(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById('profile-upload').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (profileImage) formData.append("ProfilePicture", profileImage);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("leetcodeId", leetcodeId);
      formData.append("codeforcesId", codeforcesId);

      const res = await fetch(`${SERVER_URL}/api/users/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("userId", data.user._id);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userEmail", data.user.email);
        establishSocketConnection();
        setShowRegister(false);
        setShowLogin(true);
        navigate("/leaderboard", { replace: true });
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error registering:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center px-4 py-4">
      <div
        ref={ref}
        className="relative form-container bg-[linear-gradient(145deg,rgba(13,13,13,0.98),rgba(26,26,26,0.95))] rounded-2xl p-8 border-2 border-electric-blue shadow-[0_0_30px_rgba(0,191,255,0.4)] w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide"
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
          Register for CodeVersus
        </h2>

        <form className={`space-y-6 transition-all duration-300 ${loading ? "blur-sm pointer-events-none" : ""}`} onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full border-2 border-electric-blue cursor-pointer hover:border-electric-blue transition-colors duration-300 overflow-hidden bg-dark-gray flex items-center justify-center shadow-[0_0_15px_rgba(0,191,255,0.3)] hover:shadow-[0_0_25px_rgba(0,191,255,0.4)]"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-text-secondary mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs text-text-secondary font-jetbrains-mono">Add Photo</span>
                  </div>
                )}
              </div>
              <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={loading} />
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setProfileImage(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Username */}
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required disabled={loading}
            className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono transition-colors" />

          {/* Email */}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required disabled={loading}
            className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono transition-colors" />

          {/* Password */}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required disabled={loading}
            className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono transition-colors" />

          {/* LeetCode & Codeforces */}
          <input type="text" value={leetcodeId} onChange={e => setLeetcodeId(e.target.value)} placeholder="LeetCode ID (optional)" disabled={loading}
            className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono transition-colors" />

          <input type="text" value={codeforcesId} onChange={e => setCodeforcesId(e.target.value)} placeholder="Codeforces ID (optional)" disabled={loading}
            className="w-full bg-dark-gray text-text-primary rounded-lg px-4 py-3 border-2 border-electric-blue focus:outline-none input-glow font-jetbrains-mono transition-colors" />

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-bold text-lg text-white bg-gradient-fire shadow-[0_8px_25px_rgba(255,69,0,0.4)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,215,0,0.6)] transition-all duration-300 disabled:opacity-50">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary font-jetbrains-mono mt-4">
          Already have an account?{" "}
          <button onClick={handleSwitchToLogin} className="text-cyber-cyan hover:text-neon-green transition-colors duration-300" disabled={loading}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
});

export default RegisterForm;
