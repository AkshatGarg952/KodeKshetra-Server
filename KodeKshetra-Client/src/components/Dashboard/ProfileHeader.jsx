import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faFire, faPencilAlt, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SERVER_URL } from '../../config.js';


function ProfileHeader({
  user,
  heatmapData = [],
  onUpdateProfile = () => {}
}) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(user.username);
  const [selectedDate, setSelectedDate] = useState(null);
  const fileInputRef = useRef(null);
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const handleAvatarEdit = () => {
    fileInputRef.current?.click();
  };


  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const formData = new FormData();
      formData.append('ProfilePicture', file);

      try {
        const response = await fetch(`${SERVER_URL}/api/users/update/${userId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData,
        });


        if (response.ok) {
          const result = await response.json();
          onUpdateProfile({ avatar: result.user?.profilePicture || user.avatar });
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to update profile picture. Please try again.');
        }
      } catch (error) {
        alert('Error uploading profile picture. Please check your connection.');
      }
    }
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setTempUsername(user.username);
  };


  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setTempUsername(user.username);
  };


  const handleUsernameSave = async () => {
    if (tempUsername.trim() === '') {
      alert('Username cannot be empty');
      return;
    }

    if (tempUsername.trim() === user.username) {
      setIsEditingUsername(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(tempUsername.trim())) {
      alert('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return;
    }

    const formData = new FormData();
    formData.append('username', tempUsername.trim());

    try {
      const response = await fetch(`${SERVER_URL}/api/users/update/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData,
      });


      if (response.ok) {
        await response.json();
        onUpdateProfile({ ...user, username: tempUsername.trim() });
        setIsEditingUsername(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update username. Please try again.');
      }
    } catch (error) {
      alert('Error updating username. Please check your connection.');
    }
  };


  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUsernameSave();
    } else if (e.key === 'Escape') {
      handleUsernameCancel();
    }
  };


  return (
    <div className="profile-header grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 mb-12 bg-gradient-to-br from-deep-black to-slate-gray rounded-3xl p-8 border-2 border-electric-purple/30 backdrop-blur-3xl shadow-[0_20px_60px_rgba(139,0,255,0.2)] relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent_98%,rgba(0,245,255,0.08)_100%),linear-gradient(45deg,transparent_98%,rgba(139,0,255,0.06)_100%)] bg-[length:120px_120px,80px_80px] animate-profileMove z-[1]"
        aria-hidden="true"
      ></div>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
      />


      {/* Avatar + Rank */}
      <div className="profile-avatar z-[22] flex justify-center">
        <div className="avatar-container flex flex-col items-center gap-4">
          <div className="avatar-wrapper relative group">
            <div className="avatar-img w-32 h-32 rounded-full bg-gradient-profile flex items-center justify-center text-4xl font-extrabold text-text-primary border-4 border-golden-amber/50 animate-avatarPulse overflow-hidden">
              <img
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Edit Avatar Button */}
            <button
              onClick={handleAvatarEdit}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-fire rounded-full flex items-center justify-center text-white text-sm border-2 border-deep-black hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] group-hover:opacity-100 opacity-90"
              title="Edit profile picture"
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
          </div>


          <div className="rank-badge bg-gradient-fire px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm text-text-primary shadow-[0_4px_15px_rgba(255,69,0,0.3)] animate-badgeFloat">
            <FontAwesomeIcon icon={faCrown} />
            <span>Master</span>
          </div>
        </div>
      </div>


      {/* User Info */}
      <div className="profile-info z-[22] text-center lg:text-left">
        <div className="username-container relative">
          {!isEditingUsername ? (
            // Display Mode
            <div className="username-display group flex items-center justify-center lg:justify-start gap-3">
              <h1 className="username text-4xl font-extrabold bg-gradient-dashboard bg-clip-text text-transparent animate-usernamePulse">
                {user.username}
              </h1>
              <button
                onClick={handleUsernameEdit}
                className="edit-username-btn w-6 h-6 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan text-xs hover:bg-neon-cyan/30 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Edit username"
              >
                <FontAwesomeIcon icon={faPencilAlt} />
              </button>
            </div>
          ) : (
            // Edit Mode - All items in same row
            <div className="username-edit flex items-center justify-center lg:justify-start gap-3">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onKeyDown={handleUsernameKeyPress}
                className="username-input text-4xl font-extrabold bg-transparent border-2 border-neon-cyan/50 rounded-lg px-3 py-1 text-text-primary focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,245,255,0.3)] bg-slate-gray/20 min-w-0 flex-shrink-0"
                style={{
                  fontFamily: 'inherit',
                  background: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundImage: 'var(--tw-gradient-dashboard, linear-gradient(135deg, #00f5ff 0%, #8b00ff 100%))'
                }}
                autoFocus
                placeholder="Enter username"
                maxLength={20}
              />

              {/* Save and Cancel buttons in same row */}
              <div className="edit-actions flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleUsernameSave}
                  className="save-btn w-8 h-8 bg-green-500/80 hover:bg-green-500 rounded-full flex items-center justify-center text-white text-sm transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  title="Save changes"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={handleUsernameCancel}
                  className="cancel-btn w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-sm transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  title="Cancel changes"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="user-title text-xl text-text-secondary font-medium mb-6">
          Competitive Programming Master
        </p>

        <div className="quick-stats flex flex-col md:flex-row gap-4 md:gap-8 justify-center lg:justify-start">
          <div className="quick-stat flex flex-col items-center gap-1">
            <span className="stat-value text-2xl font-extrabold font-jetbrains">
              {user.totalBattles.toLocaleString()}
            </span>
            <span className="stat-label text-sm text-text-muted uppercase tracking-wide">
              Total Battles
            </span>
          </div>
          <div className="quick-stat flex flex-col items-center gap-1">
            <span className="stat-value text-2xl font-extrabold font-jetbrains">
              {user.wins.toLocaleString()}
            </span>
            <span className="stat-label text-sm text-text-muted uppercase tracking-wide">
              Victories
            </span>
          </div>
          <div className="quick-stat flex flex-col items-center gap-1">
            <span className="stat-value text-2xl font-extrabold font-jetbrains">
              {user.badgesCount}
            </span>
            <span className="stat-label text-sm text-text-muted uppercase tracking-wide">
              Badges Earned
            </span>
          </div>
        </div>
      </div>


      {/* Heatmap */}
      <div className="profile-heatmap z-[22] min-w-0 lg:min-w-[400px] mx-auto lg:mx-0">
        <div className="heatmap-header flex justify-between items-center mb-4">
          <h3 className="heatmap-title flex items-center gap-2 text-lg font-bold text-text-primary">
            <FontAwesomeIcon icon={faFire} className="text-neon-cyan text-base" />
            Last 90 Days Activity
          </h3>
          <div className="streak-indicator bg-gradient-fire px-3 py-1 rounded-xl font-bold text-xs text-text-primary animate-streakPulse">
            <span>{user.currentStreak} Day Streak</span>
          </div>
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="selected-date-info mb-3 p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30 text-center">
            <p className="text-sm text-text-primary">
              <span className="font-bold text-neon-cyan">{new Date(selectedDate.date).toDateString()}</span>
              {' - '}
              <span className="font-semibold">{selectedDate.battles} battle{selectedDate.battles !== 1 ? 's' : ''}</span>
            </p>
          </div>
        )}

        <div className="compact-heatmap-container max-w-[380px] mx-auto">
          <div className="compact-heatmap-grid grid grid-cols-[repeat(18,1fr)] gap-0.5 p-2 bg-slate-gray/10 rounded-xl border border-neon-cyan/20">
            {heatmapData && heatmapData.length > 0 ? (
              heatmapData.map((data, index) => {
                // Determine intensity level based on battle count
                let intensityClass = '';

                if (data.battles === 0) {
                  intensityClass = 'bg-dark-gray';
                } else if (data.battles === 1) {
                  intensityClass = 'bg-neon-cyan/20 shadow-[0_0_10px_rgba(0,245,255,0.2)]';
                } else if (data.battles >= 2 && data.battles <= 5) {
                  intensityClass = 'bg-neon-cyan/40 shadow-[0_0_12px_rgba(0,245,255,0.4)]';
                } else if (data.battles >= 6 && data.battles <= 15) {
                  intensityClass = 'bg-neon-cyan/60 shadow-[0_0_16px_rgba(0,245,255,0.6)]';
                } else {
                  intensityClass = 'bg-neon-cyan/80 shadow-[0_0_20px_rgba(0,245,255,0.8)]';
                }

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(data)}
                    className={`heatmap-cell w-4 h-4 rounded cursor-pointer transition-all hover:scale-125 hover:shadow-[0_0_20px_currentColor] ${intensityClass} ${selectedDate?.date === data.date ? 'ring-2 ring-neon-cyan scale-125' : ''
                      }`}
                    data-level={data.battles}
                    title={`${new Date(data.date).toDateString()}: ${data.battles} battles`}
                  ></div>
                );
              })
            ) : (
              Array.from({ length: 90 }).map((_, index) => (
                <div
                  key={index}
                  className="heatmap-cell w-4 h-4 rounded bg-dark-gray opacity-40"
                ></div>
              ))
            )}
          </div>


          {/* Legend */}
          <div className="heatmap-legend flex items-center gap-2 text-xs text-text-muted justify-center mt-4">
            <span>Less</span>
            <div className="legend-scale flex gap-0.5">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`legend-item w-2.5 h-2.5 rounded-sm ${level === 0 ? 'bg-dark-gray' : `bg-neon-cyan/${level * 20}`
                    }`}
                  data-level={level}
                ></div>
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default ProfileHeader;
