import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Leaderboard/Navbar';
import CustomCursor from './components/Leaderboard/CustomCursor';
import LeaderboardHeader from './components/Leaderboard/LeaderboardHeader';
import LeaderboardTable from './components/Leaderboard/LeaderboardTable';
import Footer from './components/Leaderboard/Footer';
import Notification from './components/Leaderboard/Notification';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardState, setLeaderboardState] = useState(() => {
    const saved = sessionStorage.getItem("leaderboardState");
    return saved
      ? JSON.parse(saved)
      : {
          currentPage: 1,
          currentFilter: 1,
          playersPerPage: 10,
          isLoading: false,
          leaderboardData: [],
          isNextPage: false,
        };
  });

  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3400);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("leaderboardState", JSON.stringify(leaderboardState));
  }, [leaderboardState]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("leaderboardState");
    };
  }, []);

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.1) 0%, transparent 50%), ' +
          'radial-gradient(circle at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 50%), ' +
          'radial-gradient(circle at 50% 10%, rgba(236,72,153,0.06) 0%, transparent 50%), ' +
          '#000000',
      }}
    >
      <CustomCursor />
      <Navbar showNotification={showNotification} />
      <main className="min-h-screen pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <LeaderboardHeader
            leaderboardState={leaderboardState}
            setLeaderboardState={setLeaderboardState}
          />
          <LeaderboardTable
            leaderboardState={leaderboardState}
            setLeaderboardState={setLeaderboardState}
            showNotification={showNotification}
          />
        </div>
      </main>
      <Footer />
      {notifications.map((note) => (
        <Notification key={note.id} message={note.message} type={note.type} />
      ))}
    </div>
  );
};

export default Leaderboard;
