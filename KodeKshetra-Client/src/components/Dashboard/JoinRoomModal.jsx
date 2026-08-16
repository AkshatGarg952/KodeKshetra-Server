import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinRoomModal({ activeModal, hideModal, showNotification }) {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const userId = sessionStorage.getItem("userId");

    if (roomId.trim() && userId) {
      hideModal('join-room-modal');
      showNotification(`Joining room: ${roomId}`, 'success');
      setRoomId('');
      navigate("/waitingpage", {
        state: {
          roomId,
          battle: null
        },
        replace: true,
      });
    } else {
      showNotification('Please enter a valid Room ID', 'error');
    }
  };

  return (
    <div
      className={`modal-overlay fixed inset-0 bg-black/80 backdrop-blur-lg z-[10000] flex items-center justify-center transition-all duration-300 ${
        activeModal === 'join-room-modal' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      onClick={(e) => e.target.classList.contains('modal-overlay') && hideModal('join-room-modal')}
    >
      <div
        className="modal-container bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-neon-cyan backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,245,255,0.3)] max-w-md w-[90%] transition-transform duration-300"
        style={{ transform: activeModal === 'join-room-modal' ? 'scale(1)' : 'scale(0.8)' }}
      >
        <div className="modal-header flex justify-between items-center p-6 border-b border-neon-cyan/20">
          <h3 className="text-xl font-bold text-text-primary">Join Battle Room</h3>
          <button
            className="close-modal w-10 h-10 rounded-full bg-flame-red/20 text-flame-red flex items-center justify-center transition-all hover:bg-flame-red hover:text-text-primary hover:scale-110"
            onClick={() => hideModal('join-room-modal')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-content p-6">
          <div className="input-group mb-6">
            <label htmlFor="room-id-input" className="block mb-2 font-semibold text-text-primary">
              Room ID
            </label>
            <div className="input-container relative flex items-center">
              <input
                type="text"
                id="room-id-input"
                placeholder="Enter Room ID (e.g., BATTLE-2025-7NDGXT)"
                maxLength={20}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-4 border-2 border-neon-cyan/30 bg-slate-gray/50 rounded-xl text-text-primary font-jetbrains transition-all focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              />
            </div>
          </div>
          <div className="modal-actions flex gap-4 justify-end">
            <button
              className="btn btn-secondary px-6 py-3 border-2 border-text-muted bg-transparent text-text-muted rounded-xl font-semibold transition-all hover:bg-text-muted hover:text-void-black"
              onClick={() => hideModal('join-room-modal')}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary px-6 py-3 bg-gradient-dashboard text-text-primary rounded-xl font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,245,255,0.4)]"
              onClick={handleJoin}
            >
              <FontAwesomeIcon icon={faDoorOpen} />
              Join Room
            </button>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default JoinRoomModal;
