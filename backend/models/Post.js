// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: String,
  username: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  // บันทึก user role ถ้าต้องการ ตรวจใน backend
});

const postSchema = new mongoose.Schema({
  content: String,
  category: String,
  username: String,
  image: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: [commentSchema], default: [] },  // <-- ตรงนี้เพิ่ม
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
