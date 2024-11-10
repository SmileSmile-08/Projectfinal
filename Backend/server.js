
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // ที่อยู่ของ frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
});

// ใช้งาน cors
app.use(cors());

// เก็บข้อมูลผู้ใช้ที่เชื่อมต่อ
const users = {}; // Object เพื่อเก็บข้อมูล user ที่เชื่อมต่อ

// การจัดการเหตุการณ์เมื่อมีการเชื่อมต่อ
io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);

  // การเข้าห้องแชท
  socket.on('joinRoom', ({ userId, role }) => {
    const roomId = userId || 'null-room';
    socket.join(roomId); // เข้าร่วมห้องตาม userId
    console.log(`${role} joined room: ${roomId}`);

    // ถ้าเป็นผู้ใช้ ให้บันทึกข้อมูล userId ไว้ใน users object
    if (role === 'user' && !users[userId]) {
      users[userId] = socket.id;
    }

    // ส่งข้อมูลผู้ใช้ที่ออนไลน์ทั้งหมดไปให้แอดมิน
    io.to('admin').emit('updateUserList', Object.keys(users));
  });

  // การรับข้อความจากผู้ใช้
  socket.on('chatMessage', (messageData) => {
    console.log(`Message from ${messageData.sender}: ${messageData.message}`);
    // ส่งข้อความไปยังห้องที่ระบุ
    io.to(messageData.roomId).emit('chatMessage', {
      message: messageData.message,
      sender: messageData.sender,
      userId: messageData.userId,
    });
  });

  // การจัดการการตัดการเชื่อมต่อ
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);

    // ค้นหาผู้ใช้ที่ตัดการเชื่อมต่อ และลบออกจาก users object
    for (let [userId, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[userId];
        break;
      }
    }

    // อัปเดตรายชื่อผู้ใช้ที่ออนไลน์ให้แอดมิน
    io.to('admin').emit('updateUserList', Object.keys(users));
  });
});

// เริ่มเซิร์ฟเวอร์
const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
