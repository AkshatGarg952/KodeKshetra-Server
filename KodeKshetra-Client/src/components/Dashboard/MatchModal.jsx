import { faTimes, faPlusCircle, faTree, faCode, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getTopicOptionsForMode } from "../../constants/battleTopics.js";

function MatchModal({ activeModal, hideModal, showNotification }) {
  const [battleMode, setBattleMode] = useState('');
  const [topic, setTopic] = useState('random');
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const topicOptions = getTopicOptionsForMode(battleMode);

  const getRandomBattleMode = () => {
    const modes = ['dsa', 'cp'];
    const randomIndex = Math.floor(Math.random() * modes.length);
    return modes[randomIndex];
  };

  const handleCreate = () => {
    const finalBattleMode = battleMode || getRandomBattleMode();
    const options = getTopicOptionsForMode(finalBattleMode);

    const randomTopic = options[Math.floor(Math.random() * options.length)];
    const finalTopic = topic === 'random' ? randomTopic.value : topic;
    const displayTopic = topic === 'random'
      ? randomTopic.label
      : (options.find((opt) => opt.value === topic)?.label || topic);

    if (userId) {
      hideModal('join-queue-modal');
      showNotification(`Matchmaking started: ${finalBattleMode} - ${displayTopic}`, 'success');
      navigate("/waitingpage2", {
        state: {
          mode: finalBattleMode,
          topic: finalTopic,
        },
        replace: true,
      });
    } else {
      showNotification('Please log in again to start matchmaking.', 'error');
    }
  };

  const handleModeSelect = (value) => {
    setBattleMode(value);
  };

  return (
    <div
      className={`modal-overlay fixed inset-0 bg-black/80 backdrop-blur-lg z-[10000] flex items-center justify-center transition-all duration-300 ${
        activeModal === 'join-queue-modal' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      onClick={(e) => e.target.classList.contains('modal-overlay') && hideModal('join-queue-modal')}
    >
      <div
        className="modal-container join-queue-container bg-gradient-to-br from-deep-black to-slate-gray rounded-2xl border-2 border-neon-cyan backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,245,255,0.3)] max-w-xl w-[90%] max-h-[85vh] overflow-y-auto transition-transform duration-300"
        style={{ transform: activeModal === 'join-queue-modal' ? 'scale(1)' : 'scale(0.8)' }}
      >
        <div className="modal-header flex justify-between items-center p-4 border-b border-neon-cyan/20">
          <h3 className="text-lg font-bold text-text-primary">Join Matchmaking</h3>
          <button
            className="close-modal w-9 h-9 rounded-full bg-flame-red/20 text-flame-red flex items-center justify-center transition-all hover:bg-flame-red hover:text-text-primary hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              hideModal('join-queue-modal');
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content p-4">
          <div className="input-group mb-4">
            <label className="block mb-2 font-semibold text-text-primary">Battle Mode</label>
            <div className="mode-selector flex flex-col gap-2">
              {[
                { id: 'mode-dsa', value: 'dsa', label: 'Data Structures & Algorithms', icon: faTree },
                { id: 'mode-cp', value: 'cp', label: 'Competitive Programming', icon: faCode },
              ].map((mode) => (
                <div key={mode.id} className="w-full">
                  <input
                    type="radio"
                    id={`match-${mode.id}`}
                    name="match-battle-mode"
                    value={mode.value}
                    checked={battleMode === mode.value}
                    onChange={() => handleModeSelect(mode.value)}
                    className="hidden peer"
                  />
                  <label
                    htmlFor={`match-${mode.id}`}
                    className="mode-option flex items-center gap-3 p-3 border-2 border-neon-cyan/30 rounded-xl cursor-pointer transition-all bg-slate-gray/30 hover:border-neon-cyan hover:bg-neon-cyan/10 peer-checked:border-neon-cyan peer-checked:bg-neon-cyan/20 peer-checked:shadow-[0_0_20px_rgba(0,245,255,0.2)]"
                  >
                    <FontAwesomeIcon icon={mode.icon} className="text-neon-cyan text-md" />
                    <span>{mode.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group mb-4">
            <label className="block mb-2 font-semibold text-text-primary">Topic Selection</label>
            <div className="topic-selector relative">
              <select
                id="topic-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!battleMode}
                className="w-full p-3 border-2 border-neon-cyan/30 bg-slate-gray/50 rounded-xl text-text-primary font-space cursor-pointer transition-all focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,245,255,0.3)] appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="random">Random Topic</option>
                {topicOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon absolute right-3 top-1/2 -translate-y-1/2 text-neon-cyan pointer-events-none" />
            </div>
          </div>

          <div className="modal-actions flex gap-3 justify-end">
            <button
              className="btn btn-secondary px-5 py-2 border-2 border-text-muted bg-transparent text-text-muted rounded-xl font-semibold transition-all hover:bg-text-muted hover:text-void-black"
              onClick={(e) => {
                e.stopPropagation();
                hideModal('join-queue-modal');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary px-5 py-2 bg-gradient-dashboard text-text-primary rounded-xl font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,245,255,0.4)]"
              onClick={(e) => {
                e.stopPropagation();
                handleCreate();
              }}
              disabled={!battleMode}
            >
              <FontAwesomeIcon icon={faPlusCircle} />
              Start Matchmaking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchModal;
