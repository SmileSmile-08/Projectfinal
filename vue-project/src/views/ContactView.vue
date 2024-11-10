<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <h1>Contact Us</h1>
      <p>We're here to help! Reach out to us with any questions or feedback.</p>
    </section>

    <!-- Contact Information Section -->
    <section class="info-section">
      <div class="container">
        <h2>Contact Information</h2>
        <p><strong>Address:</strong> 77/2 ม.4 ต.ห้วยขวาง อ.กำแพงแสน จ.นครปฐม</p>
        <p><strong>Phone:</strong> 081-9958-165</p>
        <p><strong>Line:</strong> komonservices</p>
        <p><strong>Email:</strong> komon@hotmail.com</p>
      </div>
    </section>

    <!-- Chatbot Trigger -->
    <div class="chatbot-emoji" @click="toggleChat">
      💬
    </div>

    <!-- Chatbot Popup -->
    <div v-if="chatOpen" class="chatbot-popup">
      <div class="chatbot-header">
        <h3>Chatbot</h3>
        <button @click="toggleChat">✖</button>
      </div>

      <!-- Auto Questions Buttons -->
      <div class="auto-questions">
        <button 
          v-for="(question, index) in autoQuestions" 
          :key="index" 
          @click="useAutoQuestion(question.keyword)"
          class="question-btn"
        >
          {{ question.keyword }}
        </button>
      </div>

      <!-- Messages Section -->
      <div class="chatbot-messages">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          class="message" 
          :class="message.sender"
        >
          <span>{{ message.text }}</span>
        </div>
      </div>

      <!-- Input Section -->
      <div class="chatbot-input">
        <input 
          v-model="userMessage" 
          @keyup.enter="sendMessage" 
          type="text" 
          placeholder="พิมพ์ข้อความ..." 
        />
        <button @click="sendMessage">ส่ง</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatOpen: false,
      userMessage: '',
      chatMessages: [],
      autoQuestions: [],
      userId: 'uniqueUserId' // เปลี่ยนเป็น ID ของผู้ใช้ที่ต้องการเก็บข้อมูล
    };
  },
  mounted() {
    this.fetchAutoQuestions();
    this.loadChatMessages(); // โหลดข้อความที่เก็บไว้จาก localStorage
  },
  methods: {
    toggleChat() {
      this.chatOpen = !this.chatOpen;
    },
    sendMessage() {
      if (this.userMessage.trim() !== '') {
        this.chatMessages.push({ text: this.userMessage, sender: 'user' });
        this.getChatbotResponse(this.userMessage);
        this.userMessage = ''; // เคลียร์ข้อความผู้ใช้หลังจากส่ง
        this.saveChatMessages(); // บันทึกข้อความลง localStorage
      }
    },
    async fetchAutoQuestions() {
      try {
        const response = await fetch('http://localhost:8080/api/v1/chatbot');
        const data = await response.json();
        this.autoQuestions = data;
      } catch (error) {
        console.error('Error fetching auto questions:', error);
      }
    },
    async useAutoQuestion(question) {
      this.chatMessages.push({ text: question, sender: 'user' });
      await this.getChatbotResponse(question); // เรียกใช้ฟังก์ชันนี้เพื่อส่งคำถามอัตโนมัติ
      this.saveChatMessages(); // บันทึกข้อความลง localStorage
    },
    async getChatbotResponse(message) {
      try {
        const response = await fetch('http://localhost:8080/api/v1/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        const data = await response.json();
        if (data.reply) {
          this.chatMessages.push({ text: data.reply, sender: 'chatbot' });
        } else {
          this.chatMessages.push({ text: 'ขอโทษค่ะ ฉันไม่เข้าใจคำถามของคุณ', sender: 'chatbot' });
        }
        this.saveChatMessages(); // บันทึกข้อความลง localStorage
      } catch (error) {
        console.error('Error fetching chatbot response:', error);
      }
    },
    saveChatMessages() {
      // ใช้ userId เป็นคีย์ในการบันทึกข้อความ
      localStorage.setItem(`chatMessages_${this.userId}`, JSON.stringify(this.chatMessages));
    },
    loadChatMessages() {
      // โหลดข้อความจาก localStorage โดยใช้ userId
      const savedMessages = localStorage.getItem(`chatMessages_${this.userId}`);
      if (savedMessages) {
        this.chatMessages = JSON.parse(savedMessages);
      }
    },
  },
};
</script>

<style scoped>
/* General Styles */
body {
  font-family: 'Garamond', serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #403B33;
  background-color: #F2EDE4;
}

/* Hero Section */
.hero {
  background-color: #F2EDE4;
  padding: 60px 20px;
  text-align: center;
  color: #403B33;
}

.hero h1 {
  font-size: 36px; /* ลดขนาดฟอนต์ให้เหมาะสม */
  font-weight: bold;
}

.hero p {
  font-size: 18px; /* ลดขนาดฟอนต์ให้เหมาะสม */
}

/* Info Section */
.info-section {
  padding: 40px 20px;
  background-color: #D9C9BA;
}

.info-section h2 {
  font-size: 24px; /* ปรับขนาดฟอนต์ให้พอดีกับพื้นที่ */
  margin-bottom: 20px;
  color: #403B33;
  font-weight: bold;
}

/* Chatbot Styles */
.chatbot-emoji {
  font-size: 36px;
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #736151;
  padding: 10px;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.chatbot-emoji:hover {
  background-color: #403B33;
}

/* Chatbot Popup */
.chatbot-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px; /* ปรับความกว้างให้กว้างขึ้น */
  height: 600px; /* ความสูง */
  background-color: #F2EDE4;
  border-radius: 20px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Chatbot Header */
.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #D9C9BA; /* สีพื้นหลังของหัวข้อ */
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

/* Messages Section */
.chatbot-messages {
  padding: 15px;
  height: 350px; /* ปรับความสูงให้เหมาะสม */
  overflow-y: auto;
  background-color: #fff;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  flex-direction: column;
  gap: 10px; /* เพิ่มระยะห่างระหว่างข้อความ */
}

/* Message Styles */
.message {
  max-width: 80%;
  padding: 10px;
  border-radius: 15px;
  font-size: 14px;
}

.user {
  background-color: #736151;
  color: white;
  align-self: flex-end;
  margin-left: auto;
}

.chatbot {
  background-color: #A69485;
  color: white;
  align-self: flex-start;
}

/* Auto Questions Button */
.auto-questions {
  display: grid; /* ใช้กริดเพื่อจัดเรียงปุ่ม */
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* ปรับขนาดปุ่ม */
  gap: 10px; /* เพิ่มระยะห่างระหว่างปุ่ม */
  padding: 10px;
}

/* Button Styles */
.question-btn {
  background-color: #736151;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.question-btn:hover {
  background-color: #A69485;
}

/* Input Section */
.chatbot-input {
  display: flex;
  padding: 10px;
  background-color: #F2EDE4;
}

input[type="text"] {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  height: 50px; /* เพิ่มความสูงช่องข้อความ */
}

button {
  margin-left: 10px;
  padding: 10px 15px;
  background-color: #403B33;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #736151;
}
</style>
