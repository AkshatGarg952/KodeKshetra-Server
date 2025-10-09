import mongoose from "mongoose";

const codeforcesSolutionSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    code: { type: String, required: true }
  }
);

const CFsolutions = mongoose.model("codeforces_solutions", codeforcesSolutionSchema);

export default CFsolutions;
