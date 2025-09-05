const { Router } = require("express");
const { Post } = require("../models/Post");
const { authMiddleware } = require("../middleware/auth");
const { requireRoles } = require("../middleware/authorize");
const { getIo } = require("../socket");

const router = Router();

router.get("/", async (req, res) => {
  const { community } = req.query;
  const filter = {};
  if (community) filter.community = String(community);
  const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ posts });
});

router.get("/pending", authMiddleware, requireRoles("Doctor", "Admin", "SuperAdmin"), async (req, res) => {
  const posts = await Post.find({ aiGenerated: true, validationStatus: "pending" }).sort({ createdAt: -1 }).lean();
  res.json({ posts });
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, content, community, aiGenerated, imageUrl } = req.body;
  const author = req.user;
  const post = await Post.create({ title, content, community, authorId: author.id, authorName: author.name, aiGenerated: !!aiGenerated, imageUrl: imageUrl || '' });
  try { getIo().emit("post:created", post); } catch {}
  res.json({ post });
});

router.post("/ai", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { title, content, community } = req.body;
  const author = req.user;
  const post = await Post.create({ title, content, community, authorId: author.id, authorName: author.name, aiGenerated: true, validationStatus: "pending", published: false });
  try { getIo().emit("post:ai_created", post); } catch {}
  res.json({ post });
});

router.post("/:id/validate", authMiddleware, requireRoles("Doctor", "Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["validated", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  const editor = req.user;
  const post = await Post.findByIdAndUpdate(id, { validationStatus: status, editedBy: editor.name }, { new: true });
  try { getIo().emit("post:validated", { postId: post?._id, status }); } catch {}
  res.json({ post });
});

router.put("/:id", authMiddleware, requireRoles("Doctor", "Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const { content, title } = req.body;
  const editor = req.user;
  const post = await Post.findByIdAndUpdate(id, { content, title, editedBy: editor.name }, { new: true });
  res.json({ post });
});

router.post("/:id/comment", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const author = req.user;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.comments = post.comments || [];
  post.comments.push({ authorId: author.id, authorName: author.name, content, createdAt: new Date() });
  post.responses = (post.responses || 0) + 1;
  await post.save();
  try { getIo().emit("post:comment", { postId: post._id, comment: post.comments[post.comments.length-1] }); } catch {}
  res.json({ post });
});

router.post("/:id/react", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user = req.user;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.reactions = post.reactions || [];
  const existingIndex = post.reactions.findIndex(r => String(r.by) === String(user.id) && r.type === type);
  if (existingIndex >= 0) post.reactions.splice(existingIndex, 1); else post.reactions.push({ by: user.id, type });
  await post.save();
  try { getIo().emit("post:react", { postId: post._id, reactions: post.reactions }); } catch {}
  res.json({ post });
});

router.post("/:id/publish", authMiddleware, requireRoles("Admin", "SuperAdmin"), async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, { published: true }, { new: true });
  if (!post) return res.status(404).json({ message: "Post not found" });
  try { getIo().emit("post:published", post); } catch {}
  res.json({ post });
});

module.exports = router;
