import mongoose from 'mongoose';
const { Schema } = mongoose;

const BattleSchema = new Schema({
  player1: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:true},
  player2: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:false, default: null},
  battleType: {
    type: String,
    enum: ['matchmaking', 'private', 'ai'],
    required: true,
    default: 'matchmaking'
  },
  mode: {type:String},
  topic: {type:String},
  winner: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
  question:{type: Object, required: true},
  aiOpponent: {
    botId: { type: String, default: null },
    displayName: { type: String, default: null },
    visibleRating: { type: Number, default: null },
    persona: { type: String, default: null },
    mode: { type: String, default: null },
    topic: { type: String, default: null },
    difficulty: { type: String, default: null },
    version: { type: String, default: null }
  },
  aiExecution: {
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'fallback'],
      default: 'pending'
    },
    strategy: {
      type: String,
      enum: ['real_solver', 'assisted_solver', 'fallback_simulation'],
      default: null
    },
    attemptsUsed: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 0 },
    language: { type: String, default: null },
    generatedCode: { type: String, default: null },
    compileStatus: { type: String, default: null },
    passedCases: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    solved: { type: Boolean, default: false },
    executionTimeMs: { type: Number, default: null },
    finishTimeSeconds: { type: Number, default: null },
    confidence: { type: Number, default: null },
    failureReason: { type: String, default: null },
    lastFeedback: { type: String, default: null },
    lastUpdatedAt: { type: Date, default: null }
  },
  aiOutcome: {
    status: {
      type: String,
      enum: ['won', 'loss', 'draw'],
      default: null
    },
    result: {
      type: String,
      enum: ['won', 'loss', 'draw'],
      default: null
    },
    reason: { type: String, default: null },
    userResult: {
      solved: { type: Boolean, default: false },
      passedCases: { type: Number, default: 0 },
      finishTimeSeconds: { type: Number, default: 0 }
    },
    aiResult: {
      status: { type: String, default: null },
      solved: { type: Boolean, default: false },
      passedCases: { type: Number, default: 0 },
      finishTimeSeconds: { type: Number, default: 0 },
      strategy: { type: String, default: null },
      attemptsUsed: { type: Number, default: 0 },
      maxAttempts: { type: Number, default: 0 }
    },
    resolvedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const Battle = mongoose.model('Battle', BattleSchema);
export default Battle
