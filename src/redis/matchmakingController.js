import redisClient from './redisClient.js';

async function addUserToQueue({ userId, mode, topic, rating }) {
  const finalTopic = topic;
  const queueKey = `${mode}:${finalTopic}`;

  const userData = { userId, finalTopic, rating };

  // Check if user already exists in queue
  const existingQueue = await redisClient.lRange(queueKey, 0, -1);
  for (const user of existingQueue) {
    const parsed = JSON.parse(user);
    if (parsed.userId === userId) {
      console.log(`User ${userId} already in queue ${queueKey}, skipping.`);
      return;
    }
  }

  // Add user to Redis queue
  await redisClient.lPush(queueKey, JSON.stringify(userData));
  console.log(`✅ User ${userId} added to queue ${queueKey}`);
}

export default addUserToQueue;
