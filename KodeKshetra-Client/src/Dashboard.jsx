import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Dashboard/Navbar';
import ProfileHeader from './components/Dashboard/ProfileHeader';
import DashboardGrid from './components/Dashboard/DashboardGrid';
import Cursor from './components/Dashboard/Cursor';
import Notification from './components/Dashboard/Notification';
import { ADMIN_EMAIL, SERVER_URL } from './config.js';
import { clearBattleSession } from './features/battle/sessionStorage.js';
import './Dashboard.css';


const initialState = {
  currentUser: {
    username: 'CodeWarrior_2025',
    avatar: "https://res.cloudinary.com/dnd6asdiw/image/upload/v1757844942/DefaultProfilePic_kxth2v.jpg",
    totalBattles: 0,
    wins: 0,
    losses: 0,
    badgesCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    currentWinStreak: 0,
    maxWinStreak: 0,
    badgesEarned: 0,
  },
  activeModal: null,
  heatmapData: [],
};


function Dashboard() {
  const userId = sessionStorage.getItem("userId");
  const isAdminUser = (sessionStorage.getItem("userEmail") || "").toLowerCase() === ADMIN_EMAIL;
  const [dashboardState, setDashboardState] = useState(initialState);
  const [notifications, setNotifications] = useState([]);
  const [badgesHeight, setBadgesHeight] = useState(200);
  const [badgesData, setBadgesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearBattleSession();
    sessionStorage.removeItem("userTimer");
  }, []);


  const showModal = (modalId) => {
    setDashboardState((prev) => ({ ...prev, activeModal: modalId }));
    document.body.style.overflow = 'hidden';
  };


  const hideModal = (modalId) => {
    setDashboardState((prev) => ({ ...prev, activeModal: null }));
    document.body.style.overflow = '';
  };


  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3400);
  };


  const generateNewRoomId = () => {
    const prefixes = ['BATTLE', 'ARENA', 'CODE', 'DUEL', 'FIGHT'];
    const year = new Date().getFullYear();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${year}-${randomString}`;
  };


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!userId || !token) {
          window.location.href = "/";
          return;
        }

        const resWithAuth = token
          ? await fetch(`${SERVER_URL}/api/users/getUserDetails/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : await fetch(`${SERVER_URL}/api/users/getUserDetails/${userId}`);
        const userDetails = await resWithAuth.json();

        if (resWithAuth.status === 401 || resWithAuth.status === 403) {
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userEmail");
          window.location.href = "/";
          return;
        }

        setBadgesData(userDetails.badgesData);
        setDashboardState((prev) => ({
          ...prev,
          currentUser: {
            username: userDetails.username,
            avatar: userDetails.profilePicture || "https://res.cloudinary.com/dnd6asdiw/image/upload/v1757844942/DefaultProfilePic_kxth2v.jpg",
            totalBattles: userDetails.totalB,
            wins: userDetails.totalW,
            losses: userDetails.totalB - userDetails.totalW,
            badgesCount: userDetails.badgesCount || 0,
            currentStreak: userDetails.currStreak,
            maxStreak: userDetails.maxStreak,
            currentWinStreak: userDetails.currWinStreak,
            maxWinStreak: userDetails.maxWinStreak,
            badgesEarned: userDetails.badgesCount || 0,
            heatmapData: userDetails.heatmap || [],
          },
        }));
      } catch (err) {
        console.error("Failed to fetch user details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dashboardState.activeModal) {
        hideModal(dashboardState.activeModal);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        showModal('join-room-modal');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showModal('create-room-modal');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        showModal('badges-modal');
      }
    };


    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dashboardState.activeModal]);


  useEffect(() => {
    const adjustBadgesHeight = () => {
      const statsCard = document.querySelector('.stats-card');
      const badgesCard = document.querySelector('.badges-main-card');
      if (statsCard && badgesCard) {
        const statsContentHeight = statsCard.scrollHeight;
        const badgesCardHeader = badgesCard.querySelector('.card-header');
        const badgesCardButton = badgesCard.querySelector('.show-all-badges-btn');
        const headerHeight = badgesCardHeader ? badgesCardHeader.offsetHeight : 0;
        const buttonHeight = badgesCardButton ? badgesCardButton.offsetHeight : 0;
        const cardPadding = 48;
        const spacing = 48;
        const availableHeight = statsContentHeight - headerHeight - buttonHeight - cardPadding - spacing;
        setBadgesHeight(Math.max(availableHeight, 200));
      }
    };
    adjustBadgesHeight();
    window.addEventListener('resize', adjustBadgesHeight);
    return () => window.removeEventListener('resize', adjustBadgesHeight);
  }, [dashboardState.currentUser]);

  const handleUpdateProfile = (updatedUser) => {
    setDashboardState((prevState) => ({
      ...prevState,
      currentUser: {
        ...prevState.currentUser,
        ...updatedUser
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="font-space bg-void-black text-text-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="font-space text-text-primary min-h-screen overflow-x-hidden"
      style={{
        background:
          'radial-gradient(circle at 15% 25%, rgba(139,0,255,0.1) 0%, transparent 50%), ' +
          'radial-gradient(circle at 85% 75%, rgba(0,245,255,0.08) 0%, transparent 50%), ' +
          'radial-gradient(circle at 50% 50%, rgba(50,205,50,0.06) 0%, transparent 50%), ' +
          '#000000',
      }}
    >
      <Cursor />
      {notifications.map((n) => (
        <Notification key={n.id} message={n.message} type={n.type} />
      ))}
      <Navbar showModal={showModal} showNotification={showNotification} />
      <main className="min-h-screen pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ProfileHeader user={dashboardState.currentUser} heatmapData={dashboardState.currentUser.heatmapData} onUpdateProfile={handleUpdateProfile} />
          <DashboardGrid
            user={dashboardState.currentUser}
            badgesData={badgesData}
            badgesHeight={badgesHeight}
            showModal={showModal}
            showNotification={showNotification}
            generateNewRoomId={generateNewRoomId}
            activeModal={dashboardState.activeModal}
            hideModal={hideModal}
            badgesCount={dashboardState.currentUser.badgesCount}
          />
          {isAdminUser && (
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-md rounded-3xl border border-sky-300/30 bg-sky-400/10 p-5 shadow-[0_16px_45px_rgba(125,211,252,0.12)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
                  Admin Tools
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">Problem Importer</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Hidden here on purpose. Only the signed-in admin account can open the importer screen.
                </p>
                <Link
                  to="/admin/importer"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-300/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300 hover:text-slate-950"
                >
                  Open Importer
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


export default Dashboard;
