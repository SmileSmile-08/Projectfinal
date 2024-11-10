<template>
  <div class="admin-settings">
    <!-- ส่วนหัว -->
    <header class="header-section">
      <!-- หัวข้อใหญ่ของหน้า -->
      <h1>Manage Members</h1>
      <!-- คำอธิบายสั้นๆ -->
      <p>View service histories of members.</p>
    </header>

    <!-- Filters Section สำหรับกรองรายชื่อสมาชิก -->
    <div class="filters">
      <div class="container">
        <!-- กล่องค้นหาสมาชิก -->
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search Members" 
          class="search-box" 
        />
      </div>
    </div>
    
    <!-- รายชื่อสมาชิก -->
    <div class="container">
      <ul class="user-list">
        <!-- วนลูปรายชื่อสมาชิกจากข้อมูล filteredUsers -->
        <li v-for="user in filteredUsers" :key="user.ID" class="user-item">
          <div class="user-info">
            <!-- แสดงข้อมูลสมาชิก -->
            <strong>Username:</strong> {{ user.Username }}<br>
            <strong>First Name:</strong> {{ user.First_name }}<br>
            <strong>Last Name:</strong> {{ user.Last_name }}<br>
            <strong>Email:</strong> {{ user.Email }}
          </div>

          <!-- แสดงประวัติการใช้บริการถ้ามี -->
          <div v-if="user.serviceHistory && user.serviceHistory.length > 0" class="service-history">
            <strong>Service History:</strong>
            <ul>
              <!-- วนลูปข้อมูลประวัติการใช้บริการของสมาชิกแต่ละคน -->
              <li v-for="(service, index) in user.serviceHistory" :key="index" class="service-item">
                <strong>Service:</strong> {{ service.service_name }} <br>
                <strong>Date:</strong> {{ formatDate(service.appointment_date) }} <br>
                <strong>Status:</strong> {{ service.status }} <br>
                <strong>Warranty End Date:</strong> {{ formatDate(service.warranty_end_date) }} <br>
                <strong>Location:</strong> {{ service.location }} <br>
                <strong>Amount Charged:</strong> ฿{{ service.amount_charged.toFixed(2) }}
              </li>
            </ul>
          </div>
          <div v-else>
            <!-- ข้อความแสดงหากไม่มีประวัติการใช้บริการ -->
            <p class="text-gray-600">ยังไม่มีประวัติการใช้บริการ</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  // ข้อมูลสำหรับคอมโพเนนต์
  data() {
    return {
      users: [], // ตัวแปรเก็บข้อมูลสมาชิกทั้งหมด
      searchQuery: '' // ตัวแปรสำหรับเก็บข้อความที่ใช้ในการค้นหา
    };
  },
  // ฟังก์ชันที่ทำงานเมื่อคอมโพเนนต์ถูกสร้างขึ้น
  created() {
    this.fetchUsers(); // เรียกใช้ฟังก์ชัน fetchUsers เพื่อดึงข้อมูลสมาชิก
  },
  // คำนวณค่าใหม่ตาม searchQuery เพื่อให้ผลลัพธ์เป็นรายชื่อสมาชิกที่ตรงกับการค้นหา
  computed: {
    filteredUsers() {
      return this.users.filter(user => { // กรองสมาชิกโดยดูจากชื่อและนามสกุล
        const fullName = `${user.First_name} ${user.Last_name}`.toLowerCase(); // รวมชื่อและนามสกุล
        return fullName.includes(this.searchQuery.toLowerCase()); // ตรวจสอบว่าข้อความค้นหามีอยู่ในชื่อเต็ม
      });
    },
  },
  // ฟังก์ชันต่าง ๆ ของคอมโพเนนต์
  methods: {
    // ฟังก์ชันสำหรับดึงข้อมูลสมาชิกและประวัติการใช้บริการ
    async fetchUsers() {
      try {
        const response = await fetch('http://localhost:8080/api/v1/user_accounts'); // ดึงข้อมูลสมาชิกจาก API
        const data = await response.json(); // แปลงข้อมูลที่ตอบกลับเป็น JSON

        // ใช้ Promise.all เพื่อรอการดึงประวัติการใช้บริการของสมาชิกแต่ละคน
        const usersWithServiceHistory = await Promise.all(
          data.map(async (user) => { // วนลูปแต่ละสมาชิกเพื่อดึงประวัติการใช้บริการ
            const serviceResponse = await fetch(`http://localhost:8080/api/v1/service_history/user/${user.ID}`); // ดึงประวัติการใช้บริการตาม ID ของสมาชิก
            let serviceHistory = []; // ตัวแปรเก็บประวัติการใช้บริการ
            if (serviceResponse.ok) { // ตรวจสอบว่าการตอบกลับสำเร็จหรือไม่
              serviceHistory = await serviceResponse.json(); // แปลงข้อมูลเป็น JSON ถ้าสำเร็จ
            }
            return { ...user, serviceHistory }; // รวมข้อมูลสมาชิกและประวัติการใช้บริการเข้าเป็นออบเจกต์เดียวกัน
          })
        );

        this.users = usersWithServiceHistory; // เก็บข้อมูลที่ดึงมาใน `users`
      } catch (error) {
        console.error('Error fetching users or service history:', error); // แสดงข้อความข้อผิดพลาดใน console
      }
    },
    // ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }; // กำหนดรูปแบบวันที่
      return new Date(date).toLocaleDateString('th-TH', options); // แปลงวันที่ให้เป็นสไตล์ไทย
    },
  },
};
</script>

<style scoped>
/* การตั้งค่าทั่วไป */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* การตั้งค่าสำหรับส่วนหัว */
.header-section {
  width: 100%;
  background: linear-gradient(to right, #D9C9BA, #A69485); /* ไล่สีพื้นหลัง */
  color: #403B33;
  padding: 40px 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
}

.header-section h1 {
  margin: 0;
  font-size: 2.5em;
}

.header-section p {
  font-size: 1.2em;
}

/* การตั้งค่าสำหรับส่วนกรอง */
.filters {
  background-color: #fff;
  padding: 20px 0;
  border-bottom: 1px solid #eaeaea;
  text-align: center;
}

.search-box {
  width: 100%;
  max-width: 400px;
  padding: 15px;
  border: 2px solid #333;
  border-radius: 50px;
  font-size: 1rem;
}

/* การตั้งค่ารายชื่อสมาชิก */
.user-list {
  list-style: none;
  padding: 0;
  margin-top: 30px;
}

.user-item {
  background-color: #D9C9BA;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* เงา */
  display: flex;
  flex-direction: column;
}

.user-info {
  font-size: 1rem;
  color: #333;
}

/* การตั้งค่าประวัติการใช้บริการ */
.service-history {
  margin-top: 10px;
  background-color: #faf2e9;
  padding: 10px;
  border-radius: 8px;
}

/* รายการประวัติการใช้บริการ */
.service-item {
  padding: 10px;
  border-bottom: 1px solid #eaeaea;
}

.service-item:last-child {
  border-bottom: none;
}
</style>
