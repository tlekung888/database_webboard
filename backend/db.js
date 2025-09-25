// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'db888',   // เปลี่ยนเป็นรหัสจริงของคุณ
  database: 'postgres'         // หรือชื่อฐานข้อมูลของคุณ
});

module.exports = pool;
