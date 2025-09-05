const { Schema, model } = require("mongoose");

const CommunitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: { type: Number, default: 0 },
    dailyPosts: { type: Number, default: 0 },
    category: String,
    moderators: [String],
    recentActivity: String,
    color: String,
  },
  { timestamps: true }
);

const Community = model("Community", CommunitySchema);
module.exports = { Community };
