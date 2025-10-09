import redisClient from "../../redis/redisClient.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

export default async function getPaginatedLeaderboardFromRedis(key, page = 1, limit = 10) {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1; // ✅ Correct inclusive end index

    // ✅ Fetch from Redis with scores (highest to lowest)
    const raw = await redisClient.zRange(key, start, end, {
      REV: true,
      WITHSCORES: true,
    });

    if (!raw || raw.length === 0) {
      return { result: [], hasNextPage: false };
    }

    // ✅ Extract user IDs and scores
    const userIds = [];
    const scoresMap = {};
    for (let i = 0; i < raw.length; i += 2) {
      const userId = raw[i];
      const score = parseFloat(raw[i + 1]);
      userIds.push(userId);
      scoresMap[userId] = score;
    }

    // ✅ Convert string IDs to ObjectId for MongoDB
    const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

    // ✅ Fetch users from MongoDB
    const users = await User.find({ _id: { $in: objectIds } })
      .select("username profilePicture currentStreak")
      .lean();

    // ✅ Map users for quick lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // ✅ Combine Redis rank & score with Mongo user info
    const result = userIds
      .map((userId, idx) => {
        const user = userMap[userId];
        if (!user) return null;
        return {
          rank: start + idx + 1, // global rank
          username: user.username,
          profilePicture: user.profilePicture,
          currentStreak: user.currentStreak,
          points: scoresMap[userId],
        };
      })
      .filter(Boolean);

    // ✅ Pagination check
    const hasNextPage = raw.length / 2 > limit;

    return { result, hasNextPage };
  } catch (err) {
    console.error("Error in getPaginatedLeaderboardFromRedis:", err);
    return { result: [], hasNextPage: false };
  }
}
