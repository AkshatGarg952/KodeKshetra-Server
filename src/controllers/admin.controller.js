import CFproblems from "../models/codeforces_questions.model.js";
import leetcodeQuestion from "../models/leetcode_questions.model.js";
import CFsolutions from "../models/codeforces_solutions.model.js";
import LeetCodeSolution from "../models/leetcode_solutions.model.js";
import bcrypt from 'bcrypt'
import User from "../models/user.model.js"
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function generateHiddenTests(problem, solution, platform) {
    try {
        const hiddenForcesUrl = process.env.HIDDEN_FORCES_URL || 'http://127.0.0.1:8000';
        const codeRunnerUrl = process.env.CODE_RUNNER_URL || 'http://127.0.0.1:9000';
        const endpoint = platform === 'codeforces'
            ? '/generate-codeforces-tests'
            : '/generate-leetcode-tests';

        console.log(`Calling Hidden Forces API: ${hiddenForcesUrl}${endpoint}`);

        const testInputsResponse = await axios.post(`${hiddenForcesUrl}${endpoint}`, {
            problem: problem
        }, {
            timeout: 300000
        });

        const hiddenTestInputs = testInputsResponse.data.hiddenTestCases || [];
        console.log(`Generated ${hiddenTestInputs.length} hidden test inputs`);

        if (hiddenTestInputs.length === 0) {
            console.warn('No hidden test cases generated');
            return [];
        }

        console.log('Generating outputs for hidden test cases...');
        const hiddenTestsWithOutputs = await axios.post(`${codeRunnerUrl}/execute`, {
            code: solution.code,
            language: solution.language,
            problem: {
                ...problem,
                testCases: hiddenTestInputs
            }
        }, {
            timeout: 60000
        });

        const outputs = hiddenTestsWithOutputs.data.outputs || [];
        console.log(`Generated ${outputs.length} outputs`);

        const hiddenTests = hiddenTestInputs.map((testInput, index) => ({
            input: testInput.input || testInput,
            output: outputs[index] || ''
        }));

        return hiddenTests;

    } catch (err) {
        console.error('Error generating hidden tests:', err.message);
        return [];
    }
}

export default class adminC {
    async addCFProblem(req, res) {
        const { email, password, problem, solution } = req.body;
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }

        try {
            problem.source = "codeforces";

            if (solution && solution.code && solution.language) {
                console.log('Generating hidden test cases for Codeforces problem...');
                const hiddenTests = await generateHiddenTests(problem, solution, 'codeforces');
                problem.hiddenTests = hiddenTests;
                console.log(`Added ${hiddenTests.length} hidden test cases to problem`);
            } else {
                console.warn('No solution provided, skipping hidden test generation');
            }

            await CFproblems.create(problem);
            res.status(200).send("Problem added successfully");
        }
        catch (err) {
            res.status(400).send(err.message);
        }


    }

    async addLCProblem(req, res) {
        const { email, password, problem, solution } = req.body;
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }
        try {
            problem.source = "leetcode";

            if (solution && solution.code && solution.language) {
                console.log('Generating hidden test cases for LeetCode problem...');
                const hiddenTests = await generateHiddenTests(problem, solution, 'leetcode');
                problem.hiddenTests = hiddenTests;
                console.log(`Added ${hiddenTests.length} hidden test cases to problem`);
            } else {
                console.warn('No solution provided, skipping hidden test generation');
            }

            await leetcodeQuestion.create(problem);
            res.status(200).send("Problem added successfully");
        }
        catch (err) {
            res.status(400).send(err.message);
        }
    }

    async addCFSolution(req, res) {
        const { email, password, solution } = req.body;
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }

        try {
            await CFsolutions.create(solution);
            res.status(200).send("Solution added successfully");
        }
        catch (err) {
            res.status(400).send(err.message);
        }
    }

    async addLCSolution(req, res) {
        const { email, password, solution } = req.body;
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }

        try {
            await LeetCodeSolution.create(solution);
            res.status(200).send("Solution added successfully");
        }
        catch (err) {
            res.status(400).send(err.message);
        }
    }


}