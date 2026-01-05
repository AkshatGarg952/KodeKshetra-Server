
import redisClient from './src/redis/redisClient.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import connectDB from './src/database/mongoose.js';

dotenv.config();

const inspect = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        const keys = ['leaderboard:1', 'leaderboard:7'];

        for (const key of keys) {
            console.log(`\n--- Ignoring ${key} ---`);
            const data = await redisClient.zRange(key, 0, -1, { WITHSCORES: true });

            if (data.length === 0) {
                console.log("  (Empty)");
                continue;
            }

            console.log("  Raw Redis Data [Member ID, Score]:");
            for (let i = 0; i < data.length; i += 2) {
                const memberId = data[i];
                const score = data[i + 1];

                // Try to find user to match ID
                let username = "UNKNOWN";
                if (mongoose.Types.ObjectId.isValid(memberId)) {
                    const u = await User.findById(memberId).select('username');
                    if (u) username = u.username;
                }

                console.log(`  - ${username} (${memberId}): ${score}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

inspect();
