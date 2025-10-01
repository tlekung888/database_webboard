
// routes/users.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../db/pgdbconnect");

// ✅ GET users ทั้งหมด (admin)
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT username, email, avatar, description, role FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ GET ข้อมูลผู้ใช้
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      "SELECT username, email, avatar, description, role FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// ✅ PUT อัปเดต avatar / description
router.put("/:username", upload.single("avatar"), async (req, res) => {
  const { username } = req.params;
  const { description, role } = req.body;
  const avatar = req.file ? req.file.filename : null;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    // อัปเดต description, avatar, role (ถ้ามี)
    let query = "UPDATE users SET description = $1, avatar = COALESCE($2, avatar)";
    let params = [description, avatar];
    if (role) {
      query += ", role = $3 WHERE username = $4";
      params.push(role, username);
    } else {
      query += " WHERE username = $3";
      params.push(username);
    }
    await pool.query(query, params);

    res.json({ message: "อัปเดตโปรไฟล์/role สำเร็จ" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" });
  }
// ✅ DELETE user (admin)
router.delete("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    await pool.query("DELETE FROM users WHERE username = $1", [username]);
    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "ไม่สามารถลบผู้ใช้ได้" });
  }
});
});

module.exports = router;
