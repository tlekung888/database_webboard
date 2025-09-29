const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: String,
  category: String,
  username: String,
  image: String,
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String], // เก็บ username หรือ userId ที่กดไลค์
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
