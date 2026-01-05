import mongoose from 'mongoose';
import dotenv from 'dotenv';
import leetcodeQuestion from './src/models/leetcode_questions.model.js';
import CFproblems from './src/models/codeforces_questions.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkMemoryLimits() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const leetcodeProblems = await leetcodeQuestion.find({}).limit(5);
        console.log('📊 Sample LeetCode Problems:');
        leetcodeProblems.forEach(p => {
            console.log(`   - ${p.problemId}: memoryLimit = ${p.memoryLimit}`);
        });

        const cfProblems = await CFproblems.find({}).limit(5);
        console.log('\n📊 Sample Codeforces Problems:');
        cfProblems.forEach(p => {
            console.log(`   - ${p.problemId}: memoryLimit = ${p.memoryLimit}`);
        });

        const leetcodeLowMemory = await leetcodeQuestion.countDocuments({ memoryLimit: { $lt: 2048 } });
        const cfLowMemory = await CFproblems.countDocuments({ memoryLimit: { $lt: 2048 } });

        console.log('\n⚠️  Problems with memory limit < 2048 KB:');
        console.log(`   - LeetCode: ${leetcodeLowMemory}`);
        console.log(`   - Codeforces: ${cfLowMemory}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

checkMemoryLimits();
