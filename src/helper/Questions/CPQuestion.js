import CFproblems from "../../models/codeforces_questions.model.js";

const getCPQuestion = async (battle, maxRating, user1Solved, user2Solved) => {
    const allQuestions = await CFproblems.find();

    const topicQuestions = allQuestions.filter((question) =>
        question.tags && question.tags.includes(battle.topic)
    );

    const user1SolvedIds = new Set(user1Solved.map(q => q.problemId));
    const user2SolvedIds = new Set(user2Solved.map(q => q.problemId));

    const unsolvedQuestions = topicQuestions.filter((question) =>
        !user1SolvedIds.has(question.problemId) &&
        !user2SolvedIds.has(question.problemId)
    );

    let suitableQuestions = unsolvedQuestions.filter((question) =>
        question.rating <= maxRating &&
        question.rating >= (maxRating - 300)
    );

    let finalQuestion;

    if (suitableQuestions.length === 0) {
        finalQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    } else {
        finalQuestion = suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)];
    }

    return finalQuestion;
}

export default getCPQuestion;
