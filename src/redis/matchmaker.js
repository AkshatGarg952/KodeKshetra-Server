import { v4 as uuidv4 } from "uuid";
import redisClient from './redisClient.js';
import User from '../models/user.model.js';
import Battle from '../models/battle.model.js';
import getQuestionForBattle from "../helper/Questions/fetchQuestion.js";

async function tryToMatch(mode, topic, io, onlineUsers) {
  console.log("online", onlineUsers)
  const queueKey = `${mode}:${topic}`;
  const queue = await redisClient.lRange(queueKey, 0, -1);
  const parsedQueue = queue.map(user => JSON.parse(user));
  
  for (let i = 0; i < parsedQueue.length; i++) {
    for (let j = i + 1; j < parsedQueue.length; j++) {
      const user1 = parsedQueue[i];
      const user2 = parsedQueue[j];

      // Match if rating difference <= 200
      if (Math.abs(user1.rating - user2.rating) <= 200) {

        // Remove matched users from queue
        await redisClient.lRem(queueKey, 1, JSON.stringify(user1));
        await redisClient.lRem(queueKey, 1, JSON.stringify(user2));

        // Create battle
        const battleId = uuidv4();
        const userx = await User.findById(user1.userId);
        const usery = await User.findById(user2.userId);
        
        const battle = {mode:mode, topic:topic}
        let question = await getQuestionForBattle(battle, userx, usery);

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
      
      console.log("finalQuestion", finalQuestion)
        const battleData = {
          player1: user1.userId,
          player2: user2.userId,
          mode,
          topic,
          question
        };

        const newBattle = await Battle.create(battleData);
        // Notify both users
        const socket1 = onlineUsers.get(user1.userId);
        const socket2 = onlineUsers.get(user2.userId);

        if (socket1) {
          console.log("emitting to socket1");
          io.to(socket1).emit("battleStart", { question: finalQuestion, battleId: newBattle._id });
        }
        if (socket2) {
          console.log("emitting to socket2");
          io.to(socket2).emit("battleStart", { question: finalQuestion, battleId: newBattle._id });
        }

        return;
      }
    }
  }
}

export default tryToMatch;
