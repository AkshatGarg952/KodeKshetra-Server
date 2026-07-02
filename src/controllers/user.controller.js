import bcrypt from 'bcrypt'
import User from "../models/user.model.js"
import dayjs from "dayjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import leetcodeData from '../helper/fetchProfile/fetchLeetcode.js';
import codeforcesData from '../helper/fetchProfile/fetchCodeforces.js';
import badgesData from '../models/badge.model.js';
import UserDailyStats from '../models/user_daily_stats.model.js';
import { toDateKey } from '../helper/stats/dateBuckets.js';
dotenv.config();

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  sections: user.sections,
  leetcodeId: user.leetcodeId,
  codeforcesId: user.codeforcesId,
  rating: user.rating,
  currStreak: user.currStreak,
  maxStreak: user.maxStreak,
  currWinStreak: user.currWinStreak,
  maxWinStreak: user.maxWinStreak,
});

export default class UserC {
  async register(req, res) {
    const { username, password, email, leetcodeId, codeforcesId } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User Already exists! Try with another emailId." });
      }

      const newUserData = {
        email: email,
        username: username,
        rating: {},
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required." });
      }
      newUserData.password = await bcrypt.hash(password, 12);

      if (req.file) {
        newUserData.profilePicture = req.file.path;
      }

      if (leetcodeId) {
        newUserData.rating.dsa = 1500;
      }
      if (codeforcesId) {
        newUserData.rating.cp = 1200;
      }

      let newUser = await User.create(newUserData);
      if (leetcodeId) {
        newUser.sections.dsa = true;
        newUser.leetcodeId = leetcodeId;
      }
      if (codeforcesId) {
        try {
          await codeforcesData(newUser._id, codeforcesId);
          // Reload updated user document to avoid overwriting codeforces updates
          newUser = await User.findById(newUser._id);
          newUser.codeforcesId = codeforcesId;
          newUser.sections.cp = true;
        }
        catch (err) {
          console.error("Codeforces sync failed:", err.message);
          await User.findByIdAndDelete(newUser._id);
          return res.status(500).json({ message: "Server error: " + err.message });
        }
      }
      await newUser.save();
      const createdUser = await User.findById(newUser._id);
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
      res.status(200).json({ user: sanitizeUser(createdUser), token });
    }

    catch (err) {
      res.status(400).json({ message: err.message });
    }

  }


  async login(req, res) {
    const { email, password } = req.body;

    try {
      const oldUser = await User.findOne({ email });
      if (!oldUser) {
        return res.status(400).json({ message: "No User exists with this email!" });
      }

      const isMatch = await bcrypt.compare(password, oldUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Please check the credentials that you have entered!" });
      }
      const token = jwt.sign({ id: oldUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
      res.status(200).json({ user: sanitizeUser(oldUser), token });

    }

    catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async update(req, res) {
    const userId = req.params.id;

    try {
      if (!req.user || req.user.id !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User does not exist!" });
      }

      const allowedFields = ['username'];
      const updates = Object.keys(req.body);

      const isValidOperation = updates.every(field => allowedFields.includes(field));
      if (!isValidOperation) {
        return res.status(400).json({ message: "Invalid update fields detected!" });
      }

      if (req.file) {
        user.profilePicture = req.file.path;
      }

      for (const field of updates) {
        user[field] = req.body[field];
      }

      await user.save();

      return res.status(200).json({
        message: "User updated successfully!",
        user: sanitizeUser(user),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error: " + err.message });
    }
  }


  async getUserDetails(req, res) {
    const userId = req.params.userId;

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own profile summary." });
    }

    const startDate = dayjs().subtract(89, "day").startOf("day").toDate();

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User does not exist!" });
      }

      const dailyStats = await UserDailyStats.find({
        userId,
        date: { $gte: startDate }
      })
        .select('dateKey battlesPlayed')
        .lean();

      const counts = {};
      dailyStats.forEach((entry) => {
        counts[entry.dateKey] = (counts[entry.dateKey] || 0) + (entry.battlesPlayed || 0);
      });

      const heatmap = [];
      for (let i = 0; i < 90; i++) {
        const currentDate = dayjs(startDate).add(i, "day");
        const formatted = toDateKey(currentDate.toDate());

        heatmap.push({
          date: formatted,
          battles: counts[formatted] || 0
        });
      }

      let badgesCount = 0;
      user.earnedBadges.forEach(badge => {
        badgesCount += badge.quantity;
      });


      const badges = [];
      for (let i = 0; i < user.earnedBadges.length; i++) {
        const badgeInfo = badgesData[user.earnedBadges[i].badgeId - 1]
        if (badgeInfo) {
          badges.push({
            id: badgeInfo.id,
            title: badgeInfo.title,
            image: badgeInfo.image,
            quantity: user.earnedBadges[i].quantity,
          });
        }
      }

      const totals = await UserDailyStats.aggregate([
        {
          $match: {
            userId: user._id
          }
        },
        {
          $group: {
            _id: '$userId',
            totalBattles: { $sum: '$battlesPlayed' },
            totalWins: { $sum: '$battlesWon' }
          }
        }
      ]);

      const totalBattles = totals[0]?.totalBattles || 0;
      const totalWins = totals[0]?.totalWins || 0;


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

      res.status(200).send(ans);
    } catch (err) {
      res.status(400).json({ message: err.message });
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
