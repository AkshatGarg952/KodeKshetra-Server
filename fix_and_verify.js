
import redisClient from './src/redis/redisClient.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import connectDB from './src/database/mongoose.js';
import { updateLeaderboard } from './src/helper/leaderboard/scoreCalculation.js';
import fs from 'fs';

dotenv.config();

const run = async () => {
    const logBack = [];
    const log = (...args) => {
        console.log(...args);
        logBack.push(args.join(' '));
    };

    try {
        await connectDB();
        log("✅ DB Connected");

        // 1. Force Update Leaderboards
        log("🔄 Updating Leaderboards...");
        await updateLeaderboard({ key: 'leaderboard:1', days: 1 });
        await updateLeaderboard({ key: 'leaderboard:7', days: 7 });

        // 2. Inspect Redis
        const keys = ['leaderboard:1', 'leaderboard:7'];
        for (const key of keys) {
            log(`\n🔍 Checking ${key}:`);
            const data = await redisClient.zRange(key, 0, -1, { WITHSCORES: true });

            if (data.length === 0) {
                log("   (Empty)");
                continue;
            }

            for (let i = 0; i < data.length; i += 2) {
                const memberId = data[i];
                const score = data[i + 1];

                let userDetails = "UNKNOWN";
                if (mongoose.Types.ObjectId.isValid(memberId)) {
                    const u = await User.findById(memberId);
                    if (u) {
                        userDetails = `${u.username} (Streak field: currStreak=${u.currStreak}, currentStreak=${u.currentStreak})`;
                    }
                }
                log(`   - Score: ${score} | User: ${userDetails} | ID: ${memberId}`);
            }
        }

    } catch (e) {
        log("❌ Error:", e);
    } finally {
        log("👋 Exiting...");
        fs.writeFileSync('verification_results.txt', logBack.join('\n'));
        process.exit();
    }
};

run();
