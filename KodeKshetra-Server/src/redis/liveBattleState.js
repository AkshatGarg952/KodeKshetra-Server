import { v4 as uuidv4 } from 'uuid';
import { getRedisClient, isRedisAvailable } from './redisClient.js';

const PRIVATE_ROOM_TTL_SECONDS = Number(process.env.PRIVATE_ROOM_TTL_SECONDS || 7200);
const PRIVATE_ROOM_LOCK_TTL_MS = Number(process.env.PRIVATE_ROOM_LOCK_TTL_MS || 5000);
const BATTLE_SUBMISSION_TTL_SECONDS = Number(process.env.BATTLE_SUBMISSION_TTL_SECONDS || 7200);
// codeRunnerClient.js retries failed requests 3 times (4 attempts total) at
// CODE_RUNNER_TIMEOUT_MS each, and decideWinner awaits two such calls in parallel —
// the lock must outlive that worst case or a slow runner lets a second caller
// re-run resolution (double XP/stat increments) while the first is still in flight.
const CODE_RUNNER_TIMEOUT_MS = Number(process.env.CODE_RUNNER_TIMEOUT_MS || 35000);
const CODE_RUNNER_MAX_ATTEMPTS = 4;
const BATTLE_PROCESSING_LOCK_TTL_MS = Number(
  process.env.BATTLE_PROCESSING_LOCK_TTL_MS || (CODE_RUNNER_TIMEOUT_MS * CODE_RUNNER_MAX_ATTEMPTS + 20000)
);

const getPrivateRoomMembersKey = (roomId) => `private-room:${roomId}:members`;
const getPrivateRoomConfigKey = (roomId) => `private-room:${roomId}:config`;
const getPrivateRoomLockKey = (roomId) => `lock:private-room:${roomId}`;
const getBattleSubmissionsKey = (battleId) => `battle-submissions:${battleId}`;
const getBattleProcessingLockKey = (battleId) => `lock:battle-processing:${battleId}`;

const releaseLock = async (redisClient, lockKey, lockToken) => {
  await redisClient.eval(
    'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
    {
      keys: [lockKey],
      arguments: [lockToken]
    }
  );
};

// Hard cap: never spin-wait more than 10 seconds regardless of TTL, to prevent
// event loop starvation when many coroutines are waiting on locks simultaneously.
const LOCK_SPIN_WAIT_MAX_MS = Number(process.env.REDIS_LOCK_SPIN_WAIT_MAX_MS || 10000);
const LOCK_SPIN_WAIT_POLL_MS = 50;

const withRedisLock = async (lockKey, ttlMs, worker) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redisClient = getRedisClient();
  const lockToken = uuidv4();
  const startedAt = Date.now();
  const maxWaitMs = Math.min(ttlMs * 2, LOCK_SPIN_WAIT_MAX_MS);

  while (Date.now() - startedAt < maxWaitMs) {
    const acquired = await redisClient.set(lockKey, lockToken, {
      NX: true,
      PX: ttlMs
    });

    if (acquired === 'OK') {
      try {
        return await worker(redisClient);
      } finally {
        try {
          await releaseLock(redisClient, lockKey, lockToken);
        } catch (error) {
          console.warn(`Failed to release Redis lock ${lockKey}: ${error.message}`);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, LOCK_SPIN_WAIT_POLL_MS));
  }

  console.warn(`[Redis] Lock ${lockKey} could not be acquired within ${maxWaitMs}ms — giving up.`);
  return null;
};

export const joinPrivateRoom = async ({ roomId, userId, battleConfig }) => {
  if (!isRedisAvailable()) {
    return null;
  }

  return withRedisLock(getPrivateRoomLockKey(roomId), PRIVATE_ROOM_LOCK_TTL_MS, async (redisClient) => {
    const membersKey = getPrivateRoomMembersKey(roomId);
    const configKey = getPrivateRoomConfigKey(roomId);

    const existingConfigRaw = await redisClient.get(configKey);
    let config = existingConfigRaw ? JSON.parse(existingConfigRaw) : null;

    if (!config && battleConfig?.mode && battleConfig?.topic) {
      config = {
        ...battleConfig,
        mode: battleConfig.mode,
        topic: battleConfig.topic
      };
      await redisClient.set(configKey, JSON.stringify(config), {
        EX: PRIVATE_ROOM_TTL_SECONDS
      });
    }

    await redisClient.sAdd(membersKey, userId);
    await redisClient.expire(membersKey, PRIVATE_ROOM_TTL_SECONDS);
    await redisClient.expire(configKey, PRIVATE_ROOM_TTL_SECONDS);

    const members = await redisClient.sMembers(membersKey);
    return { members, config };
  });
};

export const leavePrivateRoom = async ({ roomId, userId }) => {
  if (!isRedisAvailable()) {
    return null;
  }

  return withRedisLock(getPrivateRoomLockKey(roomId), PRIVATE_ROOM_LOCK_TTL_MS, async (redisClient) => {
    const membersKey = getPrivateRoomMembersKey(roomId);
    const configKey = getPrivateRoomConfigKey(roomId);

    await redisClient.sRem(membersKey, userId);
    const members = await redisClient.sMembers(membersKey);

    if (members.length === 0) {
      await redisClient.del(membersKey, configKey);
    } else {
      await redisClient.expire(membersKey, PRIVATE_ROOM_TTL_SECONDS);
      await redisClient.expire(configKey, PRIVATE_ROOM_TTL_SECONDS);
    }

    return { members };
  });
};

export const setPrivateRoomConfig = async ({ roomId, battleConfig }) => {
  if (!isRedisAvailable() || !roomId || !battleConfig) {
    return null;
  }

  return withRedisLock(getPrivateRoomLockKey(roomId), PRIVATE_ROOM_LOCK_TTL_MS, async (redisClient) => {
    const configKey = getPrivateRoomConfigKey(roomId);
    const existingConfigRaw = await redisClient.get(configKey);
    const existingConfig = existingConfigRaw ? JSON.parse(existingConfigRaw) : null;
    const nextConfig = {
      ...(existingConfig || {}),
      ...battleConfig,
    };

    await redisClient.set(configKey, JSON.stringify(nextConfig), {
      EX: PRIVATE_ROOM_TTL_SECONDS
    });

    return nextConfig;
  });
};

export const recordBattleSubmission = async ({ battleId, userId, payload }) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redisClient = getRedisClient();
  const submissionsKey = getBattleSubmissionsKey(battleId);
  await redisClient.hSet(submissionsKey, userId, JSON.stringify(payload));
  await redisClient.expire(submissionsKey, BATTLE_SUBMISSION_TTL_SECONDS);
  return redisClient.hLen(submissionsKey);
};

export const getBattleSubmissions = async (battleId) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redisClient = getRedisClient();
  const raw = await redisClient.hGetAll(getBattleSubmissionsKey(battleId));
  const entries = Object.entries(raw || {}).map(([userId, value]) => {
    try {
      return [userId, JSON.parse(value)];
    } catch {
      return null;
    }
  }).filter(Boolean);

  return new Map(entries);
};

export const claimBattleProcessing = async (battleId) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redisClient = getRedisClient();
  const result = await redisClient.set(getBattleProcessingLockKey(battleId), '1', {
    NX: true,
    PX: BATTLE_PROCESSING_LOCK_TTL_MS
  });

  return result === 'OK';
};

export const clearBattleProcessingState = async (battleId) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redisClient = getRedisClient();
  await redisClient.del(
    getBattleSubmissionsKey(battleId),
    getBattleProcessingLockKey(battleId)
  );
  return true;
};
