<template>
  <!-- ส่วนแสดงผลหลักของแชท -->
  <div class="chat-container">
    <!-- รายชื่อผู้ใช้งานในระบบ -->
    <div class="user-list">
      <h3>CHAT</h3> <!-- หัวข้อรายชื่อผู้ใช้ -->
      <ul>
        <!-- วนลูปรายชื่อผู้ใช้ที่กำลังใช้งานอยู่ และแสดง ID ของผู้ใช้ -->
        <li v-for="user in activeUsers" :key="user.userId" @click="selectUser(user.userId)">
          {{ user.username || 'User' }} (ID: {{ user.userId }})
          <!-- แสดงหมายเลขข้อความที่ยังไม่ได้อ่าน ถ้ามี -->
          <span v-if="unreadCount[user.userId]" class="unread-badge">{{ unreadCount[user.userId] }}</span>
        </li>
      </ul>
    </div>

    <!-- กล่องแชทของผู้ใช้ที่ถูกเลือก -->
    <div class="chat-box" v-if="selectedUserId">
      <!-- ส่วนแสดงข้อความแชท -->
      <ul id="messages" ref="messagesList">
        <!-- วนลูปข้อความในแชทของผู้ใช้ที่เลือก -->
        <div v-for="(message, index) in messages[selectedUserId] || []" :key="index" :class="{'message-group': true}">
          <!-- ข้อความจากแอดมิน -->
          <div v-if="message.sender === 'admin'" class="message admin">
            <span class="sender">Admin:</span> {{ message.text }} <!-- แสดงข้อความจากแอดมิน -->
            <div class="timestamp">{{ message.timestamp }}</div> <!-- แสดงเวลา -->
          </div>
          <!-- ข้อความจากผู้ใช้ -->
          <div v-else class="message user">
            <span class="sender">User:</span> {{ message.text }} <!-- แสดงข้อความจากผู้ใช้ -->
            <div class="timestamp">{{ message.timestamp }}</div> <!-- แสดงเวลา -->
          </div>
        </div>
      </ul>

      <!-- ฟอร์มสำหรับส่งข้อความ -->
      <form id="form" @submit.prevent="sendMessage">
        <!-- ช่องข้อความที่ใช้สำหรับป้อนข้อความ -->
        <input v-model="input" autocomplete="off" placeholder="Type a message..." />
        <button type="submit">Send</button> <!-- ปุ่มส่งข้อความ -->
        <!-- ปุ่มส่งการจอง -->
        <button type="button" @click="sendBookingConfirmation">ส่งการจอง</button>
        <!-- ปุ่มส่งข้อความนัดหมาย -->
        <button type="button" @click="sendMessageWithText('การจองนัดหมาย รบกวนแจ้งชื่อ สถานที่ เวลา และการบริการที่คุณสนใจค่ะ')">การนัดหมาย</button>
      </form>
    </div>
  </div>
</template>

<script>
// นำเข้า `socket.io-client` ไลบรารีที่ใช้เชื่อมต่อกับ WebSocket ผ่าน Socket.IO
import io from 'socket.io-client';

export default {
  data() { // ฟังก์ชัน `data` ใช้กำหนดข้อมูลและตัวแปรต่าง ๆ ที่จะใช้งานใน component นี้
    return {
      messages: {}, // เก็บข้อความทั้งหมด โดยแยกตามผู้ใช้แต่ละคน โดยแต่ละ userId จะเป็น key ที่เก็บ array ของข้อความ
      input: '', // ตัวแปรสำหรับเก็บข้อความที่ป้อนโดยแอดมินในช่องส่งข้อความ
      socket: null, // ตัวแปรสำหรับเก็บการเชื่อมต่อ Socket.IO
      activeUsers: [], // รายชื่อผู้ใช้ที่กำลังใช้งานแชทอยู่ โดยเก็บเป็น array ของ object { userId, username }
      selectedUserId: null, // ตัวแปรเก็บ userId ของผู้ใช้ที่แอดมินเลือกเพื่อแชทด้วย
      unreadCount: {} // เก็บจำนวนข้อความที่ยังไม่ได้อ่านสำหรับผู้ใช้แต่ละคน โดย userId เป็น key และค่าคือจำนวนข้อความที่ยังไม่ได้อ่าน
    };
  },
  mounted() { // `mounted` เป็น lifecycle hook ที่ถูกเรียกหลังจากที่ component นี้แสดงผลเรียบร้อยแล้ว
    // สร้างการเชื่อมต่อกับ server Socket.IO โดยเชื่อมต่อไปที่ URL `http://localhost:8081`
    this.socket = io('http://localhost:8081');

    // เรียก `loadMessages` เพื่อโหลดข้อความที่บันทึกไว้จาก localStorage มายัง `messages` และ `activeUsers`
    this.loadMessages();

    // ตั้งค่า event listener เมื่อได้รับข้อความใหม่จาก server
    this.socket.on('chatMessage', (message) => {
      const now = new Date(); // เวลาปัจจุบันเมื่อได้รับข้อความ
      const timestamp = now.toLocaleString('th-TH', { // แปลงเวลาเป็นรูปแบบไทย
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // ใช้รูปแบบ 24 ชั่วโมง
      });

      // ตรวจสอบว่ามีข้อความของ userId นี้ใน `messages` หรือไม่ ถ้าไม่มีจะสร้าง array ใหม่
      if (!this.messages[message.userId]) {
        this.messages[message.userId] = []; // สร้าง array เปล่าเพื่อเก็บข้อความ
        this.addActiveUser(message.userId, message.username); // เพิ่มผู้ใช้ในรายชื่อผู้ใช้ที่ใช้งานอยู่ (activeUsers)
      }

      // ตรวจสอบว่าข้อความที่ได้รับส่งเข้ามาในวันนี้หรือไม่
      const isToday = now.toLocaleDateString('th-TH') === new Date(message.timestamp).toLocaleDateString('th-TH');

      // เพิ่มข้อความใหม่ลงใน array ของ userId ที่สอดคล้องใน `messages`
      this.messages[message.userId].push({
        text: message.message, // เนื้อหาข้อความที่ได้รับจาก server
        sender: message.sender, // ชื่อของผู้ส่งข้อความ (เช่น 'user' หรือ 'admin')
        timestamp: isToday ? 'Today ' + timestamp.split(' ')[1] : timestamp // ถ้าเป็นวันนี้จะแสดง 'Today' ถ้าไม่ใช่จะแสดงวันที่เต็ม
      });

      // เพิ่มจำนวนข้อความที่ยังไม่ได้อ่านของผู้ใช้นั้น โดยถ้าไม่มีค่าเริ่มต้นจะตั้งเป็น 0 ก่อนแล้วเพิ่ม 1
      this.unreadCount[message.userId] = (this.unreadCount[message.userId] || 0) + 1;

      // บันทึกข้อความใน localStorage
      this.saveMessages(message.userId);
      // เลื่อนหน้าจอแชทไปที่ข้อความล่าสุด
      this.scrollToBottom();
    });

    // ส่งคำขอเข้าร่วมห้องแชทในบทบาทแอดมิน
    this.socket.emit('joinRoom', { userId: 'admin', role: 'admin' });
  },
  methods: {
    // ฟังก์ชันเลือกผู้ใช้ที่ต้องการแชท
    selectUser(userId) {
      if (this.selectedUserId === userId) { // ถ้าผู้ใช้ที่เลือกอยู่แล้วเป็นคนเดียวกับที่คลิก ให้รีเซ็ต unreadCount
        this.unreadCount[userId] = 0; // ตั้งค่า unreadCount ของ userId นี้เป็น 0
      } else {
        this.selectedUserId = userId; // ถ้าเลือกผู้ใช้ใหม่ ตั้งค่า `selectedUserId` เป็น userId ที่เลือก
      }
      this.scrollToBottom(); // เลื่อนหน้าจอแชทไปที่ข้อความล่าสุด
    },

    // ฟังก์ชันสำหรับส่งข้อความไปยังผู้ใช้ที่เลือก
    sendMessage() {
      if (this.input.trim() && this.selectedUserId) { // ตรวจสอบว่ามีข้อความใน input และมีผู้ใช้ที่เลือกอยู่
        // สร้างข้อมูลข้อความที่จะส่ง
        const messageData = {
          message: this.input, // ข้อความที่แอดมินป้อน
          sender: 'admin', // ผู้ส่งเป็น 'admin'
          userId: this.selectedUserId, // รหัสของผู้ใช้ที่เลือก
          roomId: this.selectedUserId, // ห้องแชทเป็น userId เดียวกัน
          timestamp: new Date().toLocaleString() // เวลาปัจจุบันในรูปแบบที่อ่านได้
        };
        this.socket.emit('chatMessage', messageData); // ส่งข้อความไปยัง server ผ่าน socket event 'chatMessage'

        // ตรวจสอบว่าใน `messages` ของ userId นั้นมี array หรือไม่ ถ้าไม่มีให้สร้างใหม่
        if (!this.messages[this.selectedUserId]) {
          this.messages[this.selectedUserId] = []; // สร้าง array เปล่าสำหรับเก็บข้อความ
        }

        // เพิ่มข้อความของแอดมินลงใน `messages`
        this.messages[this.selectedUserId].push({
          text: this.input, // ข้อความที่แอดมินป้อน
          sender: 'admin', // ผู้ส่งคือแอดมิน
          timestamp: messageData.timestamp // เวลาของข้อความ
        });
        this.saveMessages(this.selectedUserId); // บันทึกข้อความลงใน localStorage
        this.input = ''; // เคลียร์ข้อความใน input หลังจากส่ง
        this.scrollToBottom(); // เลื่อนหน้าจอไปที่ข้อความล่าสุด
      }
    },

    // ฟังก์ชันส่งข้อความการยืนยันการจองที่กำหนดไว้ล่วงหน้า
    sendBookingConfirmation() {
      this.sendMessageWithText("การจองบริการของคุณเรียบร้อยแล้วค่ะ สามารถติดตามประวัติการดำเนินการได้ที่หน้าแอคเคาท์ของคุณ ขอบคุณค่ะ");
    },

    // ฟังก์ชัน `sendMessageWithText` ส่งข้อความที่กำหนดไว้ล่วงหน้าไปยังผู้ใช้ที่เลือก
    sendMessageWithText(text) {
      if (this.selectedUserId) { // ตรวจสอบว่ามีผู้ใช้ที่เลือกอยู่
        // สร้างข้อมูลข้อความที่จะส่ง
        const messageData = {
          message: text, // ข้อความที่ต้องการส่ง
          sender: 'admin', // ผู้ส่งคือแอดมิน
          userId: this.selectedUserId, // รหัสของผู้ใช้ที่เลือก
          roomId: this.selectedUserId, // ห้องแชทเป็น userId เดียวกัน
          timestamp: new Date().toLocaleString() // เวลาปัจจุบันในรูปแบบที่อ่านได้
        };
        this.socket.emit('chatMessage', messageData); // ส่งข้อความไปยัง server ผ่าน socket event 'chatMessage'

        // ตรวจสอบว่าใน `messages` ของ userId นั้นมี array หรือไม่ ถ้าไม่มีให้สร้างใหม่
        if (!this.messages[this.selectedUserId]) {
          this.messages[this.selectedUserId] = []; // สร้าง array เปล่าสำหรับเก็บข้อความ
        }

        // เพิ่มข้อความที่ส่งไว้ล่วงหน้าลงใน `messages`
        this.messages[this.selectedUserId].push({
          text: text, // ข้อความที่ส่ง
          sender: 'admin', // ผู้ส่งคือแอดมิน
          timestamp: messageData.timestamp // เวลาของข้อความ
        });
        this.saveMessages(this.selectedUserId); // บันทึกข้อความลงใน localStorage
        this.scrollToBottom(); // เลื่อนหน้าจอไปที่ข้อความล่าสุด
      }
    },

    // ฟังก์ชันเลื่อนหน้าจอแชทไปยังข้อความล่าสุด
    scrollToBottom() {
      this.$nextTick(() => { // รอให้ DOM อัปเดตเสร็จสิ้นก่อนทำงาน
        const messagesList = this.$refs.messagesList; // อ้างอิงถึงกล่องข้อความใน DOM ผ่าน `$refs`
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight; // เลื่อนกล่องข้อความไปที่ด้านล่างสุด
        }
      });
    },

    // บันทึกข้อความของผู้ใช้ใน localStorage เพื่อให้สามารถโหลดกลับมาได้ในภายหลัง
    saveMessages(userId) {
      localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(this.messages[userId])); // เก็บข้อมูล `messages` เป็น JSON string
      localStorage.setItem('activeUsers', JSON.stringify(this.activeUsers)); // เก็บข้อมูลผู้ใช้ที่กำลังใช้งานอยู่
    },

    // โหลดข้อความจาก localStorage เพื่อเรียกคืนข้อมูลแชทเมื่อเปิดแอปอีกครั้ง
    loadMessages() {
      const savedActiveUsers = localStorage.getItem('activeUsers'); // โหลดรายชื่อผู้ใช้จาก localStorage
      if (savedActiveUsers) {
        this.activeUsers = JSON.parse(savedActiveUsers); // แปลง JSON string เป็น array
      }

      // โหลดข้อความของผู้ใช้แต่ละคนที่บันทึกไว้ใน localStorage
      this.activeUsers.forEach((user) => {
        const savedMessages = localStorage.getItem(`chatMessages_${user.userId}`); // โหลดข้อความของ userId
        if (savedMessages) {
          this.messages[user.userId] = JSON.parse(savedMessages); // แปลง JSON string เป็น array แล้วบันทึกลง `messages`
        }
      });
    },

    // ดึงรายละเอียดของผู้ใช้จาก API ด้วย userId
    async getUserDetails(userId) {
      try {
        const response = await fetch(`http://localhost:8081/api/users/${userId}`); // เรียก API เพื่อดึงข้อมูลผู้ใช้
        const user = await response.json(); // แปลงข้อมูลจาก response เป็น JSON
        return user.username; // ส่งคืนชื่อผู้ใช้ที่ดึงมา
      } catch (error) {
        console.error("Error fetching user details:", error); // แสดงข้อผิดพลาดใน console ถ้าดึงข้อมูลไม่สำเร็จ
        return `User ${userId}`; // ส่งคืน userId หากดึงข้อมูลไม่สำเร็จ
      }
    },

    // ฟังก์ชัน `addActiveUser` เพิ่มผู้ใช้ใหม่ในรายชื่อผู้ใช้ที่กำลังใช้งานอยู่
    async addActiveUser(userId, username = null) {
      if (!this.activeUsers.some(user => user.userId === userId)) { // ตรวจสอบว่าผู้ใช้คนนี้อยู่ในรายชื่อ activeUsers หรือไม่
        if (!username) {
          username = await this.getUserDetails(userId); // ถ้าไม่มีชื่อผู้ใช้ ให้เรียก `getUserDetails` เพื่อดึงข้อมูล
        }
        this.activeUsers.push({ userId, username }); // เพิ่มข้อมูลผู้ใช้ใน `activeUsers`
        localStorage.setItem('activeUsers', JSON.stringify(this.activeUsers)); // บันทึก activeUsers ใน localStorage
      }
    }
  }
};
</script>

<style scoped>
/* การตั้งค่าสำหรับส่วนแชทหลัก */
.chat-container {
  display: flex;
  background-color: #f5f5f5;
  height: 90vh;
}

/* การตั้งค่าสำหรับรายการผู้ใช้ */
.user-list {
  width: 220px;
  border-right: 1px solid #ccc;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.user-list h3 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  padding: 10px 0;
  border-bottom: 2px solid #4caf50;
}

/* การตั้งค่า ul รายการผู้ใช้ */
.user-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

/* การตั้งค่า li สำหรับผู้ใช้แต่ละคน */
.user-list li {
  cursor: pointer;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: background-color 0.2s;
  background-color: #f9f9f9;
}

.user-list li:hover {
  background-color: #e0e0e0;
  transform: scale(1.02);
}

/* การตั้งค่าสำหรับกล่องแชท */
.chat-box {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #fff;
  border-left: 1px solid #ccc;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  transition: background-color 0.3s;
}

/* กลุ่มข้อความ */
.message-group {
  margin-bottom: 10px;
  animation: fadeIn 0.5s;
}

/* การตั้งค่า fadeIn */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* การตั้งค่าสำหรับข้อความแต่ละกล่อง */
.message {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  width: fit-content;
  position: relative;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 10px;
}

.admin {
  background-color: #e1f7d5;
  margin-left: auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #4caf50;
}

.user {
  background-color: #d1e7ff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #007bff;
}

.sender {
  font-weight: bold;
  margin-right: 5px;
}

.timestamp {
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
  text-align: right;
  display: block;
}

/* การตั้งค่าสำหรับ unread badge */
.unread-badge {
  background-color: #ff4d4d;
  color: white;
  border-radius: 10px;
  padding: 2px 5px;
  margin-left: 5px;
  font-size: 0.8rem;
}

/* การตั้งค่า form สำหรับการส่งข้อความ */
#form {
  display: flex;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
}

#form input {
  flex-grow: 1;
  border-radius: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  margin-right: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
