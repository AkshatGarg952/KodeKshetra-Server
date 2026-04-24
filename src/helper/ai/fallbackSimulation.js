import { clamp, hashString } from './botRatingEngine.js';

const calculateFallbackTime = ({ battleDurationSeconds, solved, pressureFactor, varianceSeed }) => {
  const minimum = solved ? 180 : 420;
  const maximum = Math.max(minimum + 60, battleDurationSeconds - 90);
  const spread = maximum - minimum;
  const ratio = ((varianceSeed % 100) / 100);

  return Math.round(minimum + (spread * clamp((pressureFactor * 0.55) + (ratio * 0.45), 0, 1)));
};

export default function fallbackSimulation({
  battleId,
  question,
  opponent,
  user,
  totalCases,
  battleDurationSeconds,
  language
}) {
  const safeTotalCases = Math.max(totalCases || 0, 1);
  const questionRating = Number(question?.rating || user?.rating?.[opponent.mode] || opponent.visibleRating || 1200);
  const varianceSeed = hashString(`${battleId}:${opponent.botId}:${question?.problemId || question?.title || opponent.topic}`);
  const userRating = user?.rating?.[opponent.mode] || 1200;
  const ratingAlignment = clamp((opponent.visibleRating - questionRating + 250) / 500, 0.15, 0.95);
  const userPressure = clamp((opponent.visibleRating - userRating + 200) / 500, 0.2, 0.9);
  const topicAffinity = clamp(opponent?.calibration?.topicAffinity || 0.06, 0.04, 0.18);
  const stability = clamp(opponent?.calibration?.stability || 0.7, 0.55, 0.9);
  const confidence = clamp((ratingAlignment * 0.45) + (topicAffinity * 1.1) + (stability * 0.35), 0.2, 0.92);
  const solved = confidence > 0.7;

  const rawPassedRatio = solved
    ? clamp(0.82 + ((varianceSeed % 11) / 100), 0.82, 1)
    : clamp((confidence * 0.75) + ((varianceSeed % 17) / 100), 0.18, 0.88);

  let passedCases = Math.round(safeTotalCases * rawPassedRatio);
  passedCases = clamp(passedCases, solved ? Math.max(safeTotalCases - 1, 1) : 0, safeTotalCases);

  if (solved) {
    passedCases = safeTotalCases;
  }

  const finishTimeSeconds = calculateFallbackTime({
    battleDurationSeconds,
    solved,
    pressureFactor: userPressure,
    varianceSeed
  });

  return {
    strategy: 'fallback_simulation',
    language: language || (opponent.mode === 'cp' ? 'cpp' : 'python'),
    generatedCode: null,
    compileStatus: 'fallback',
    passedCases,
    totalCases: safeTotalCases,
    solved: passedCases >= safeTotalCases,
    executionTimeMs: null,
    finishTimeSeconds,
    confidence,
    failureReason: 'AI solver unavailable or unreliable; deterministic fallback applied.'
  };
}
