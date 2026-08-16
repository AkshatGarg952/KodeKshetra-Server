import { FallingTearsEffect, FireworksEffect, SparkleEffect } from "./BattleResultEffects";

function normalizeBattleOutcome(battleNote) {
  if (!battleNote) {
    return "waiting";
  }

  const note = battleNote.toLowerCase();
  if (note === "won" || note.includes("won")) {
    return "won";
  }

  if (note === "loss" || note.includes("loss")) {
    return "loss";
  }

  if (note === "draw" || note.includes("draw")) {
    return "draw";
  }

  return "waiting";
}

function OutcomeDecoration({ outcome }) {
  if (outcome === "won") {
    return <FireworksEffect />;
  }

  if (outcome === "loss") {
    return <FallingTearsEffect />;
  }

  if (outcome === "draw") {
    return <SparkleEffect />;
  }

  return null;
}

function OutcomeButton({ className, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`mt-8 rounded-xl border-2 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 ${className}`}
    >
      {label}
    </button>
  );
}

function WaitingContent() {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-matrix-green border-t-transparent"></div>
      </div>
      <h2 className="mb-4 text-3xl font-bold text-white animate-pulse">Waiting for opponent...</h2>
      <p className="text-gray-400">Calculating battle results. Please hold tight!</p>
      <div className="mt-6 flex justify-center gap-2">
        <div className="h-3 w-3 rounded-full bg-matrix-green animate-bounce"></div>
        <div className="h-3 w-3 rounded-full bg-matrix-green animate-bounce animation-delay-200"></div>
        <div className="h-3 w-3 rounded-full bg-matrix-green animate-bounce animation-delay-400"></div>
      </div>
    </div>
  );
}

function ResultSummary({ battleResultDetails }) {
  if (!battleResultDetails?.reason && !battleResultDetails?.userResult) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-200">
      {battleResultDetails.reason && (
        <div className="mb-2 font-semibold text-white">{battleResultDetails.reason}</div>
      )}
      {battleResultDetails.userResult && (
        <div>
          Passed: {battleResultDetails.userResult.passedCases ?? 0}
          {battleResultDetails.userResult.finishTimeSeconds !== undefined && (
            <> | Time left: {battleResultDetails.userResult.finishTimeSeconds}s</>
          )}
        </div>
      )}
    </div>
  );
}

function OutcomeContent({ battleResultDetails, onReturnToDashboard, outcome }) {
  if (outcome === "won") {
    return (
      <div className="animate-scaleIn">
        <div className="mb-6 text-8xl animate-bounce-slow">
          <i className="fas fa-trophy"></i>
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-500 bg-clip-text text-5xl font-bold text-transparent animate-slideDown">
          VICTORY!
        </h2>
        <p className="mb-4 text-2xl text-gray-300">You conquered the challenge!</p>
        <div className="mb-6 text-lg font-semibold text-green-400">Outstanding Performance!</div>
        <ResultSummary battleResultDetails={battleResultDetails} />
        <OutcomeButton
          className="border-green-400 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700"
          label="Return to Dashboard"
          onClick={onReturnToDashboard}
        />
      </div>
    );
  }

  if (outcome === "loss") {
    return (
      <div className="animate-scaleIn">
        <div className="mb-6 text-8xl animate-shake">
          <i className="fas fa-heart-broken"></i>
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-5xl font-bold text-transparent animate-slideDown">
          DEFEAT
        </h2>
        <p className="mb-4 text-2xl text-gray-300">Better luck next time, warrior!</p>
        <div className="mb-6 text-lg font-semibold text-red-400">Keep practicing, you'll get them next time!</div>
        <ResultSummary battleResultDetails={battleResultDetails} />
        <OutcomeButton
          className="border-red-400 bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700"
          label="Return to Dashboard"
          onClick={onReturnToDashboard}
        />
      </div>
    );
  }

  if (outcome === "draw") {
    return (
      <div className="animate-scaleIn">
        <div className="mb-6 text-8xl animate-spin-slow">
          <i className="fas fa-handshake"></i>
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-5xl font-bold text-transparent animate-slideDown">
          STALEMATE
        </h2>
        <p className="mb-4 text-2xl text-gray-300">An honorable draw between equals!</p>
        <div className="mb-6 text-lg font-semibold text-yellow-400">Well fought! Both warriors are evenly matched!</div>
        <ResultSummary battleResultDetails={battleResultDetails} />
        <OutcomeButton
          className="border-yellow-400 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-700"
          label="Return to Dashboard"
          onClick={onReturnToDashboard}
        />
      </div>
    );
  }

  return <WaitingContent />;
}

function getModalBorder(outcome) {
  if (outcome === "won") {
    return "border-green-500 shadow-green-500/50";
  }

  if (outcome === "loss") {
    return "border-red-500 shadow-red-500/50";
  }

  if (outcome === "draw") {
    return "border-yellow-500 shadow-yellow-500/50";
  }

  return "border-matrix-green shadow-matrix-green/50";
}

function BattleResultModal({
  battleNote,
  battleResultDetails,
  isWaiting,
  onReturnToDashboard,
  showModal,
}) {
  const outcome = normalizeBattleOutcome(battleNote);

  if (!isWaiting && !battleNote) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-500 ${
        showModal ? "bg-opacity-70" : "bg-opacity-0"
      }`}
      style={{
        backdropFilter: showModal ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: showModal ? "blur(10px)" : "blur(0px)",
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={`relative mx-4 w-full max-w-2xl rounded-3xl border-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 text-center shadow-2xl transition-all duration-500 ${
          getModalBorder(outcome)
        } ${showModal ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
      >
        <OutcomeDecoration outcome={outcome} />
        <OutcomeContent
          battleResultDetails={battleResultDetails}
          onReturnToDashboard={onReturnToDashboard}
          outcome={outcome}
        />
      </div>
    </div>
  );
}

export default BattleResultModal;
