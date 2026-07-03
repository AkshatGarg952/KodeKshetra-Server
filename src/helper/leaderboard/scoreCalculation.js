import redisClient, { isRedisAvailable } from '../../redis/redisClient.js';
import User from '../../models/user.model.js';
import UserDailyStats from '../../models/user_daily_stats.model.js';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

const DEFAULT_LEADERBOARD_WINDOWS = [
  { key: 'leaderboard:1', days: 1 },
  { key: 'leaderboard:7', days: 7 }
];

export function calculateScoreForStats({ xp = 0, totalWins = 0, matchesPlayed = 0 }) {
  const totalPoints =
    ((totalWins || 0) * 50) +
    ((matchesPlayed || 0) * 5) +
    (xp || 0) +
    Math.floor(((totalWins || 0) / Math.max((matchesPlayed || 0), 1)) * 100);

  return Number.isNaN(totalPoints) ? 0 : totalPoints;
}

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

  return calculateScoreForStats({ xp, totalWins, matchesPlayed });
}

export async function getUserScoresByWindow({ userIds, days }) {
  const timeWindowStart = dayjs().subtract(days, 'day').startOf('day').toDate();
  const match = {
    date: { $gte: timeWindowStart }
  };

  if (Array.isArray(userIds) && userIds.length > 0) {
    match.userId = {
      $in: userIds
        .map((userId) => userId.toString())
        .filter((userId) => mongoose.Types.ObjectId.isValid(userId))
        .map((userId) => new mongoose.Types.ObjectId(userId))
    };
  }

  const rows = await UserDailyStats.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$userId',
        xp: { $sum: '$xp' },
        totalWins: { $sum: '$battlesWon' },
        matchesPlayed: { $sum: '$battlesPlayed' }
      }
    }
  ]);

  const scoreMap = new Map();
  rows.forEach((row) => {
    scoreMap.set(
      row._id.toString(),
      calculateScoreForStats({
        xp: row.xp,
        totalWins: row.totalWins,
        matchesPlayed: row.matchesPlayed
      })
    );
  });

  return scoreMap;
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

    const pipeline = redisClient.multi();
    const scoreMaps = await Promise.all(
      windows.map((window) => getUserScoresByWindow({ userIds: uniqueUserIds, days: window.days }))
    );

    for (let index = 0; index < windows.length; index++) {
      const window = windows[index];
      const scoreMap = scoreMaps[index];

      uniqueUserIds.forEach((userId) => {
        pipeline.zAdd(window.key, {
          score: scoreMap.get(userId) || 0,
          value: userId
        });
      });
    }

    await pipeline.exec();
  } catch (err) {
    console.error('Failed to refresh leaderboard entries:', err);
  }
}

export async function updateLeaderboard({ key, days }) {
  try {
    if (!isRedisAvailable()) {
      console.warn('Redis is not available. Cannot update leaderboard.');
      return;
    }

    await redisClient.del(key);
    const cursor = User.find().select('_id').cursor();
    const pipeline = redisClient.multi();
    const batch = [];

    const flushBatch = async () => {
      if (batch.length === 0) {
        return;
      }

      const scoreMap = await getUserScoresByWindow({ userIds: batch, days });
      batch.forEach((userId) => {
        if (scoreMap.has(userId)) {
          pipeline.zAdd(key, {
            score: scoreMap.get(userId) || 0,
            value: userId
          });
        }
      });
      batch.length = 0;
    };

    for await (const user of cursor) {
      batch.push(user._id.toString());
      if (batch.length >= 200) {
        await flushBatch();
      }
    }

    await flushBatch();
    await pipeline.exec();
    console.log(`Leaderboard '${key}' updated for last ${days} day(s).`);
  } catch (err) {
    console.error('Failed to update leaderboard:', err);
  }
}
