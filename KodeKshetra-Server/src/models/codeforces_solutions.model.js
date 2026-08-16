import mongoose from "mongoose";

const codeforcesSolutionSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    sourceUrl: { type: String },
    verifiedBySamples: { type: Boolean, default: false },
    importedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const CFsolutions = mongoose.model("codeforces_solutions", codeforcesSolutionSchema);

export default CFsolutions;
