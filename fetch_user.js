import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function getUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne();
    console.log("User ID:", user?._id.toString());
    await mongoose.disconnect();
}

getUser();
