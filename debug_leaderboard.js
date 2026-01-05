import User from './src/models/user.model.js';
import connectDB from './src/database/mongoose.js';
import { updateLeaderboard } from './src/helper/leaderboard/scoreCalculation.js';
import dotenv from 'dotenv';
import redisClient from './src/redis/redisClient.js';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        // redisClient is already connected via top-level await in its module

        const users = await User.find({});
        console.log(`Found ${users.length} users in DB.`);

        for (const u of users) {
            console.log(`User: ${u.username} (${u._id})`);
            console.log(`  XP History: ${u.XP?.length || 0} entries`);
            console.log(`  Wins History: ${u.totalW?.length || 0} entries`);
            console.log(`  Battles History: ${u.totalB?.length || 0} entries`);
            // Simulating score calc check
            // Note: date logic inside scoreCalculation might filter out old entries?
        }

        console.log('Running manual updateLeaderboard(1 day)...');
        await updateLeaderboard({ key: 'leaderboard:1', days: 1 });

        const raw = await redisClient.zRange('leaderboard:1', 0, -1, { WITHSCORES: true });
        console.log('Redis leaderboard:1 content:', raw);

        console.log('Running manual updateLeaderboard(7 days)...');
        await updateLeaderboard({ key: 'leaderboard:7', days: 7 });

        console.log('Update complete.');
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
};

run();
