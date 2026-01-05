// import redisClient, { isRedisAvailable } from "../../redis/redisClient.js";
// import User from "../../models/user.model.js";
// import mongoose from "mongoose";

// export default async function getPaginatedLeaderboardFromRedis(key, page = 1, limit = 10) {
//   try {
//     if (!isRedisAvailable()) {
//       console.warn('⚠️ Redis is not available. Cannot fetch leaderboard.');
//       return { result: [], hasNextPage: false };
//     }

//     const start = (page - 1) * limit;
//     const end = start + limit; // Fetch one extra to check for next page

//     // ✅ Fetch from Redis with scores (highest to lowest)
//     const raw = await redisClient.zRange(key, start, end, {
//       REV: true,
//       WITHSCORES: true,
//     });

//     if (!raw || raw.length === 0) {
//       return { result: [], hasNextPage: false };
//     }

//     // Check if we have more items than limit
//     // raw array has (score, value) pairs, so length is 2x items.
//     // If we asked for limit+1 items, we expect at most (limit+1)*2 length.
//     // If raw.length > limit * 2, it means we have the extra item.
//     let hasNextPage = false;
//     let effectiveRaw = raw;

//     if (raw.length > limit * 2) {
//       hasNextPage = true;
//       effectiveRaw = raw.slice(0, limit * 2); // Remove the extra item
//     }

//     // ✅ Extract user IDs and scores
//     const userIds = [];
//     const scoresMap = {};
//     for (let i = 0; i < effectiveRaw.length; i += 2) {
//       const userId = effectiveRaw[i];
//       const score = parseFloat(effectiveRaw[i + 1]);
//       userIds.push(userId);
//       scoresMap[userId] = score;
//     }

//     // ✅ Convert string IDs to ObjectId for MongoDB
//     const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

//     // ✅ Fetch users from MongoDB
//     const users = await User.find({ _id: { $in: objectIds } })
//       .select("username profilePicture currentStreak")
//       .lean();

//     // ✅ Map users for quick lookup
//     const userMap = {};
//     users.forEach((user) => {
//       userMap[user._id.toString()] = user;
//     });

//     // ✅ Combine Redis rank & score with Mongo user info
//     const result = userIds
//       .map((userId, idx) => {
//         const user = userMap[userId];
//         if (!user) return null;
//         return {
//           rank: start + idx + 1, // global rank
//           username: user.username,
//           profilePicture: user.profilePicture,
//           currentStreak: user.currStreak,
//           points: isNaN(scoresMap[userId]) ? 0 : scoresMap[userId],
//         };
//       })
//       .filter(Boolean);

//     return { result, hasNextPage };
//   } catch (err) {
//     console.error("Error in getPaginatedLeaderboardFromRedis:", err);
//     return { result: [], hasNextPage: false };
//   }
// }


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
      console.warn("⚠️ Redis is not available. Cannot fetch leaderboard.");
      return { result: [], hasNextPage: false };
    }

    const start = (page - 1) * limit;
    const end = start + limit; // fetch one extra to check next page

    // Fetch leaderboard from Redis (highest score first)
    const effectiveRaw = await redisClient.zRangeWithScores(
      key,
      start,
      end,
      { REV: true }
    );

    if (!effectiveRaw || effectiveRaw.length === 0) {
      return { result: [], hasNextPage: false };
    }

    let hasNextPage = false;
    let itemsToProcess = effectiveRaw;

    if (effectiveRaw.length > limit) {
      hasNextPage = true;
      itemsToProcess = effectiveRaw.slice(0, limit);
    }

    // Extract userIds and scores
    const userIds = [];
    const scoresMap = {};

    for (const item of itemsToProcess) {
      const userId = item.value;
      const score = item.score;

      userIds.push(userId);
      scoresMap[userId] = score;
    }

    // Convert to ObjectIds for MongoDB
    const objectIds = userIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch users from MongoDB
    const users = await User.find({ _id: { $in: objectIds } })
      .select("username profilePicture currStreak")
      .lean();

    // Map users for quick lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Combine Redis data with Mongo user info
    const result = userIds
      .map((userId, idx) => {
        const user = userMap[userId];
        if (!user) return null;

        return {
          rank: start + idx + 1,
          username: user.username,
          profilePicture: user.profilePicture,
          currentStreak: user.currStreak,
          points: isNaN(scoresMap[userId]) ? 0 : scoresMap[userId],
        };
      })
      .filter(Boolean);

    return { result, hasNextPage };
  } catch (err) {
    console.error(
      "Error in getPaginatedLeaderboardFromRedis:",
      err
    );
    return { result: [], hasNextPage: false };
  }
}
