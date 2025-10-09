import mongoose from 'mongoose';
const { Schema } = mongoose;

const leetcodeQuestionSchema = new Schema({
  source: { type: String, default: 'leetcode' },
  problemId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  timeLimit: { type: Number, default: 2 },
  memoryLimit: { type: Number, default: 256 },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  sampleTests: [
    {
      input: { type: String },
      output: { type: String },
      explanation: { type: String, required: false }
    }
  ],
  hiddenTests: [
    {
      input: { type: String },
      output: { type: String }
    }
  ],
  boilerplateCode: {
    java: {
      language: String,
      languageSlug: String,
      code: String
    },
    cpp: {
      language: String,
      languageSlug: String,
      code: String
    },
    python: {
      language: String,
      languageSlug: String,
      code: String
    }
  },
  completeCodeTemplates: {
    java: {
      language: String,
      languageSlug: String,
      boilerplateCode: String,
      completeCode: String
    },
    cpp: {
      language: String,
      languageSlug: String,
      boilerplateCode: String,
      completeCode: String
    },
    python: {
      language: String,
      languageSlug: String,
      boilerplateCode: String,
      completeCode: String
    }
  }
}, { timestamps: true });

const leetcodeQuestion = mongoose.model('leetcode_questions', leetcodeQuestionSchema);
export default leetcodeQuestion;