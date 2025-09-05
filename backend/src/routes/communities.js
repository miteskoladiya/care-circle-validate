const { Router } = require("express");
const { Community } = require("../models/Community");
const { JoinRequest } = require("../models/JoinRequest");
const { CommunityRequest } = require("../models/CommunityRequest");
const { authMiddleware } = require("../middleware/auth");
const { requireRoles } = require("../middleware/authorize");

const router = Router();

router.get("/", async (req, res) => {
  const communities = await Community.find().limit(50).lean();
  res.json({ communities });
});

router.post("/:id/join", authMiddleware, async (req, res) => {
  const { id } = req.params;
  console.log('[communities] POST /:id/join', { params: req.params, user: req.user && { id: req.user.id, email: req.user.email, role: req.user.role } });
  // immediate join (used for simple join/unjoin)
  const community = await Community.findById(id);
  if (!community) return res.status(404).json({ message: 'Not found' });
  // increment members and respond
  community.members = (community.members || 0) + 1;
  await community.save();
  try {
    const { User } = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { communities: community._id } });
  } catch (err) { console.error('Failed to add community to user', err); }
  res.json({ community });
});

// leave a community
router.post("/:id/leave", authMiddleware, async (req, res) => {
  const { id } = req.params;
  // log incoming headers and user for diagnostics
  console.log('[communities] POST /:id/leave', {
    params: req.params,
    user: req.user && req.user.id,
    headers: { authorization: req.headers.authorization }
  });

  // defensive checks
  if (!req.user || !req.user.id) {
    console.error('[communities] leave: missing req.user or req.user.id', { user: req.user });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const community = await Community.findById(id);
  if (!community) return res.status(404).json({ message: 'Not found' });

  try {
    community.members = Math.max(0, (community.members || 0) - 1);
    await community.save();
  } catch (err) {
    console.error('[communities] failed to decrement members', err);
    return res.status(500).json({ message: 'Failed to update community' });
  }

  try {
    const { User } = require('../models/User');
    const u = await User.findById(req.user.id);
    if (!u) {
      console.error('[communities] leave: user not found in DB', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndUpdate(req.user.id, { $pull: { communities: community._id } });
  } catch (err) {
    console.error('Failed to remove community from user', err);
    return res.status(500).json({ message: 'Failed to update user' });
  }

  res.json({ community });
});

// create a join request (user requests to join and admin can approve)
router.post("/:id/request-join", authMiddleware, async (req, res) => {
  const { id } = req.params;
  console.log('[communities] POST /:id/request-join', { params: req.params, user: req.user && { id: req.user.id, email: req.user.email, role: req.user.role } });
  const userId = req.user.id;
  const existing = await JoinRequest.findOne({ userId, communityId: id, status: 'pending' });
  if (existing) return res.status(400).json({ message: 'Request already pending' });
  const jr = await JoinRequest.create({ userId, communityId: id });
  res.json({ request: jr });
});

// admin: list join requests
router.get('/join-requests', authMiddleware, async (req, res) => {
  console.log('[communities] GET /join-requests by', req.user && req.user.id);
  const reqs = await JoinRequest.find({ status: 'pending' }).populate('userId').populate('communityId').lean();
  res.json({ requests: reqs });
});

// admin: approve join request
router.post('/join-requests/:id/approve', authMiddleware, async (req, res) => {
  console.log('[communities] POST /join-requests/:id/approve', { params: req.params, user: req.user && req.user.id });
  const { id } = req.params;
  const jr = await JoinRequest.findById(id);
  if (!jr) return res.status(404).json({ message: 'Not found' });
  jr.status = 'approved';
  await jr.save();
  const community = await Community.findById(jr.communityId);
  community.members = (community.members || 0) + 1;
  await community.save();
  try {
    const { User } = require('../models/User');
    await User.findByIdAndUpdate(jr.userId, { $addToSet: { communities: community._id } });
  } catch (err) { console.error('Failed to add community to user on approval', err); }
  res.json({ request: jr, community });
});

// admin: reject join request
router.post('/join-requests/:id/reject', authMiddleware, async (req, res) => {
  console.log('[communities] POST /join-requests/:id/reject', { params: req.params, body: req.body, user: req.user && req.user.id });
  const { id } = req.params;
  const { reason } = req.body;
  const jr = await JoinRequest.findById(id);
  if (!jr) return res.status(404).json({ message: 'Not found' });
  jr.status = 'rejected';
  jr.reason = reason || '';
  await jr.save();
  res.json({ request: jr });
});

// patient: request creation of a new community (goes to admin review)
router.post('/request', authMiddleware, async (req, res) => {
  console.log('[communities] POST /request', { body: req.body, user: req.user && req.user.id });
  const { name, description, category } = req.body;
  const userId = req.user.id;
  const cr = await CommunityRequest.create({ userId, name, description, category });
  res.json({ request: cr });
});

// admin: list community creation requests
router.get('/requests', authMiddleware, async (req, res) => {
  console.log('[communities] GET /requests by', req.user && req.user.id);
  const requests = await CommunityRequest.find({ status: 'pending' }).populate('userId').lean();
  res.json({ requests });
});

// admin: approve community request
router.post('/requests/:id/approve', authMiddleware, async (req, res) => {
  console.log('[communities] POST /requests/:id/approve', { params: req.params, user: req.user && req.user.id });
  const { id } = req.params;
  const cr = await CommunityRequest.findById(id);
  if (!cr) return res.status(404).json({ message: 'Not found' });
  cr.status = 'approved';
  await cr.save();
  const community = await Community.create({ name: cr.name, description: cr.description, category: cr.category });
  res.json({ request: cr, community });
});

// admin: reject community request
router.post('/requests/:id/reject', authMiddleware, async (req, res) => {
  console.log('[communities] POST /requests/:id/reject', { params: req.params, body: req.body, user: req.user && req.user.id });
  const { id } = req.params;
  const { reason } = req.body;
  const cr = await CommunityRequest.findById(id);
  if (!cr) return res.status(404).json({ message: 'Not found' });
  cr.status = 'rejected';
  cr.reason = reason || '';
  await cr.save();
  res.json({ request: cr });
});

router.post("/", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { name, description, category, color } = req.body;
  const community = await Community.create({ name, description, category, color });
  res.json({ community });
});

router.put("/:id", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const community = await Community.findByIdAndUpdate(id, req.body, { new: true });
  res.json({ community });
});

router.delete("/:id", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  await Community.findByIdAndDelete(id);
  res.json({ ok: true });
});

module.exports = router;
