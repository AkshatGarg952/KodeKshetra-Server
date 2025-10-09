import mongoose from "mongoose";

const leetcodeSolutionSchema = new mongoose.Schema(
  {
    problem_name: { type: String, required: true },
    code: { type: String, required: true },
    file_path: { type: String, required: true }
  },
  { collection: "leetcode_solutions" }
);

const LeetCodeSolution = mongoose.model("LeetCodeSolution", leetcodeSolutionSchema);

export default LeetCodeSolution;
