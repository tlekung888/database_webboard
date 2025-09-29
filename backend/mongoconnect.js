// backend/mongodb.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // เปลี่ยนได้ตาม config ของคุณ
const client = new MongoClient(uri);

async function connectMongo() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('database_project'); // เปลี่ยนชื่อฐานข้อมูลตามที่คุณใช้
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

module.exports = { connectMongo };
