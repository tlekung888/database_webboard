
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db/pgdbconnect"); // ✅ เปลี่ยนตรงนี้

// ✅ ตรวจสอบ role ของ user (เช่น ใช้ก่อนเข้า admin)
router.post("/check-role", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "ต้องระบุ username" });
  try {
    const result = await pool.query("SELECT role FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    res.json({ role: result.rows[0].role });
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// ✅ สมัครสมาชิก
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!username || !email || !password) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
    }

    // ตรวจสอบว่ามีผู้ใช้ซ้ำไหม
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "มีผู้ใช้งานนี้อยู่แล้ว" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const role = "user";
    await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
      [username, email, hashed, role]
    );

    res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});


// ✅ เข้าสู่ระบบ
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "เข้าสู่ระบบไม่สำเร็จ" });
    }

    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

module.exports = router;
