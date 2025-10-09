import getCPQuestion from "./CPQuestion.js";
import getDSAQuestion from "./DSAQuestion.js";

const getQuestionForBattle = async (battle, user1, user2) => {
  const user1Solved = user1?.solvedQuestions ?? [];
  const user2Solved = user2?.solvedQuestions ?? [];

  const user1CF = user1?.rating?.codeforces ?? 0;
  const user2CF = user2?.rating?.codeforces ?? 0;

  if (battle.mode === "cp") {
    
    return await getCPQuestion(
      battle,
      Math.max(user1CF, user2CF),
      user1Solved,
      user2Solved
    );
  } else if (battle.mode === "dsa") {
    return await getDSAQuestion(battle, user1Solved, user2Solved);
  } else {
    throw new Error("Invalid battle mode");
  }
};

export default getQuestionForBattle;
