import redisClient, { isRedisAvailable } from "../../redis/redisClient.js";
import User from "../../models/user.model.js";
import UserDailyStats from "../../models/user_daily_stats.model.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import { updateLeaderboard } from "./scoreCalculation.js";

const parseDaysFromKey = (key) => {
  const [, rawDays] = String(key || "").split(":");
  const days = Number.parseInt(rawDays, 10);
  return Number.isFinite(days) && days > 0 ? days : 1;
};

const getPaginatedLeaderboardFromMongo = async ({ page, limit, days }) => {
  const start = (page - 1) * limit;
  const timeWindowStart = dayjs().subtract(days, "day").toDate();

  const aggregatedStats = await UserDailyStats.aggregate([
    {
      $match: {
        date: { $gte: timeWindowStart }
      }
    },
    {
      $group: {
        _id: "$userId",
        xp: { $sum: "$xp" },
        totalWins: { $sum: "$battlesWon" },
        matchesPlayed: { $sum: "$battlesPlayed" }
      }
    },
    {
      $addFields: {
        points: {
          $add: [
            { $multiply: ["$totalWins", 50] },
            { $multiply: ["$matchesPlayed", 5] },
            "$xp",
            {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      "$totalWins",
                      { $cond: [{ $gt: ["$matchesPlayed", 0] }, "$matchesPlayed", 1] }
                    ]
                  },
                  100
                ]
              }
            }
          ]
        }
      }
    },
    { $sort: { points: -1, _id: 1 } },
    { $skip: start },
    { $limit: limit + 1 }
  ]);

  if (aggregatedStats.length > 0) {
    const hasNextPage = aggregatedStats.length > limit;
    const pageRows = hasNextPage ? aggregatedStats.slice(0, limit) : aggregatedStats;
    const userIds = pageRows.map((row) => row._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select("username profilePicture currStreak")
      .lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const result = pageRows
      .map((row, idx) => {
        const user = userMap.get(row._id.toString());
        if (!user) {
          return null;
        }

        return {
          rank: start + idx + 1,
          username: user.username,
          profilePicture: user.profilePicture,
          currentStreak: user.currStreak || 0,
          points: row.points
        };
      })
      .filter(Boolean);

    return { result, hasNextPage };
  }

  // No rows in this time window.
  return { result: [], hasNextPage: false };
};

const formatRedisLeaderboard = async ({ raw, start, limit }) => {
  const hasNextPage = raw.length > limit;
  const items = hasNextPage ? raw.slice(0, limit) : raw;

  const redisIds = items.map((item) => item.value);
  const scoresMap = {};
  items.forEach((item) => {
    scoresMap[item.value] = item.score;
  });

  const validObjectIds = redisIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (validObjectIds.length === 0) {
    return { result: [], hasNextPage };
  }

  const users = await User.find({ _id: { $in: validObjectIds } })
    .select("username profilePicture currStreak")
    .lean();

  const userMap = {};
  users.forEach((user) => {
    userMap[user._id.toString()] = user;
  });

  const result = redisIds
    .map((id, idx) => {
      const user = userMap[id];
      if (!user) {
        return null;
      }

      return {
        rank: start + idx + 1,
        username: user.username,
        profilePicture: user.profilePicture,
        currentStreak: user.currStreak,
        points: scoresMap[id],
      };
    })
    .filter(Boolean);

  return { result, hasNextPage };
};

export default async function getPaginatedLeaderboardFromRedis(
  key,
  page = 1,
  limit = 10
) {
  try {
    const sanitizedPage = Number.isFinite(page) && page > 0 ? page : 1;
    const sanitizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
    const start = (sanitizedPage - 1) * sanitizedLimit;
    const end = start + sanitizedLimit;
    const days = parseDaysFromKey(key);

    if (isRedisAvailable()) {
      let raw = await redisClient.zRangeWithScores(
        key,
        start,
        end,
        { REV: true }
      );

      if ((!raw || raw.length === 0) && days > 0) {
        await updateLeaderboard({ key, days });
        raw = await redisClient.zRangeWithScores(
          key,
          start,
          end,
          { REV: true }
        );
      }

      if (raw && raw.length > 0) {
        const redisLeaderboard = await formatRedisLeaderboard({
          raw,
          start,
          limit: sanitizedLimit,
        });

        if (redisLeaderboard.result.length > 0 || redisLeaderboard.hasNextPage) {
          return redisLeaderboard;
        }
      }
    }

    return await getPaginatedLeaderboardFromMongo({
      page: sanitizedPage,
      limit: sanitizedLimit,
      days,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return await getPaginatedLeaderboardFromMongo({
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
      days: parseDaysFromKey(key),
    });
  }
}


