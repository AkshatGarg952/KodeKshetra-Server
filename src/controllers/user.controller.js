import bcrypt from 'bcrypt'
import User from "../models/user.model.js"
import dayjs from "dayjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import leetcodeData from '../helper/fetchProfile/fetchLeetcode.js';
import codeforcesData from '../helper/fetchProfile/fetchCodeforces.js';
import badgesData from '../models/badge.model.js';
dotenv.config();

export default class UserC{
    async register(req, res){
     const {username, password, email, leetcodeId, codeforcesId} = req.body;
     console.log(req.body);

     try{
     if(await User.findOne({email})){
        return res.status(400).send("User Already exists! Try with another emailId.");
    }
      
    const newUserData  = {
        email:email,
        username:username,
    }
    
    if (!password) {
        return res.status(400).send("Password is required.");
      }
      newUserData.password = await bcrypt.hash(password, 12);
    
    if (req.file) {
      newUserData.profilePicture = req.file.path;
    }
    
    const newUser = await User.create(newUserData);
    if(leetcodeId){
    newUser.sections.dsa = true;
    newUser.leetcodeId = req.body.leetcodeId;
    newUser.rating.dsa = 1500;
    }
    if(codeforcesId){
    try {
        await codeforcesData(newUser._id, req.body.codeforcesId);
        newUser.codeforcesId = req.body.codeforcesId;
        newUser.sections.cp = true;
            } 
        catch (err) {
          console.log("cf", err.message)
        return res.status(500).send("Server error: " + err.message);
          }
    }
    await newUser.save();
    const n = await User.findById(newUser._id)
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({n, token});
    }

    catch(err){
        res.status(400).send(err.message);
    }
     
    }


    async login(req, res){
        const {email, password} = req.body;

        try{
        const oldUser = await User.findOne({email});
        if(!oldUser){
            return res.status(400).send("No User exists with this email!");
        }

        const isMatch = await bcrypt.compare(password, oldUser.password);
        if(!isMatch){
            return res.status(400).send("Please check the credentials that you have entered!");
        }
        const token = jwt.sign({ id: oldUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({oldUser, token});
         
        }

        catch(err){
            res.status(400).send(err.message);
        }
    }

    async update(req, res) {
  const userId = req.params.id;
  console.log("Updating user:", userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User does not exist!");
    }
    
    const allowedFields = ['username']; 
    const updates = Object.keys(req.body);
    
    const isValidOperation = updates.every(field => allowedFields.includes(field));
    if (!isValidOperation) {
      return res.status(400).send("Invalid update fields detected!");
    }

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    for (const field of updates) {
      
        user[field] = req.body[field];
      
    }

    console.log("Updated User", await user.save());

    return res.status(200).json({
      message: "User updated successfully!",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
}


 async getUserDetails(req, res) {
  const userId = req.params.userId;
  console.log(userId);
  
  const startDate = dayjs().subtract(89, "day").startOf("day").toDate();

  try {
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).send("User does not exist!");
    }

    const counts = {};
    user.totalB.forEach(battle => {
      if (battle.date >= startDate) {
        const day = dayjs(battle.date).format("YYYY-MM-DD");
        counts[day] = (counts[day] || 0) + battle.battlesPlayed;
      }
    });
    
    const heatmap = [];
    for (let i = 0; i < 90; i++) {
      const currentDate = dayjs(startDate).add(i, "day");
      const formatted = currentDate.format("YYYY-MM-DD");
      
      heatmap.push({
        date: formatted,
        battles: counts[formatted] || 0
      });
    }

    console.log(heatmap);

    let badgesCount = 0;
    user.earnedBadges.forEach(badge => {
      badgesCount += badge.quantity;
    });

    
    const badges = [];
    for(let i=0;i<user.earnedBadges.length;i++){
      const badgeInfo =  badgesData[user.earnedBadges[i].badgeId - 1]
      if(badgeInfo){  
        badges.push({
          id: badgeInfo.id, 
          title: badgeInfo.title,
          image: badgeInfo.image,
          quantity: user.earnedBadges[i].quantity, 
        });
      }
    }

    const totalBattles = user.totalB.reduce((acc, b) => acc + (b.battlesPlayed || 0), 0);
    const totalWins = user.totalW.reduce((acc, w) => acc + (w.battlesWon || 0), 0);

    
    const ans = {
      totalB: totalBattles,
      totalW: totalWins,
      maxStreak: user.maxStreak,
      currStreak: user.currStreak,
      maxWinStreak: user.maxWinStreak,
      currWinStreak: user.currWinStreak,
      badgesCount: badgesCount,
      heatmap: heatmap,
      profilePicture: user.profilePicture,
      username: user.username,
      badgesData: badges
    }

    console.log(ans.badgesCount);

    res.status(200).send(ans);
  } catch(err){
    res.status(400).send(err.message);
  }
}

async logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: '/'
        });
        
        res.status(200).json({ 
            message: "Logged out successfully" 
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ 
            error: "Server error during logout" 
        });
    }
}



}