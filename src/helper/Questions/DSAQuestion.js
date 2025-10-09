import leetcodeQuestion from "../../models/leetcode_questions.model.js";

const getDSAQuestion = async (battle, user1Solved, user2Solved) => {
    const allQuestions = await leetcodeQuestion.find();

    const topicQuestions = allQuestions.filter((question) =>
        question.tags && question.tags.includes(battle.topic)
    );

    const unsolvedQuestions = topicQuestions.filter((question) => 
        !user1Solved.includes(question.problemId) && 
        !user2Solved.includes(question.problemId)
    );

    let finalQuestion;

    if (suitableQuestions.length === 0) {
        finalQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    } else {
        finalQuestion = suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)];
    }

    return finalQuestion;
}

export default getDSAQuestion;
