const { Schema, model } = require('mongoose');

const CommunityRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, default: '' },
}, { timestamps: true });

const CommunityRequest = model('CommunityRequest', CommunityRequestSchema);
module.exports = { CommunityRequest };
