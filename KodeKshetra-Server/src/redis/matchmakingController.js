import redisClient, { isRedisAvailable } from './redisClient.js';

const getQueueKey = (mode, topic) => `${mode}:${topic}`;
const getQueueMemberKey = (mode, topic) => `queue-members:${mode}:${topic}`;

async function addUserToQueue({ userId, mode, topic, rating }) {
  if (!isRedisAvailable()) {
    console.warn('Redis is not available. Matchmaking is disabled.');
    throw new Error('Matchmaking service is currently unavailable');
  }

  const queueKey = getQueueKey(mode, topic);
  const membershipKey = getQueueMemberKey(mode, topic);
  const userData = {
    userId,
    topic,
    rating,
    joinedAt: Date.now()
  };

  const wasAdded = await redisClient.sAdd(membershipKey, userId);
  if (!wasAdded) {
    return;
  }

  try {
    await redisClient.rPush(queueKey, JSON.stringify(userData));
  } catch (error) {
    await redisClient.sRem(membershipKey, userId);
    throw error;
  }
}

export default addUserToQueue;
