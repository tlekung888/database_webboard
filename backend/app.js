const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");     // PostgreSQL
const postRoutes = require("./routes/posts");    // MongoDB
// const authRoutes = require("./routes/auth");
const app = express();
app.use(cors());
app.use(express.json());
// app.use("/api", authRoutes);
// app.use("/api/posts", postRoutes);


// เชื่อม MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/webboard")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Static image folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route handlers
app.use("/api/auth", authRoutes);   // POSTGRES
app.use("/api/posts", postRoutes);  // MONGO

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads")); // ✅ เพื่อให้แสดงรูป avatar ได้


// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
