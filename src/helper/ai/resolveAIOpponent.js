import { getPersonaForTopic } from './botPersonaRegistry.js';
import { hashString, resolveBotRatingProfile } from './botRatingEngine.js';

const buildFallbackBand = (visibleRating) => {
  if (visibleRating < 1100) {
    return 'low';
  }
  if (visibleRating < 1600) {
    return 'mid';
  }
  return 'high';
};

export default function resolveAIOpponent({ user, mode, topic }) {
  const userId = user?._id?.toString?.() || '';
  const userRating = user?.rating?.[mode] || 1200;
  const personaIndex = hashString(`${userId}:${mode}:${topic}`) % 3;
  const persona = getPersonaForTopic({ mode, topic, index: personaIndex });
  const ratingProfile = resolveBotRatingProfile({ mode, userRating, topic, userId });

  return {
    botId: `${persona.key}-${ratingProfile.visibleRating}`,
    displayName: persona.name,
    visibleRating: ratingProfile.visibleRating,
    persona: persona.key,
    mode,
    topic,
    difficulty: ratingProfile.difficulty,
    version: 'v1-hybrid',
    calibration: {
      aggressiveness: ratingProfile.aggressiveness,
      refinementBudget: 1,
      fallbackBand: `${buildFallbackBand(ratingProfile.visibleRating)}_${mode}`,
      stability: persona.stability,
      speedProfile: persona.speedProfile,
      topicAffinity: persona.specialization === String(topic || '').toLowerCase() ? 0.12 : 0.05
    }
  };
}
