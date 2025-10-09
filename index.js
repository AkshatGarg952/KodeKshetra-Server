import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from "./src/database/mongoose.js";
import userRouter from './src/routes/user.routes.js';
import adminRouter from './src/routes/admin.routes.js';
import User from './src/models/user.model.js';
import Battle from './src/models/battle.model.js';
import getQuestionForBattle from "./src/helper/Questions/fetchQuestion.js"
import addUserToQueue from "./src/redis/matchmakingController.js"
import tryToMatch from "./src/redis/matchmaker.js";
import getPaginatedLeaderboardFromRedis from './src/helper/leaderboard/getLeaderboard.js'
import calculateXP from './src/helper/XP/XPCalculator.js';
import cors from "cors";
import cancelMatchmaking from './src/redis/cancelMatchmaking.js';
import {decideWinner} from './src/helper/winner/decideWinner.js';
import updateXP from "./src/helper/XP/UpdateXP.js"
import battleUpdate from "./src/helper/updation/battleUpdate.js"
import setStreaks from "./src/helper/updation/setStreaks.js";
import badgesEarned from './src/helper/badges/Badges.js';
import leetcodeQuestion from "./src/models/leetcode_questions.model.js";
import LeetCodeSolution from "./src/models/leetcode_solutions.model.js";
import CFproblems from "./src/models/codeforces_questions.model.js";
import CFsolutions from "./src/models/codeforces_solutions.model.js";
import { defineScript } from 'redis';
import { updateLeaderboard } from './src/helper/leaderboard/scoreCalculation.js';
import axios from 'axios'
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: "https://kode-kshetra-client.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.get("/", async (req, res) => {
  try{
    const result = await CFsolutions.findOne({ problemId: "1A" });
    res.status(200).send(result);
  } catch (err) { 
    res.status(400).send(err.message);
  }
});


app.use('/api/users', userRouter);

app.use('/api/admin', adminRouter);
app.get("/leaderboard/:period/:page", async (req, res) => {
  const { period, page } = req.params;
  try {
    const { result, hasNextPage  } = await getPaginatedLeaderboardFromRedis(
      `leaderboard:${period}`,
      page
    );
    console.log(result)
    res.status(200).json({
      data:result,
      isNextPage:hasNextPage 
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Failed to load leaderboard." });
  }
});

app.post('/run', async (req, res) => {
  let { code, language, problem } = req.body;
  if (problem.source === 'codeforces') {
    problem = await CFproblems.findOne({ problemId: problem.problemId });
  } else if (problem.source === 'leetcode') {
    problem = await leetcodeQuestion.findOne({ problemId: problem.problemId });
  }
  try {
     const response = await axios.post('https://code-runner-lhdb.onrender.com/run', {
      code,
      language,
      problem
    });
    const data = response.data;
  
    res.status(200).json(data);
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/submit', async (req, res) => {
  let { code, language, problem } = req.body;
  if (problem.source === 'codeforces') {
    problem = await CFproblems.findOne({ problemId: problem.problemId });
  } else if (problem.source === 'leetcode') {
    problem = await leetcodeQuestion.findOne({ problemId: problem.problemId });
  }
  try {
     const response = await axios.post('https://code-runner-lhdb.onrender.com/submit', {
      code,
      language,
      problem
    });
    const data = response.data;
  
    res.status(200).json(data);
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/post', async (req, res) => {
  let { code, language, problem } = req.body;
  if (problem.source === 'codeforces') {
    problem = await CFproblems.findOne({ problemId: problem.problemId });
  } else if (problem.source === 'leetcode') {
    problem = await leetcodeQuestion.findOne({ problemId: problem.problemId });
  }
  try {
     const response = await axios.post('https://code-runner-lhdb.onrender.com/submit', {
      code,
      language,
      problem
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// app.post('/run', async (req, res) => {
//   let { code, language, problem } = req.body;
//   if (problem.source === 'codeforces') {
//     problem = await CFproblems.findOne({ problemId: problem.problemId });
//   } else if (problem.source === 'leetcode') {
//     problem = await leetcodeQuestion.findOne({ problemId: problem.problemId });
//   }

//   if (!code || !language || !problem) {
//     return res.status(400).json({ error: 'Missing code/language/problem' });
//   }
  
//   const testcases = getTestcases(problem, false);
//   const timeLimit = problem.timeLimit;
//   const memoryLimit = problem.memoryLimit;

//   try {
//     const execResult = await executeCode(code, language, testcases, timeLimit, memoryLimit);
    
//     if (execResult.isError === false) {
//       return res.json({
//         note: '✅ All sample test cases passed'
//       });
//     } else {
//       return res.json({
//         note: '❌ Code failed on a sample test case',
//         errorType: execResult.errorType,
//         message: execResult.message,
//         failingTest: execResult.result || null
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// app.post('/submit', async (req, res) => {
//   let { code, language, problem } = req.body;
//   if (problem.source === 'codeforces') {
//     problem = await CFproblems.findOne({ problemId: problem.problemId });
//   } else if (problem.source === 'leetcode') {
//     problem = await leetcodeQuestion.findOne({ problemId: problem.problemId });
//   }

//   if (!code || !language || !problem) {
//     return res.status(400).json({ error: 'Missing code/language/problem' });
//   }

//   const testcases = getTestcases(problem, true);
//   const timeLimit = problem.timeLimit;
//   const memoryLimit = problem.memoryLimit;

//   try {
//     const execResult = await executeCode(code, language, testcases, timeLimit, memoryLimit);
    
//     if (execResult.isError === false) {
//       return res.json({
//         note: '✅ All sample test cases passed'
//       });
//     } else {
//       return res.json({
//         note: '❌ Code failed on a sample test case',
//         errorType: execResult.errorType,
//         message: execResult.message,
//         failingTest: execResult.result || null
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://kode-kshetra-client.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map(); 
const battleRooms = new Map();
const battleSubmissions = new Map();
const battles = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
   
  if (userId) {
    onlineUsers.set(userId, socket.id);
  }
  
  
  socket.on('disconnect', () => {
    
    for (let [battleId, userSet] of battleRooms.entries()) {
    if (userSet.has(userId)) {
      userSet.delete(userId);

      if (userSet.size === 0) {
        battleRooms.delete(battleId);
      }
    }
  }

    onlineUsers.delete(userId);

  });


    socket.on("cancelMatchmaking", async ({ userId, mode, topic }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      socket.emit("cancelMatchmakingResponse", { 
        success: false, 
        message: "❌ Cannot find the user!" 
      });
      return;
    }

    const success = await cancelMatchmaking({ userId, mode, topic });

    if (success) {
      socket.emit("cancelMatchmakingResponse", { 
        success: true, 
        message: "✅ Matchmaking cancelled successfully." 
      });
    } else {
      socket.emit("cancelMatchmakingResponse", { 
        success: false, 
        message: "⚠️ Could not cancel matchmaking (maybe not in queue)." 
      });
    }

  } catch (err) {
    console.error("Cancel matchmaking error:", err.message);
    socket.emit("cancelMatchmakingResponse", { 
      success: false, 
      message: "⚠️ Server error while cancelling matchmaking." 
    });
  }
});


    socket.on("joinQueue", async ({ userId, mode, topic }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return;
        }

        const rating = user.progress?.[mode]?.rating || 1200;

        await addUserToQueue({ userId, mode, topic, rating });
        await tryToMatch(mode, topic, io, onlineUsers);

      } catch (err) {
        console.error("Error in joinQueue:", err);
      }
    });


  socket.on("joinBattleRoom", async({ battle, userId, roomId }) => {
        if (battleRooms.has(roomId) && battleRooms.get(roomId).size >= 2) {    
    socket.emit("battleJoinError", {
      message: "Room is full. Cannot join the battle."
    });
    return;
    }
    
    socket.join(roomId); 
    if (!battleRooms.has(roomId)) {   
      battleRooms.set(roomId, new Set());
    }
    
    if(!battleRooms.get(roomId).has(userId)){
    battleRooms.get(roomId).add(userId);
    }
    
    if (battle && battle.mode && battle.topic && !battles.has(roomId)) {
    battles.set(roomId, { mode: battle.mode, topic: battle.topic });
}
  
    const joinedUsers = battleRooms.get(roomId);
    if (joinedUsers.size === 2) {
      const userIds = [...joinedUsers];
      const user1 = await User.findById(userIds[0]);
      const user2 = await User.findById(userIds[1]);
      
      const battle = battles.get(roomId);
      let newBattle = {
        player1: user1._id,
        player2: user2._id,
        question: {},
        mode: battle.mode,
        topic: battle.topic
      };
      let question = await getQuestionForBattle(battle, user1, user2); 
      newBattle.question = question
      newBattle = await Battle.create(newBattle);
      let finalQuestion;
      if(battle.mode==="cp"){
      const { _id, hiddenTestCases, __v, ...safeQuestion } = question.toObject ? question.toObject() : question;
      finalQuestion = safeQuestion;
      }
      else if(battle.mode==="dsa"){
      const { _id, source, url, memoryLimit, timeLimit, completeCodeTemplates
,  hiddenTests, __v, ...safeQuestion } = question.toObject ? question.toObject() : question;
      finalQuestion = safeQuestion;
      }
      io.to(roomId).emit("battleStart", {
        question: finalQuestion,
        battleId: newBattle._id,
});
    }
  });

  
  socket.on("battleEnded", async ({ battleDetails, userId, code, roomId, lost}) => {
    if(battleSubmissions.has(battleDetails.battleId)){
      console.log("Second submission received, deciding winner...",battleDetails.timeRemaining);
         try{
          const user = await User.findById(userId);
         const battle = await Battle.findById(battleDetails.battleId);
          if(!battle){
            throw new Error("Cannot find any battle!");
          } 
          const question = battle.question;
         let player1 = battleSubmissions.get(battleDetails.battleId);
         let player2 = {
          id: userId,
          code: code || "", 
          time: battleDetails.timeRemaining || 1800,
          currWinStreak: user.currWinStreak,
          language: battleDetails.language || null,
         }

         const preStatus = player1.status 
         if(preStatus){
          if(preStatus === "won"){  
            player2.status = "loss";
          }
          else if(preStatus === "loss"){
            player2.status = "won";
          }
          else{
            player2.status = "draw";
          }
         }

         
         if(battle.player1.toString() === userId){
            const player = player1
            player1 = player2;
            player2 = player;
          }

        //  Logic starts to calculate winner
        if(!player1.status && !player2.status){
          console.log("Calculating winner based on test cases passed and time taken...");
          const player1PassedCases = await decideWinner(player1.code, player1.language, question);
          const player2PassedCases = await decideWinner(player2.code , player2.language, question);
          console.log(player1.time, player2.time);
         if(player1PassedCases > player2PassedCases){
          player1.status = "won";
          player2.status = "loss";
         }
         else if(player1PassedCases < player1PassedCases){
          player1.status = "loss";
          player2.status = "won";
         }
         else{
          console.log("Both players passed same number of test cases, checking time taken...");
          if(player1.time > player2.time){
            player1.status = "won";
            player2.status = "loss";
          }
          else if(player1.time < player2.time){
            player1.status = "loss";
            player2.status = "won";
          }
          else{
          battle.winner = null;
          player1.status = "draw";
          player2.status = "draw";
          }
         }
        }
         //  Logic end to calculate winner

        //  Logic starts to calculate XP
        
        player1.xp = calculateXP(player1)
        player2.xp = calculateXP(player2); 
        
        // Logic ends to calculate XP
         
         const user1 = await User.findById(player1.id);
         const user2 = await User.findById(player2.id);
         
        //  Logic starts to set XP  
        updateXP(player1);
        updateXP(player2);
        // Logic ends to set XP
        
        
        // Logic starts to set totalB and totalW
        battleUpdate(player1);
        battleUpdate(player2);
        // Logic ends to set totalB and totalW

        //  Logic starts to set streaks
        setStreaks(player1);
        setStreaks(player2);
         //  Logic ends to update the streaks
        
        //  Logic starts to update the solved Questions

        if(battle.mode === "cp"){
           user1.solvedQuestions.push({
           platform: "Codeforces",
          problemId: question.problemId,
                                     });


         user2.solvedQuestions.push({
           platform: "Codeforces",
          problemId: question.problemId,
                                     });
        }
        else{

           user1.solvedQuestions.push({
           platform: "Leetcode",
          problemId: question.problemId,
                                     });

           user2.solvedQuestions.push({
           platform: "Leetcode",
          problemId: question.problemId,
                                     });

        }

        await user1.save();
        await user2.save();
        //  Logic ends to update the solved Questions
        
        for(let i = 0; i < question.tags.length; i++){
          const topic = question.tags[i];
          user1.topicsMastered.set(topic, (user1.topicsMastered.get(topic) || 0) + 1);
          user2.topicsMastered.set(topic, (user2.topicsMastered.get(topic) || 0) + 1);
        }
        await user1.save();
        await user2.save();
        
        // badgesEarned(player1); // ye function complete karna hai
        // badgesEarned(player2);

        battleSubmissions.delete(battleDetails.battleId);
        
        if(roomId){
          battleRooms.delete(roomId);
          battles.delete(roomId);
        }

        await updateLeaderboard({ key: 'leaderboard:1', days: 1 });
        await updateLeaderboard({ key: 'leaderboard:7', days: 7 });

        const targetSocketId1 = onlineUsers.get(player1.id);
        const targetSocketId2 = onlineUsers.get(player2.id);
        console.log(player1.status, player2.status);
        io.to(targetSocketId1).emit("battleResult", player1.status);
        io.to(targetSocketId2).emit("battleResult", player2.status);
           
      }
         catch(err){
          console.error(err.message);
         }

        
    }

    else{
      const user = await User.findById(userId);
      
      const player = {
        id: userId,
        code: code || "",
        time: battleDetails.timeRemaining || 0,
        currWinStreak: user.currWinStreak,
        language: battleDetails.language || null,
      };
      if(lost){
        player.status = "loss";
      } 
      battleSubmissions.set(battleDetails.battleId, player);
       console.log("First submission received, waiting for opponent...", battleDetails.timeRemaining);
    }
  })


});


const PORT = process.env.PORT_NO || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
