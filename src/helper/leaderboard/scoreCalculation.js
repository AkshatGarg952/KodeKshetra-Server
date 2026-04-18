import redisClient, { isRedisAvailable } from '../../redis/redisClient.js';
import User from '../../models/user.model.js';
import dayjs from 'dayjs';

const DEFAULT_LEADERBOARD_WINDOWS = [
  { key: 'leaderboard:1', days: 1 },
  { key: 'leaderboard:7', days: 7 }
];

export function calculateScoreForUser(user, timeWindowStart) {
  const xp = user.XP
    ?.filter((entry) => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.xp || 0), 0) || 0;

  const totalWins = user.totalW
    ?.filter((entry) => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.battlesWon || 0), 0) || 0;

  const matchesPlayed = user.totalB
    ?.filter((entry) => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.battlesPlayed || 0), 0) || 0;

  const totalPoints =
    ((totalWins || 0) * 50) +
    ((matchesPlayed || 0) * 5) +
    (xp || 0) +
    Math.floor(((totalWins || 0) / Math.max((matchesPlayed || 0), 1)) * 100);

  return Number.isNaN(totalPoints) ? 0 : totalPoints;
}

export async function refreshLeaderboardEntries(userIds, windows = DEFAULT_LEADERBOARD_WINDOWS) {
  try {
    if (!isRedisAvailable()) {
      return;
    }

    const uniqueUserIds = [...new Set(
      userIds
        .filter(Boolean)
        .map((userId) => userId.toString())
    )];

    if (uniqueUserIds.length === 0) {
      return;
    }

    const users = await User.find({ _id: { $in: uniqueUserIds } }).lean();
    const now = new Date();
    const pipeline = redisClient.multi();

    for (const user of users) {
      for (const window of windows) {
        const timeWindowStart = dayjs(now).subtract(window.days, 'day').toDate();
        const score = calculateScoreForUser(user, timeWindowStart);
        pipeline.zAdd(window.key, { score, value: user._id.toString() });
      }
    }

    await pipeline.exec();
  } catch (err) {
    console.error('Failed to refresh leaderboard entries:', err);
  }
}

export async function updateLeaderboard({ key, days }) {
  const now = new Date();
  const timeWindowStart = dayjs(now).subtract(days, 'day').toDate();

  try {
    if (!isRedisAvailable()) {
      console.warn('Redis is not available. Cannot update leaderboard.');
      return;
    }

    await redisClient.del(key);
    const cursor = User.find().cursor();
    const pipeline = redisClient.multi();

    for await (const user of cursor) {
      const score = calculateScoreForUser(user, timeWindowStart);
      if (score >= 0) {
        pipeline.zAdd(key, { score, value: user._id.toString() });
      }
    }

    await pipeline.exec();
    console.log(`Leaderboard '${key}' updated for last ${days} day(s).`);
  } catch (err) {
    console.error('Failed to update leaderboard:', err);
  }
}
