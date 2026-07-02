import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserDailyStatsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    dateKey: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    xp: {
      type: Number,
      default: 0
    },
    battlesPlayed: {
      type: Number,
      default: 0
    },
    battlesWon: {
      type: Number,
      default: 0
    },
    battlesDraw: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

UserDailyStatsSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
UserDailyStatsSchema.index({ dateKey: 1, userId: 1 });

const UserDailyStats = mongoose.model('user_daily_stats', UserDailyStatsSchema);

export default UserDailyStats;
