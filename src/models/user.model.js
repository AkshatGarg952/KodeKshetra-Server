import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({

  profilePicture: { type: String, default: "https://res.cloudinary.com/dnd6asdiw/image/upload/v1757844942/DefaultProfilePic_kxth2v.jpg" },    
  username: {type:String,required:true,minlength: 6, trim:true},
  password: { type: String, required: true, minlength: 6, trim:true},
  email:{type: String, required: true, unique: true, lowercase: true, trim: true,
  match: [
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    'Please enter a valid email address',
  ],}, 
  sections: {
    dsa: { type: Boolean, default: false },
    cp: { type: Boolean, default: false }
  },

  leetcodeId: { type: String, trim:true, required: function () { return this.sections.dsa; } },
  codeforcesId: { type: String, trim:true, required: function () { return this.sections.cp; } },

  rating:{
    dsa: { type: Number},
    cp: { type: Number} 
  },
topicsMastered: {
  type: Map,
  of: Number,
  default: {}
},

solvedQuestions:[{
  platform: { type: String, enum: ['LeetCode', 'Codeforces'], required: true },
  problemId: { type: String, required: true }
}],

  earnedBadges: {
    type: [
      {
        badgeId: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
      }
    ],
    default: []
  },


XP: {
  type: [{
    xp: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  }],
  default: []
},

totalB: {
  type: [{
    date: { type: Date, default: Date.now },
    battlesPlayed: { type: Number, default: 0 }
  }],
  default: []
},

totalW: {
  type:[{
    date: { type: Date, default: Date.now },
    battlesWon: { type: Number, default: 0 }
  }],
  default: []
},

totalD: {
  type:[{
    date: { type: Date, default: Date.now },
    battlesWon: { type: Number, default: 0 }
  }],
  default: []
},

maxStreak: { type: Number, default: 0 },

currStreak: { type: Number, default: 0 },

maxWinStreak: { type: Number, default: 0 },

currWinStreak: { type: Number, default: 0 },

createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema)
export default User
