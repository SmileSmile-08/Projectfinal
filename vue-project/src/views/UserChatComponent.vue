<template>
  <div class="user-chat" v-if="isLoggedIn">
    <div class="notification" v-if="unreadCount > 0">
      <span>{{ unreadCount }} new message(s)</span>
    </div>
    <ul id="messages" ref="messagesList">
      <li v-for="(message, index) in messages" :key="index" :class="{'message-user': message.sender === 'user', 'message-admin': message.sender === 'admin'}">
        <span class="sender">{{ message.sender }}:</span> {{ message.text }}
        <div class="timestamp">{{ message.timestamp }}</div>
      </li>
    </ul>
    <form id="form" @submit.prevent="sendMessage">
      <input v-model="input" autocomplete="off" placeholder="Type a message..." />
      <button type="submit">Send</button>
    </form>
  </div>
  <div v-else class="not-logged-in">
    <p>กรุณาล็อกอินก่อนเพื่อใช้แชท</p>
    <router-link to="/login">เข้าสู่ระบบ</router-link>
  </div>
</template>

<script>
// นำเข้า `socket.io-client` ไลบรารีสำหรับการเชื่อมต่อ WebSocket ผ่าน Socket.IO
import io from 'socket.io-client';

export default {
  props: {
    // กำหนด prop ชื่อ `user_id` เพื่อรับค่าจาก parent component โดยค่า `user_id` นี้ต้องมีอยู่เสมอและสามารถเป็นได้ทั้ง String หรือ Number
    user_id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      messages: [], // เก็บข้อมูลข้อความทั้งหมดในแชทของผู้ใช้ปัจจุบันเป็น array
      input: '', // ข้อความที่ผู้ใช้กำลังพิมพ์ในช่อง input เพื่อส่งออกไป
      socket: null, // ตัวแปรสำหรับเก็บการเชื่อมต่อ Socket.IO ที่จะถูกใช้งานเมื่อเชื่อมต่อกับ server
      unreadCount: 0, // เก็บจำนวนข้อความที่ยังไม่ได้อ่าน เริ่มต้นเป็น 0
      isLoggedIn: false // ตัวแปรเพื่อตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่ โดยเริ่มต้นเป็น false
    };
  },
  mounted() {
    // สร้างตัวแปร `userId` โดยใช้ `user_id` ที่ได้จาก `props` หรือหากมี `user_id` ใน `$attrs` ก็จะใช้ค่านั้นแทน
    const userId = this.user_id || this.$attrs.user_id;

    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่ โดยดูจากว่ามีค่า `userId` หรือไม่
    this.isLoggedIn = Boolean(userId); // แปลงค่า `userId` เป็น boolean เพื่อตรวจสอบว่ามีค่า
    if (!this.isLoggedIn) return; // ถ้า `isLoggedIn` เป็น false ให้หยุดการทำงานและไม่เชื่อมต่อกับแชท

    console.log('Connecting to chat with user_id:', userId); // แสดงข้อความใน console เพื่อยืนยันการเชื่อมต่อกับแชทและ `user_id` ของผู้ใช้

    // เชื่อมต่อกับ server Socket.IO ที่ `http://localhost:8081` และเก็บการเชื่อมต่อนี้ใน `this.socket`
    this.socket = io('http://localhost:8081');
    // ส่งข้อมูลไปที่ server โดยระบุห้องแชทที่ต้องการเข้าร่วม (`joinRoom`) พร้อมข้อมูล `userId` และกำหนด role เป็น `user`
    this.socket.emit('joinRoom', { userId, role: 'user' });

    // โหลดข้อความที่บันทึกไว้ใน `localStorage` เพื่อนำมาแสดงในแชท
    this.loadMessages();

    // ตั้งค่า event listener ให้ฟัง event `chatMessage` จาก server
    this.socket.on('chatMessage', (message) => {
      // ตรวจสอบว่าข้อความที่ได้รับเป็นของผู้ใช้ที่มี `userId` เดียวกับผู้ใช้ปัจจุบันหรือไม่
      if (message.userId === userId) {
        // เพิ่มข้อความใหม่ลงใน array `messages` โดยเก็บเนื้อหาข้อความ ผู้ส่ง และ timestamp ในรูปแบบไทย
        this.messages.push({
          text: message.message, // เนื้อหาของข้อความ
          sender: message.sender, // ผู้ส่งข้อความ (เช่น 'admin' หรือ 'user')
          timestamp: new Date().toLocaleString('th-TH', { // แปลงเวลาเป็นรูปแบบไทย
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // ใช้รูปแบบ 24 ชั่วโมง
          })
        });
        this.unreadCount++; // เพิ่มจำนวนข้อความที่ยังไม่ได้อ่านทีละ 1
        this.saveMessages(); // บันทึกข้อความลงใน `localStorage`
        this.scrollToBottom(); // เลื่อนหน้าจอแชทไปที่ข้อความล่าสุด
      }
    });
  },
  methods: {
    // ฟังก์ชันส่งข้อความจากผู้ใช้ไปยัง server ผ่าน Socket.IO
    sendMessage() {
      const userId = this.user_id || this.$attrs.user_id; // ใช้ค่า `user_id` ของผู้ใช้ปัจจุบัน

      // ตรวจสอบว่าข้อความใน `input` ไม่เป็นค่าว่างและมี `userId` ของผู้ใช้ที่ล็อกอินอยู่
      if (this.input.trim() !== '') {
        // สร้างออบเจ็กต์ `messageData` ที่เก็บข้อมูลของข้อความที่จะส่งไปยัง server
        const messageData = {
          message: this.input, // ข้อความที่ผู้ใช้พิมพ์
          sender: 'user', // ระบุว่าผู้ส่งคือ 'user'
          userId, // รหัสของผู้ใช้ปัจจุบัน
          roomId: 'admin' // กำหนดห้องแชทเป็น 'admin'
        };

        console.log('Sending message:', messageData); // แสดงข้อมูลของข้อความใน console เพื่อใช้ debug

        // ส่งข้อมูล `messageData` ไปยัง server ผ่าน event `chatMessage`
        this.socket.emit('chatMessage', messageData);

        // เพิ่มข้อความที่ผู้ใช้ส่งใน `messages` โดยเก็บเนื้อหา ผู้ส่ง และ timestamp
        this.messages.push({ 
          text: this.input, // ข้อความที่ผู้ใช้พิมพ์
          sender: 'user', // ผู้ส่งคือ 'user'
          timestamp: new Date().toLocaleString('th-TH', { // แปลง timestamp ให้เป็นรูปแบบไทย
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // ใช้รูปแบบ 24 ชั่วโมง
          })
        });
        this.saveMessages(); // บันทึกข้อความที่ส่งลงใน `localStorage`

        this.input = ''; // ล้างค่าช่อง input หลังจากส่งข้อความแล้ว
        this.unreadCount = 0; // รีเซ็ตจำนวนข้อความที่ยังไม่ได้อ่านเป็น 0 เมื่อผู้ใช้ส่งข้อความ
        this.scrollToBottom(); // เลื่อนหน้าจอไปที่ข้อความล่าสุด
      }
    },

    // ฟังก์ชันเลื่อนหน้าจอแชทไปยังข้อความล่าสุด
    scrollToBottom() {
      this.$nextTick(() => { // ใช้ `$nextTick` เพื่อรอให้ DOM อัปเดตเสร็จก่อนทำงาน
        const messagesList = this.$refs.messagesList; // เข้าถึง element ของกล่องข้อความผ่าน `refs`
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight; // เลื่อนกล่องข้อความไปที่ด้านล่างสุด เพื่อแสดงข้อความล่าสุด
        }
      });
    },

    // ฟังก์ชันบันทึกข้อความของผู้ใช้ปัจจุบันใน `localStorage`
    saveMessages() {
      const userId = this.user_id || this.$attrs.user_id; // ใช้ `user_id` ของผู้ใช้ปัจจุบัน
      // บันทึกข้อความใน `messages` ลงใน `localStorage` ในรูปแบบ JSON string โดยใช้ key `chatMessages_{userId}`
      localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(this.messages));
    },

    // ฟังก์ชันโหลดข้อความของผู้ใช้ปัจจุบันจาก `localStorage`
    loadMessages() {
      const userId = this.user_id || this.$attrs.user_id; // ใช้ `user_id` ของผู้ใช้ปัจจุบัน
      // ดึงข้อความที่บันทึกไว้ใน `localStorage` โดยใช้ key `chatMessages_{userId}`
      const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
      if (savedMessages) {
        // ถ้ามีข้อความที่บันทึกไว้ จะทำการแปลง JSON string กลับมาเป็น array และเก็บใน `messages`
        this.messages = JSON.parse(savedMessages);
        this.scrollToBottom(); // เลื่อนหน้าจอไปที่ข้อความล่าสุดหลังโหลดข้อความเสร็จ
      }
    }
  },

  // Lifecycle hook `beforeUnmount` จะถูกเรียกก่อน component นี้จะถูกลบออกจาก DOM
  beforeUnmount() {
    if (this.socket) { // ตรวจสอบว่ามีการเชื่อมต่อ Socket.IO อยู่หรือไม่
      this.socket.disconnect(); // ตัดการเชื่อมต่อ Socket.IO เพื่อหยุดรับส่งข้อมูลเมื่อ component ถูกลบ
    }
  }
};
</script>

<style scoped>
.user-chat {
  max-width: 1000px;
  height: 90vh;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  margin: auto;
}

.not-logged-in {
  text-align: center;
  margin-top: 20px;
}

.notification {
  color: #d9534f;
  font-weight: bold;
  margin-bottom: 10px;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

li {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  line-height: 1.5;
  max-width: 60%;
}

.message-user {
  background-color: #d1e7ff;
  align-self: flex-end;
}

.message-admin {
  background-color: #e1f7d5;
  align-self: flex-start;
}

.sender {
  font-weight: bold;
}

.timestamp {
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
  text-align: right;
}

#form {
  display: flex;
  padding-top: 1rem;
}

#form input {
  flex-grow: 1;
  border-radius: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

#form button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

#form button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}
</style>
