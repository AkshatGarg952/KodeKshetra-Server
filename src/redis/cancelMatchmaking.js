import redisClient, { isRedisAvailable } from "./redisClient.js";

const getQueueKey = (mode, topic) => `${mode}:${topic}`;
const getQueueMemberKey = (mode, topic) => `queue-members:${mode}:${topic}`;

async function cancelMatchmaking({ userId, mode, topic }) {
  if (!isRedisAvailable()) {
    console.warn('Redis is not available. Cannot cancel matchmaking.');
    return false;
  }

  const queueKey = getQueueKey(mode, topic);
  const membershipKey = getQueueMemberKey(mode, topic);
  const removedFromMembership = await redisClient.sRem(membershipKey, userId);

  if (!removedFromMembership) {
    return false;
  }

  const queue = await redisClient.lRange(queueKey, 0, -1);

  for (const user of queue) {
    const parsed = JSON.parse(user);
    if (parsed.userId === userId) {
      await redisClient.lRem(queueKey, 1, user);
      return true;
    }
  }

  return true;
}

export default cancelMatchmaking;
