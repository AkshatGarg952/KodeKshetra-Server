import leetcodeQuestion from "../../models/leetcode_questions.model.js";

const pickRandomQuestion = async (match = {}) => {
    const [question] = await leetcodeQuestion.aggregate([
        { $match: match },
        { $sample: { size: 1 } }
    ]);

    return question || null;
};

const getDSAQuestion = async (battle, user1Solved, user2Solved) => {
    const solvedIds = [...new Set([
        ...user1Solved.map((question) => question.problemId),
        ...user2Solved.map((question) => question.problemId)
    ])];

    let finalQuestion = await pickRandomQuestion({
        tags: battle.topic,
        problemId: { $nin: solvedIds }
    });

    if (!finalQuestion) {
        finalQuestion = await pickRandomQuestion({ tags: battle.topic });
    }

    if (!finalQuestion) {
        finalQuestion = await pickRandomQuestion();
    }

    return finalQuestion;
}

export default getDSAQuestion;
