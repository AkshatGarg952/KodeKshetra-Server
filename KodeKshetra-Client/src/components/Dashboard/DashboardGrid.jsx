import BadgesCard from './BadgesCard';
import StatsCard from './StatsCard';
import StreakCard from './StreakCard';
import JoinRoomModal from './JoinRoomModal';
import CreateRoomModal from './CreateRoomModal';
import BadgesModal from './BadgesModal';
import MatchModal from './MatchModal';

function DashboardGrid({ user, badgesData, badgesHeight, showModal, showNotification, generateNewRoomId, activeModal, hideModal, badgesCount }) {
  return (
    <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 grid-rows-[auto_auto_auto] lg:grid-rows-[auto_auto] lg:grid-areas-[badges_stats,badges_streak]">
      <BadgesCard
        badgesData={badgesData}
        badgesHeight={badgesHeight}
        showModal={showModal}
        badgesCount={badgesCount}
        className="grid-in-badges col-span-1 lg:col-span-1 lg:row-span-2"
      />
      <StatsCard
        user={user}
        className="grid-in-stats col-span-1 lg:col-start-2 lg:row-start-1"
      />
      <StreakCard
        user={user}
        className="grid-in-streak col-span-1 lg:col-start-2 lg:row-start-2"
      />
      <JoinRoomModal
        activeModal={activeModal}
        hideModal={hideModal}
        showNotification={showNotification}
      />
      <CreateRoomModal
        activeModal={activeModal}
        hideModal={hideModal}
        showNotification={showNotification}
        generateNewRoomId={generateNewRoomId}
      />
      <MatchModal
        activeModal={activeModal}
        hideModal={hideModal}
        showNotification={showNotification}
      />
      <BadgesModal
        activeModal={activeModal}
        hideModal={hideModal}
        badgesData={badgesData}
      />
    </div>
  );
}

export default DashboardGrid;
