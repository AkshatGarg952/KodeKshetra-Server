import mongoose from 'mongoose';
import dotenv from 'dotenv';
import leetcodeQuestion from './src/models/leetcode_questions.model.js';
import CFproblems from './src/models/codeforces_questions.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function fixMemoryLimits() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Updating LeetCode questions...');
        const leetcodeResult = await leetcodeQuestion.updateMany(
            { $or: [{ memoryLimit: 256 }, { memoryLimit: { $lt: 2048 } }] },
            { $set: { memoryLimit: 256000 } }
        );
        console.log(`LeetCode: ${leetcodeResult.modifiedCount} updated`);

        console.log('Updating Codeforces questions...');
        const cfResult = await CFproblems.updateMany(
            { $or: [{ memoryLimit: 256 }, { memoryLimit: { $lt: 2048 } }] },
            { $set: { memoryLimit: 256000 } }
        );
        console.log(`Codeforces: ${cfResult.modifiedCount} updated`);

        console.log('Done!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

fixMemoryLimits();
