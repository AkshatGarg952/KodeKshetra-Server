import redisClient, { isRedisAvailable } from "../../redis/redisClient.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

export default async function getPaginatedLeaderboardFromRedis(
  key,
  page = 1,
  limit = 10
) {
  try {
    if (!isRedisAvailable()) {
      return { result: [], hasNextPage: false };
    }

    const start = (page - 1) * limit;
    const end = start + limit; // inclusive → limit + 1 items

    // Redis fetch
    const raw = await redisClient.zRangeWithScores(
      key,
      start,
      end,
      { REV: true }
    );

    

    if (!raw || raw.length === 0) {
      return { result: [], hasNextPage: false };
    }

    const hasNextPage = raw.length > limit;
    const items = hasNextPage ? raw.slice(0, limit) : raw;

    // Extract Redis IDs
    const redisIds = items.map(i => i.value);
    const scoresMap = {};
    items.forEach(i => {
      scoresMap[i.value] = i.score;
    });

    // ✅ VALIDATE ObjectIds
    const validObjectIds = redisIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    // 🚨 If Redis contains invalid IDs → do NOT query Mongo
    if (validObjectIds.length === 0) {
      return { result: [], hasNextPage };
    }

    // Mongo fetch
    const users = await User.find({ _id: { $in: validObjectIds } })
      .select("username profilePicture currStreak")
      .lean();

    // Map users
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    // Final response
    const result = redisIds
      .map((id, idx) => {
        const user = userMap[id];
        if (!user) return null;

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
  } catch (err) {
    console.error("Leaderboard error:", err);
    return { result: [], hasNextPage: false };
  }
}


