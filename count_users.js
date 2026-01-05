import User from './src/models/user.model.js';
import connectDB from './src/database/mongoose.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const count = await User.countDocuments();
    const users = await User.find({}, 'username email totalW.date XP.date');
    console.log(`Total Users: ${count}`);
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}
run();
