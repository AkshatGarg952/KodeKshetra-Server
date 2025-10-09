import mongoose from "mongoose";
const { Schema } = mongoose;

const problemSchema = new Schema({
  source: { type: String, default: 'codeforces' },
  problemId: { type: String, required: true, unique: true },
  timeLimit: { type: Number, required: true },
  memoryLimit: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  inputFormat: { type: String },
  outputFormat: { type: String },
  examples: { type: Array },
  hiddenTests: { type: Array },
  note: { type: String },
  tags: [{ type: String }],
  rating:{ type: Number}
});

const CFproblems =  mongoose.model("codeforces_questions", problemSchema);
export default CFproblems