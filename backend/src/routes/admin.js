const { Router } = require("express");
const { User } = require("../models/User");
const { authMiddleware } = require("../middleware/auth");
const { requireRoles } = require("../middleware/authorize");

const router = Router();

router.get("/users", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const users = await User.find().select("-password").lean();
  res.json({ users });
});

router.post("/users/:id/approve", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select("-password");
  res.json({ user });
});

router.post("/users/:id/role", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  res.json({ user });
});

router.delete("/users/:id", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ ok: true });
});

router.get("/posts/pending", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { Post } = require("../models/Post");
  const posts = await Post.find({ aiGenerated: true, published: false }).lean();
  res.json({ posts });
});

// join requests
router.get('/join-requests', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { JoinRequest } = require('../models/JoinRequest');
  const reqs = await JoinRequest.find({ status: 'pending' }).populate('userId').populate('communityId').lean();
  res.json({ requests: reqs });
});

router.post('/join-requests/:id/approve', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { JoinRequest } = require('../models/JoinRequest');
  const jr = await JoinRequest.findById(req.params.id);
  if (!jr) return res.status(404).json({ message: 'Not found' });
  jr.status = 'approved';
  await jr.save();
  const { Community } = require('../models/Community');
  const community = await Community.findById(jr.communityId);
  community.members = (community.members || 0) + 1;
  await community.save();
  res.json({ request: jr, community });
});

router.post('/join-requests/:id/reject', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { JoinRequest } = require('../models/JoinRequest');
  const jr = await JoinRequest.findById(req.params.id);
  if (!jr) return res.status(404).json({ message: 'Not found' });
  jr.status = 'rejected';
  jr.reason = req.body.reason || '';
  await jr.save();
  res.json({ request: jr });
});

// community creation requests
router.get('/community-requests', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { CommunityRequest } = require('../models/CommunityRequest');
  const requests = await CommunityRequest.find({ status: 'pending' }).populate('userId').lean();
  res.json({ requests });
});

router.post('/community-requests/:id/approve', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { CommunityRequest } = require('../models/CommunityRequest');
  const cr = await CommunityRequest.findById(req.params.id);
  if (!cr) return res.status(404).json({ message: 'Not found' });
  cr.status = 'approved'; await cr.save();
  const { Community } = require('../models/Community');
  const community = await Community.create({ name: cr.name, description: cr.description, category: cr.category });
  res.json({ request: cr, community });
});

router.post('/community-requests/:id/reject', authMiddleware, requireRoles('Admin', 'SuperAdmin'), async (req, res) => {
  const { CommunityRequest } = require('../models/CommunityRequest');
  const cr = await CommunityRequest.findById(req.params.id);
  if (!cr) return res.status(404).json({ message: 'Not found' });
  cr.status = 'rejected'; cr.reason = req.body.reason || ''; await cr.save();
  res.json({ request: cr });
});

module.exports = router;
