const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const hashString = (value = '') => {
  let hash = 0;
  const input = String(value);

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const resolveBotRatingProfile = ({ mode, userRating = 1200, topic = '', userId = '' }) => {
  const seed = hashString(`${mode}:${topic}:${userId}`);
  const variance = (seed % 81) - 40;
  const visibleRating = clamp((userRating || 1200) + variance, 600, mode === 'cp' ? 3200 : 2600);

  let difficulty = 'balanced';
  if (visibleRating < 1100) {
    difficulty = 'rookie';
  } else if (visibleRating < 1500) {
    difficulty = 'challenger';
  } else if (visibleRating < 1900) {
    difficulty = 'expert';
  } else {
    difficulty = 'elite';
  }

  return {
    visibleRating,
    difficulty,
    varianceSeed: seed,
    aggressiveness: clamp(0.45 + ((seed % 20) / 100), 0.45, 0.75)
  };
};

export { clamp };
