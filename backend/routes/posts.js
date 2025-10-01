const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/Post");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });



// Create Post
router.post("/", upload.single("image"), async (req, res) => {
  const { content, category, username } = req.body;
  const image = req.file ? req.file.filename : null;
  const newPost = new Post({ content, category, username, image });
  await newPost.save();
  res.status(201).json(newPost);
});

// Get Posts
router.get("/", async (_, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Like
router.post("/:id/like", async (req, res) => {
  const { username } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });

  const alreadyLiked = post.likedBy.includes(username);
  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((u) => u !== username);
    post.likes--;
  } else {
    post.likedBy.push(username);
    post.likes++;
  }

  await post.save();
  res.json({ likes: post.likes });
});

// Delete Post
// ลบโพสต์: admin หรือเจ้าของเท่านั้น
router.delete("/:id", async (req, res) => {
  const { username } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });
  if (post.username !== username && username !== "admin") {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ลบโพสต์นี้" });
  }
  await Post.findByIdAndDelete(req.params.id);
  if (post?.image) {
    fs.unlink(path.join(uploadDir, post.image), () => {});
  }
  res.json({ message: "ลบเรียบร้อย" });
});



// ... โค้ดอื่นข้างบน

// ✅ ดึงโพสต์ตาม ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดโพสต์" });
  }
});

// ✅ แก้ไขโพสต์
// แก้ไขโพสต์: admin หรือเจ้าของเท่านั้น
router.put("/:id", async (req, res) => {
  const { content, category, username } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });
    if (post.username !== username && username !== "admin") {
      return res.status(403).json({ error: "ไม่มีสิทธิ์แก้ไขโพสต์นี้" });
    }
    post.content = content;
    post.category = category;
    await post.save();
    res.json({ message: "แก้ไขโพสต์สำเร็จ", post });
  } catch (err) {
    res.status(500).json({ error: "แก้ไขโพสต์ล้มเหลว" });
  }
});

// routes/posts.js

// เพิ่มคอมเมนต์ใต้โพสต์
router.post("/:postId/comments", async (req, res) => {
  const { content, username } = req.body;
  if (!content || !username) {
    return res.status(400).json({ error: "content และ username ต้องระบุ" });
  }
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });

    const newComment = {
      content,
      username,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มคอมเมนต์ล้มเหลว" });
  }
});

// แก้ไข comment
router.put("/:postId/comments/:commentId", async (req, res) => {
  const { content, username, role } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "ไม่พบคอมเมนต์" });

    // ตรวจสิทธิ์ — เจ้าของหรือ admin
    if (comment.username !== username && role !== "admin") {
      return res.status(403).json({ error: "ไม่มีสิทธิ์แก้ไขคอมเมนต์นี้" });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await post.save();

    res.json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "แก้ไขคอมเมนต์ล้มเหลว" });
  }
});

// ลบ comment
router.delete("/:postId/comments/:commentId", async (req, res) => {
  const { username, role } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "ไม่พบโพสต์" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "ไม่พบคอมเมนต์" });

    // ตรวจสิทธิ์
    if (comment.username !== username && role !== "admin") {
      return res.status(403).json({ error: "ไม่มีสิทธิ์ลบคอมเมนต์นี้" });
    }

    comment.remove();
    await post.save();

    res.json({ message: "ลบคอมเมนต์เรียบร้อย" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบคอมเมนต์ล้มเหลว" });
  }
});


// ✅ export หลังประกาศ route ทั้งหมด
module.exports = router;

