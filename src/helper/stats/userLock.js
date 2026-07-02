import { v4 as uuidv4 } from 'uuid';
import { getRedisClient, isRedisAvailable } from '../../redis/redisClient.js';

const USER_LOCK_TTL_MS = Number(process.env.USER_UPDATE_LOCK_TTL_MS || 5000);
const localLocks = new Map();

const getLockKey = (userId) => `lock:user-update:${userId}`;

const releaseDistributedLock = async (redisClient, lockKey, lockToken) => {
  await redisClient.eval(
    'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
    {
      keys: [lockKey],
      arguments: [lockToken]
    }
  );
};

export const withUserUpdateLock = async (userId, worker) => {
  if (!userId) {
    return worker();
  }

  const normalizedUserId = userId.toString();

  if (!isRedisAvailable()) {
    const previousLock = localLocks.get(normalizedUserId) || Promise.resolve();
    let releaseLocalLock;
    const localLock = new Promise((resolve) => {
      releaseLocalLock = resolve;
    });
    const queuedLock = previousLock.finally(() => localLock);

    localLocks.set(normalizedUserId, queuedLock);

    await previousLock.catch(() => {});

    try {
      return await worker();
    } finally {
      releaseLocalLock();
      if (localLocks.get(normalizedUserId) === queuedLock) {
        localLocks.delete(normalizedUserId);
      }
    }
  }

  const redisClient = getRedisClient();
  const lockKey = getLockKey(normalizedUserId);
  const lockToken = uuidv4();
  const startedAt = Date.now();

  while (Date.now() - startedAt < USER_LOCK_TTL_MS * 2) {
    const acquired = await redisClient.set(lockKey, lockToken, {
      NX: true,
      PX: USER_LOCK_TTL_MS
    });

    if (acquired === 'OK') {
      try {
        return await worker();
      } finally {
        try {
          await releaseDistributedLock(redisClient, lockKey, lockToken);
        } catch (error) {
          console.warn(`Failed to release user update lock ${lockKey}: ${error.message}`);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return worker();
};
