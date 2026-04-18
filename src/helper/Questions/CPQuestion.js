import CFproblems from "../../models/codeforces_questions.model.js";

const pickRandomQuestion = async (match = {}) => {
    const [question] = await CFproblems.aggregate([
        { $match: match },
        { $sample: { size: 1 } }
    ]);

    return question || null;
};

const getCPQuestion = async (battle, maxRating, user1Solved, user2Solved) => {
    const solvedIds = [...new Set([
        ...user1Solved.map((question) => question.problemId),
        ...user2Solved.map((question) => question.problemId)
    ])];
    const lowerBound = Math.max((maxRating || 0) - 300, 0);

    let finalQuestion = await pickRandomQuestion({
        tags: battle.topic,
        problemId: { $nin: solvedIds },
        rating: {
            $gte: lowerBound,
            $lte: maxRating || lowerBound + 300
        }
    });

    if (!finalQuestion) {
        finalQuestion = await pickRandomQuestion({
            tags: battle.topic,
            problemId: { $nin: solvedIds }
        });
    }

    if (!finalQuestion) {
        finalQuestion = await pickRandomQuestion({ tags: battle.topic });
    }

    if (!finalQuestion) {
        finalQuestion = await pickRandomQuestion();
    }

    return finalQuestion;
}

export default getCPQuestion;
