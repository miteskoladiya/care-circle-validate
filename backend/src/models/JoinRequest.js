const { Schema, model } = require('mongoose');

const JoinRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, default: '' },
}, { timestamps: true });

const JoinRequest = model('JoinRequest', JoinRequestSchema);
module.exports = { JoinRequest };
