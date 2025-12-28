import redisClient, { isRedisAvailable } from "../../redis/redisClient.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import { calculateScoreForUser, updateLeaderboard } from "./scoreCalculation.js";

const parseDaysFromKey = (key) => {
  const [, rawDays] = String(key || "").split(":");
  const days = Number.parseInt(rawDays, 10);
  return Number.isFinite(days) && days > 0 ? days : 1;
};

const getPaginatedLeaderboardFromMongo = async ({ page, limit, days }) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const timeWindowStart = dayjs().subtract(days, "day").toDate();

  const users = await User.find()
    .select("username profilePicture currStreak XP totalW totalB")
    .lean();

  if (!users || users.length === 0) {
    return { result: [], hasNextPage: false };
  }

  const leaderboard = users
    .map((user) => ({
      username: user.username,
      profilePicture: user.profilePicture,
      currentStreak: user.currStreak || 0,
      points: calculateScoreForUser(user, timeWindowStart),
    }))
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.currentStreak !== a.currentStreak) {
        return b.currentStreak - a.currentStreak;
      }

      return String(a.username || "").localeCompare(String(b.username || ""));
    });

  const result = leaderboard.slice(start, end).map((player, idx) => ({
    rank: start + idx + 1,
    username: player.username,
    profilePicture: player.profilePicture,
    currentStreak: player.currentStreak,
    points: player.points,
  }));

  return {
    result,
    hasNextPage: end < leaderboard.length,
  };
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


