import mongoose from "mongoose";

const leetcodeSolutionSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    sourceUrl: { type: String },
    verifiedBySamples: { type: Boolean, default: false },
    importedAt: { type: Date, default: Date.now }
  },
  { collection: "leetcode_solutions", timestamps: true }
);

const LeetCodeSolution = mongoose.model("LeetCodeSolution", leetcodeSolutionSchema);

export default LeetCodeSolution;
