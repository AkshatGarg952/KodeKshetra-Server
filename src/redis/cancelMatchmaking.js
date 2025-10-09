import redisClient from "./redisClient.js";

async function cancelMatchmaking({ userId, mode, topic }) {
  const queueKey = `${mode}:${topic}`;
  const queue = await redisClient.lRange(queueKey, 0, -1);

  for (const user of queue) {
    const parsed = JSON.parse(user);
    if (parsed.userId === userId) {
      await redisClient.lRem(queueKey, 1, user);
      return true;
    }
  }

  console.log(`User ${userId} not found in queue ${queueKey}`);
  return false;
}

export default cancelMatchmaking;
