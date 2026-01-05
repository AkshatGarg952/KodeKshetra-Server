import mongoose from 'mongoose';
import dotenv from 'dotenv';
import leetcodeQuestion from './src/models/leetcode_questions.model.js';
import CFproblems from './src/models/codeforces_questions.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function updateMemoryLimits() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const leetcodeUpdated = await leetcodeQuestion.updateMany(
            { memoryLimit: { $lt: 2048 } },
            { $mul: { memoryLimit: 1000 } }
        );
        console.log(`✅ Updated ${leetcodeUpdated.modifiedCount} LeetCode questions`);

        const codeforcesUpdated = await CFproblems.updateMany(
            { memoryLimit: { $lt: 2048 } },
            { $mul: { memoryLimit: 1000 } }
        );
        console.log(`✅ Updated ${codeforcesUpdated.modifiedCount} Codeforces questions`);

        console.log('\n📊 Summary:');
        console.log(`   - LeetCode questions updated: ${leetcodeUpdated.modifiedCount}`);
        console.log(`   - Codeforces questions updated: ${codeforcesUpdated.modifiedCount}`);
        console.log('\n✅ Memory limits have been converted from MB to KB');

    } catch (error) {
        console.error('❌ Error updating memory limits:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

updateMemoryLimits();
