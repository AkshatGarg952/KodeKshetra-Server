import mongoose from 'mongoose';
const { Schema } = mongoose;

const BattleSchema = new Schema({
  player1: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:true},
  player2: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:false, default: null},
  roomId: { type: String, default: null, index: true, sparse: true },
  battleType: {
    type: String,
    enum: ['matchmaking', 'private'],
    required: true,
    default: 'matchmaking'
  },
  mode: {type:String},
  topic: {type:String},
  winner: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
  question:{type: Object, required: true},
  battleStartedAt: { type: Date, default: null },
  battleEndsAt: { type: Number, default: null },
  resolvedAt: { type: Date, default: null },
  resolutionStatus: { type: String, default: null },
  resolutionPayload: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

BattleSchema.index({ battleType: 1, createdAt: -1 });
BattleSchema.index({ player1: 1, createdAt: -1 });
BattleSchema.index({ player2: 1, createdAt: -1 });
BattleSchema.index({ roomId: 1 }, { unique: true, sparse: true });

const Battle = mongoose.model('Battle', BattleSchema);
export default Battle
