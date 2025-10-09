import mongoose from 'mongoose';
const { Schema } = mongoose;

const BattleSchema = new Schema({
  player1: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:true},
  player2: {type:mongoose.Schema.Types.ObjectId,ref:'User', required:true},
  mode: {type:String},
  topic: {type:String},
  winner: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
  question:{type: Object, required: true},
  createdAt: { type: Date, default: Date.now }
});

const Battle = mongoose.model('Battle', BattleSchema);
export default Battle