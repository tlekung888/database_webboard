// const express = require("express");
// const bcrypt = require("bcrypt");
// const pool = require("./db/pgdbconnect"); // PostgreSQL pool
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs"); // เพิ่มเพื่อตรวจสอบโฟลเดอร์
// const Post = require("./models/Post");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());



// // ----- เปิด server -----
// app.listen(5000, () => {
//   console.log("🚀 Server running on http://localhost:5000");
// });
// // ----- MongoDB connection -----
// mongoose.connect("mongodb://127.0.0.1:27017/webboard");
// const mongoDb = mongoose.connection;
// mongoDb.on("error", console.error.bind(console, "MongoDB error:"));
// mongoDb.once("open", () => console.log("MongoDB connected 🚀"));

// // ----- สร้างโฟลเดอร์ uploads หากยังไม่มี -----
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // ----- ตั้งค่าเก็บไฟล์ภาพ -----
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // ใช้ path เต็มแทน
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });

// // ----- เปิดให้ client เข้าถึงไฟล์ภาพได้ -----
// app.use("/uploads", express.static(uploadDir));

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// // ----- เพิ่มโพสต์ใหม่ (ใช้ multer) -----
// app.post("/api/posts", upload.single("image"), async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.file:", req.file);

//   const { content, category, username } = req.body;
//   const image = req.file ? req.file.filename : null;

//   if (!content || !category || !username) {
//     return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
//   }

//   try {
//     const newPost = new Post({
//       content,
//       category,
//       username,
//       image: image,
//     });
//     await newPost.save();
//     res.status(201).json({ message: "โพสต์สำเร็จ", post: newPost });
//   } catch (err) {
//     console.error("❌ บันทึกโพสต์ล้มเหลว:", err);
//     res.status(500).json({ error: "เซิร์ฟเวอร์ผิดพลาด" });
//   }
// });


// // ----- ดึงโพสต์ทั้งหมด -----
// app.get("/api/posts", async (req, res) => {
//   try {
//     const posts = await Post.find().sort({ createdAt: -1 });
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงโพสต์" });
//   }
// });

// // กดไลค์โพสต์
// app.post("/api/posts/:id/like", async (req, res) => {
//   const postId = req.params.id;
//   const { username } = req.body; // รับ username ที่มากดไลค์

//   if (!username) {
//     return res.status(400).json({ error: "กรุณาส่ง username มาด้วย" });
//   }

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "โพสต์ไม่พบ" });

//     // ถ้าผู้ใช้กดไลค์แล้ว ให้ยกเลิกไลค์ (toggle)
//     if (post.likedBy.includes(username)) {
//       post.likedBy = post.likedBy.filter(user => user !== username);
//       post.likes = post.likes - 1;
//     } else {
//       post.likedBy.push(username);
//       post.likes = post.likes + 1;
//     }

//     await post.save();

//     res.json({
//       message: "อัปเดตไลค์เรียบร้อย",
//       likes: post.likes,
//       likedBy: post.likedBy,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
//   }
// });

// // DELETE /api/posts/:id
// router.delete("/api/posts/:id", async (req, res) => {
//   try {
//     const deletedPost = await Post.findByIdAndDelete(req.params.id);
//     if (!deletedPost) {
//       return res.status(404).json({ error: "ไม่พบโพสต์" });
//     }
//     res.json({ message: "ลบโพสต์เรียบร้อยแล้ว" });
//   } catch (err) {
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบโพสต์" });
//   }
// });




// // ----- PostgreSQL: Register -----
// app.post("/api/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     if (!username || !email || !password) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const existing = await pool.query(
//       "SELECT id FROM users WHERE username = $1 OR email = $2",
//       [username, email]
//     );
//     if (existing.rows.length > 0) {
//       return res
//         .status(409)
//         .json({ error: "Username or email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await pool.query(
//       "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
//       [username, email, hashedPassword]
//     );

//     res.status(201).json({ message: "User registered", user: newUser.rows[0] });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ----- PostgreSQL: Login -----
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);

//     if (userRes.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const user = userRes.rows[0];
//     const isValid = await bcrypt.compare(password, user.password);

//     if (!isValid) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     res.json({
//       message: "Login successful",
//       user: { id: user.id, username: user.username, email: user.email },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // สมมติคุณมี middleware auth ที่แปลง token -> req.user
// app.delete("/posts/:id", async (req, res) => {
//   const postId = req.params.id;
//   const userId = req.user.id; // คนที่ login อยู่

//   // เช็คว่าโพสต์นี้เป็นของ user ไหม
//   const result = await pool.query(
//     "SELECT * FROM posts WHERE id=$1 AND user_id=$2",
//     [postId, userId]
//   );

//   if (result.rows.length === 0) {
//     return res.status(403).json({ error: "You do not have permission" });
//   }

//   await pool.query("DELETE FROM posts WHERE id=$1", [postId]);
//   res.json({ success: true });
// });




// // ✅ ดึงโพสต์ทั้งหมด
// app.get("/api/posts", async (req, res) => {
//   const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
//   res.json(result.rows);
// });

// // ✅ ดึงโพสต์เดียว
// app.get("/api/posts/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await pool.query("SELECT * FROM posts WHERE id=$1", [id]);
//   if (result.rows.length === 0) return res.status(404).json({ error: "ไม่พบโพสต์" });
//   res.json(result.rows[0]);
// });

// // ✅ แก้ไขโพสต์
// app.put("/api/posts/:id", async (req, res) => {
//   const { id } = req.params;
//   const { content, category } = req.body;
//   await pool.query("UPDATE posts SET content=$1, category=$2 WHERE id=$3", [
//     content,
//     category,
//     id,
//   ]);
//   res.json({ success: true });
// });

// // ✅ ลบโพสต์
// app.delete("/api/posts/:id", async (req, res) => {
//   const { id } = req.params;
//   await pool.query("DELETE FROM posts WHERE id=$1", [id]);
//   res.json({ success: true });
// });