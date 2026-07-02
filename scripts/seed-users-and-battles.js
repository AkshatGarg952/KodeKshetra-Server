import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from '../src/database/mongoose.js';
import Battle from '../src/models/battle.model.js';
import User from '../src/models/user.model.js';
import UserDailyStats from '../src/models/user_daily_stats.model.js';
import { toDateKey } from '../src/helper/stats/dateBuckets.js';

dotenv.config();

const DEFAULT_PASSWORD = 'Password@123';
const SEED_TAG = 'seed-nov-2025';
const SEEDED_NAMES = [
  'Kartik',
  'Krish',
  'Aditya',
  'Ishaan',
  'Love',
  'Devansh',
  'Vansh',
  'Prakhar',
  'Akshat',
  'Aarav',
  'Arjun',
  'Rohan',
  'Rahul',
  'Aryan',
  'Vivaan',
  'Shaurya',
  'Atharv',
  'Siddharth',
  'Kunal',
  'Yash',
  'Lakshay',
  'Manav',
  'Nikhil',
  'Suyash',
  'Harsh',
  'Parth',
  'Rudra',
  'Tanish',
  'Dhruv',
  'Aniket',
  'Mayank',
  'Ansh',
  'Om',
  'Shivansh',
  'Pranav',
  'Gaurav',
  'Abhishek',
  'Sahil',
  'Tanmay',
  'Tejas',
  'Ishan',
  'Vedant',
  'Aayush',
  'Keshav',
  'Bharat',
  'Milan',
  'Sameer',
  'Imran',
  'Zaid',
  'Rehan',
  'Faizan',
  'Danish',
  'Chirag',
  'Deepak',
  'Mukul'
];
const USER_COUNT = SEEDED_NAMES.length;

const TOPICS = [
  'arrays',
  'strings',
  'binary-search',
  'dynamic-programming',
  'graphs',
  'greedy',
  'trees',
  'implementation'
];

const QUESTION_BANK = [
  { title: 'Two Sum', platform: 'LeetCode', problemId: '1', difficulty: 'Easy' },
  { title: 'Binary Search', platform: 'LeetCode', problemId: '704', difficulty: 'Easy' },
  { title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', problemId: '3', difficulty: 'Medium' },
  { title: 'Number of Islands', platform: 'LeetCode', problemId: '200', difficulty: 'Medium' },
  { title: 'Dijkstra?', platform: 'Codeforces', problemId: '20C', difficulty: 'Medium' },
  { title: 'A. Watermelon', platform: 'Codeforces', problemId: '4A', difficulty: 'Easy' },
  { title: 'B. Queue at the School', platform: 'Codeforces', problemId: '266B', difficulty: 'Easy' },
  { title: 'C. Koko and the Transformation', platform: 'Codeforces', problemId: '2013C', difficulty: 'Hard' }
];

const pad = (value) => String(value).padStart(2, '0');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (items) => items[randomInt(0, items.length - 1)];

const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const SEEDED_EMAILS = SEEDED_NAMES.map((name) => `${toSlug(name)}@gmail.com`);

const createDateInNovember2025 = (day, hour, minute) =>
  new Date(Date.UTC(2025, 10, day, hour, minute, randomInt(0, 59)));

const buildQuestion = (index) => {
  const base = QUESTION_BANK[index % QUESTION_BANK.length];
  return {
    ...base,
    seedTag: SEED_TAG,
    topic: pick(TOPICS),
    testCases: randomInt(8, 18),
    timeLimitMs: pick([1000, 1500, 2000]),
    memoryLimitMb: pick([128, 256, 512])
  };
};

const buildUserPayload = async (index) => {
  const id = index + 1;
  const name = SEEDED_NAMES[index];
  const slug = toSlug(name);
  const createdAt = createDateInNovember2025(((index * 3) % 28) + 1, 9 + (index % 9), (index * 7) % 60);
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const dsaEnabled = index % 2 === 0 || index % 5 === 0;
  const cpEnabled = index % 2 !== 0 || index % 4 === 0;
  const totalBattles = randomInt(2, 3);
  const totalWins = randomInt(0, totalBattles);
  const totalDraws = totalWins === totalBattles ? 0 : randomInt(0, totalBattles - totalWins);
  const xpBase = totalWins * 25 + totalDraws * 10 + randomInt(15, 70);

  return {
    userDoc: {
      profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      username: slug,
      password,
      email: `${slug}@gmail.com`,
      sections: {
        dsa: dsaEnabled,
        cp: cpEnabled
      },
      leetcodeId: dsaEnabled ? `lc_${slug}` : undefined,
      codeforcesId: cpEnabled ? `cf_${slug}` : undefined,
      rating: {
        dsa: dsaEnabled ? randomInt(1200, 1850) : undefined,
        cp: cpEnabled ? randomInt(900, 1700) : undefined
      },
      topicsMastered: new Map([
        [pick(TOPICS), randomInt(2, 7)],
        [pick(TOPICS), randomInt(1, 5)]
      ]),
      solvedQuestions: [
        { platform: 'LeetCode', problemId: String(100 + id) },
        { platform: 'Codeforces', problemId: `${800 + id}A` }
      ],
      earnedBadges: [],
      XP: [{ xp: xpBase, date: createdAt }],
      totalB: [{ date: createdAt, battlesPlayed: totalBattles }],
      totalW: [{ date: createdAt, battlesWon: totalWins }],
      totalD: [{ date: createdAt, battlesDraw: totalDraws }],
      maxStreak: randomInt(1, 6),
      currStreak: randomInt(0, 4),
      maxWinStreak: randomInt(1, 5),
      currWinStreak: randomInt(0, 3),
      createdAt
    },
    seedMeta: {
      totalBattles,
      totalWins,
      totalDraws,
      xpBase
    }
  };
};

const buildBattlesForUser = (user, allUsers, startIndex, seedMeta) => {
  const battles = [];
  const { totalBattles, totalWins } = seedMeta;

  for (let i = 0; i < totalBattles; i += 1) {
    const opponent = allUsers[(startIndex + i + 7) % allUsers.length];
    const day = ((startIndex + i) % 28) + 1;
    const createdAt = createDateInNovember2025(day, 11 + ((startIndex + i) % 8), (startIndex * 11 + i * 13) % 60);
    const shouldWin = i < totalWins;
    const isPrivate = (startIndex + i) % 3 === 0;

    battles.push({
      player1: user._id,
      player2: opponent._id,
      battleType: isPrivate ? 'private' : 'matchmaking',
      mode: i % 2 === 0 ? 'dsa' : 'cp',
      topic: pick(TOPICS),
      winner: shouldWin ? user._id : opponent._id,
      question: buildQuestion(startIndex + i),
      createdAt
    });
  }

  return battles;
};

const buildDailyStats = (user, seedMeta) => {
  const date = user.createdAt;
  const dateKey = toDateKey(date);
  const { totalBattles, totalWins, totalDraws, xpBase } = seedMeta;

  return {
    userId: user._id,
    dateKey,
    date,
    xp: xpBase,
    battlesPlayed: totalBattles,
    battlesWon: totalWins,
    battlesDraw: totalDraws,
    createdAt: date,
    updatedAt: date
  };
};

const main = async () => {
  try {
    await connectDB();

    const existingSeedUsers = await User.find({ email: { $in: SEEDED_EMAILS } }).select('_id');
    const seedUserIds = existingSeedUsers.map((user) => user._id);

    if (seedUserIds.length > 0) {
      await Promise.all([
        Battle.deleteMany({ $or: [{ player1: { $in: seedUserIds } }, { player2: { $in: seedUserIds } }] }),
        UserDailyStats.deleteMany({ userId: { $in: seedUserIds } }),
        User.deleteMany({ _id: { $in: seedUserIds } })
      ]);
      console.log(`Removed existing seeded dataset for ${seedUserIds.length} users.`);
    }

    const seedEntries = [];
    for (let index = 0; index < USER_COUNT; index += 1) {
      seedEntries.push(await buildUserPayload(index));
    }

    const insertedUsers = await User.insertMany(seedEntries.map((entry) => entry.userDoc), { ordered: true });
    const battles = insertedUsers.flatMap((user, index) =>
      buildBattlesForUser(user, insertedUsers, index, seedEntries[index].seedMeta)
    );
    const stats = insertedUsers.map((user, index) => buildDailyStats(user, seedEntries[index].seedMeta));

    await Battle.insertMany(battles, { ordered: true });
    await UserDailyStats.insertMany(stats, { ordered: true });

    console.log(`Seed complete: ${insertedUsers.length} users, ${battles.length} battles, ${stats.length} daily stat rows.`);
    console.log(`Login password for all seeded users: ${DEFAULT_PASSWORD}`);
    console.log('Example seeded accounts:');

    insertedUsers.slice(0, 5).forEach((user) => {
      console.log(`- ${user.email} | ${user.username}`);
    });
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void main();
