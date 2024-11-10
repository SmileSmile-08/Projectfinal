<template>
  <div class="container mx-auto p-8 bg-light">
    <!-- ส่วนนี้เป็นกล่องหลักที่ใช้ในการแสดงข้อมูลส่วนตัวของผู้ใช้ โดยมีการตั้งค่าให้กึ่งกลาง (mx-auto) มีการเว้นระยะขอบภายใน (p-8) และกำหนดสีพื้นหลังเป็นสีอ่อน (bg-light) -->
    
    <!-- กรอบส่วนของหัวข้อข้อมูล -->
    <div class="header-box">
      <!-- หัวข้อหลักของหน้าข้อมูลส่วนตัว มีขนาดตัวอักษรขนาด 3xl ตัวหนา และจัดให้อยู่ตรงกลาง (text-center) รวมถึงกำหนดสีตัวอักษรเป็นสีเข้ม (text-dark) -->
      <h1 class="text-3xl font-bold mb-4 text-center text-dark">PERSONAL INFORMATION</h1>
    </div>
    
    <!-- ข้อมูลผู้ใช้ -->
    <!-- ตรวจสอบว่ามีข้อมูลผู้ใช้ใน `user` หรือไม่ ถ้ามีจะทำการแสดงข้อมูล -->
    <div v-if="user" class="user-info">
      <!-- แสดงข้อมูลผู้ใช้ในรูปแบบ grid 2 คอลัมน์ โดยเว้นระยะห่างระหว่างคอลัมน์ด้วย gap-4 และมีระยะห่างจากส่วนล่างด้วย mb-6 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <!-- ป้ายชื่อข้อมูล (Label) แสดงว่าเป็นข้อมูล "First name" ของผู้ใช้ -->
          <label class="block text-sm font-medium text-dark">First name</label>
          <!-- แสดงชื่อจริงของผู้ใช้ โดยดึงข้อมูลจาก `user.First_name` และเพิ่มระยะห่างจากด้านบนเล็กน้อย (mt-1) -->
          <p class="mt-1 text-medium">{{ user.First_name }}</p>
        </div>
        <div>
          <!-- ป้ายชื่อข้อมูล (Label) แสดงว่าเป็นข้อมูล "Last name" ของผู้ใช้ -->
          <label class="block text-sm font-medium text-dark">Last name</label>
          <!-- แสดงนามสกุลของผู้ใช้ โดยดึงข้อมูลจาก `user.Last_name` และเพิ่มระยะห่างจากด้านบนเล็กน้อย (mt-1) -->
          <p class="mt-1 text-medium">{{ user.Last_name }}</p>
        </div>
      </div>
      
      <!-- ส่วนแสดงข้อมูลอีเมลของผู้ใช้ -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <!-- ป้ายชื่อข้อมูล (Label) แสดงว่าเป็นข้อมูล "Email" ของผู้ใช้ -->
          <label class="block text-sm font-medium text-dark">Email</label>
          <!-- แสดงอีเมลของผู้ใช้ โดยดึงข้อมูลจาก `user.Email` และเพิ่มระยะห่างจากด้านบนเล็กน้อย (mt-1) -->
          <p class="mt-1 text-medium">{{ user.Email }}</p>
        </div>
      </div>
    </div>
    
    <!-- ถ้าไม่มีข้อมูลผู้ใช้ใน `user` จะแสดงข้อความว่า "กำลังโหลดข้อมูล..." -->
    <div v-else>
      <p class="text-danger">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- ประวัติการใช้บริการ -->
    <!-- ตรวจสอบว่ามีประวัติการใช้บริการหรือไม่ ถ้ามีข้อมูลใน `serviceHistory` มากกว่า 0 จะแสดงรายการประวัติการใช้บริการ -->
    <div class="service-history-container mt-8" v-if="serviceHistory.length > 0">
      <!-- หัวข้อส่วนประวัติการใช้บริการ มีขนาดตัวอักษรขนาด xl ตัวหนา และมีระยะห่างจากส่วนล่าง (mb-4) -->
      <h2 class="text-xl font-semibold text-dark mb-4">Service History</h2>
      <ul>
        <!-- วนลูปแสดงรายการประวัติการใช้บริการแต่ละรายการใน `serviceHistory` โดยมีคีย์เฉพาะตัว (`:key="index"`) และแสดงในรูปแบบรายการ (list) -->
        <li v-for="(service, index) in serviceHistory" :key="index" class="service-history-item">
          <!-- แสดงวันที่นัดหมาย โดยใช้ฟังก์ชัน `formatDate` เพื่อแปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย -->
          <p class="title">วันที่: {{ formatDate(service.appointment_date) }}</p>
          <!-- แสดงชื่อบริการที่ผู้ใช้ใช้ เช่น "การเคลือบสี" หรือ "การซ่อม" -->
          <p class="subtitle">บริการที่ใช้: {{ service.service_name }}</p>
          <!-- แสดงสถานะของบริการ เช่น "เสร็จสิ้น" หรือ "อยู่ระหว่างดำเนินการ" -->
          <p class="subtitle">สถานะ: {{ service.status }}</p>
          <!-- แสดงวันหมดประกันของบริการ โดยแปลงวันที่ด้วยฟังก์ชัน `formatDate` -->
          <p class="subtitle">วันหมดประกัน: {{ formatDate(service.warranty_end_date) }}</p>
          <!-- แสดงสถานที่ให้บริการ เช่น "ร้านสาขาใหญ่" หรือ "สาขาย่อย" -->
          <p class="subtitle">สถานที่: {{ service.location }}</p>
          <!-- แสดงราคาของบริการเป็นสกุลเงินบาท (฿) -->
          <p class="subtitle">ราคา: {{ service.amount_charged }}฿</p>
        </li>
      </ul>
    </div>
    
    <!-- ถ้าไม่มีประวัติการใช้บริการใน `serviceHistory` จะแสดงข้อความว่า "ยังไม่มีประวัติการใช้บริการ" -->
    <div v-else>
      <p class="text-muted">ยังไม่มีประวัติการใช้บริการ</p>
    </div>
  </div>
</template>

<script>
export default {
  // ฟังก์ชัน data สร้างตัวแปร reactive ใน component
  data() {
    return {
      user: null, // ตัวแปร `user` ใช้เก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่
      serviceHistory: [], // ตัวแปร `serviceHistory` ใช้เก็บข้อมูลประวัติการใช้บริการของผู้ใช้
    };
  },
  
  // lifecycle hook `mounted` ถูกเรียกทันทีที่ component ถูก mount ลงใน DOM
  mounted() {
    this.getUser(); // เรียกฟังก์ชัน `getUser` เพื่อดึงข้อมูลผู้ใช้จาก API หรือ localStorage เมื่อ component ถูก mount
    this.getServiceHistory(); // เรียกฟังก์ชัน `getServiceHistory` เพื่อดึงข้อมูลประวัติการใช้บริการของผู้ใช้จาก API
  },
  
  methods: { // methods ใน component นี้

    // ฟังก์ชัน `getUser` ใช้ดึงข้อมูลผู้ใช้ที่ล็อกอินจาก localStorage และ API
    getUser() {
      // ดึงข้อมูลผู้ใช้จาก localStorage โดยใช้ key 'currentUser' และแปลงเป็น object
      const user = JSON.parse(localStorage.getItem('currentUser')); 

      // ตรวจสอบว่ามีข้อมูล `user_id` ใน localStorage หรือไม่
      if (user && user.user_id) {
        // ใช้ `fetch` เพื่อเรียก API โดยระบุ `user_id` ที่ได้รับจาก localStorage เพื่อดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
        fetch(`http://localhost:8080/api/v1/user_accounts/${user.user_id}`)
          .then(response => response.json()) // แปลง response ที่ได้จาก server เป็น JSON
          .then(data => {
            this.user = data; // ตั้งค่าข้อมูลผู้ใช้ที่ดึงมาให้กับ `user`
          })
          .catch(error => {
            // แสดงข้อความ error ใน console ถ้ามีข้อผิดพลาดในการดึงข้อมูลผู้ใช้
            console.error('Error fetching user data:', error);
          });
      } else {
        // แสดงข้อความ error ใน console ถ้าไม่มีข้อมูลผู้ใช้ใน localStorage
        console.error('ไม่พบข้อมูลผู้ใช้ใน LocalStorage');
      }
    },
    
    // ฟังก์ชัน `getServiceHistory` ใช้สำหรับดึงข้อมูลประวัติการใช้บริการของผู้ใช้จาก API
    getServiceHistory() {
      // ดึง user_id ของผู้ใช้จาก localStorage เพื่อใช้ในการเรียก API
      const user = JSON.parse(localStorage.getItem('currentUser')); 

      // ตรวจสอบว่ามี `user_id` ใน localStorage หรือไม่
      if (user && user.user_id) {
        // เรียก API เพื่อดึงข้อมูลประวัติการใช้บริการของผู้ใช้โดยใช้ `user_id` ที่ได้จาก localStorage
        fetch(`http://localhost:8080/api/v1/service_history/user/${user.user_id}`)
          .then(response => response.json()) // แปลง response ที่ได้จาก server เป็น JSON
          .then(data => {
            this.serviceHistory = data; // ตั้งค่าข้อมูลประวัติการใช้บริการที่ดึงมาให้กับ `serviceHistory`
          })
          .catch(error => {
            // แสดงข้อความ error ใน console ถ้ามีข้อผิดพลาดในการดึงข้อมูลประวัติการใช้บริการ
            console.error('Error fetching service history:', error);
          });
      } else {
        // แสดงข้อความ error ใน console ถ้าไม่มีข้อมูลผู้ใช้ใน localStorage
        console.error('ไม่พบข้อมูลผู้ใช้ใน LocalStorage');
      }
    },
    
    // ฟังก์ชัน `formatDate` ใช้แปลงวันที่ให้เป็นรูปแบบที่อ่านง่าย
    formatDate(date) {
      // ตัวเลือก `options` ใช้กำหนดรูปแบบวันที่ เช่น "ปี เดือน วัน"
      const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
      // แปลงวันที่ให้อยู่ในรูปแบบภาษาไทย (th-TH) โดยใช้ตัวเลือกที่กำหนดใน `options`
      return new Date(date).toLocaleDateString('th-TH', options); 
    },
  },
};
</script>

<style scoped>
/* Container */
.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* กรอบสำหรับหัวข้อ */
.header-box {
  width: 100vw; /* กรอบเต็มจอแนวนอน */
  margin-left: calc(-50vw + 50%); /* เพื่อให้กล่องตรงกลาง */
  padding: 40px;
  border: 2px solid #F2EDE4; /* สีขอบ */
  background-color: #736151; /* สีพื้นหลัง */
  text-align: center;
  border-radius: 12px;
  color: #FFFFFF; /* สีข้อความ */
  margin-bottom: 20px;
}

/* สีข้อความ */
.text-primary {
  color: #F2EDE4; /* สีข้อความหลัก */
}

.text-dark {
  color: #403B33; /* Updated text color */
}

.text-medium {
  color: #736151; /* Updated subtitle color */
}

.text-muted {
  color: #A69485;
}

.text-danger {
  color: #D9C9BA;
}

/* สไตล์สำหรับข้อมูลผู้ใช้ */
.user-info p {
  font-size: 16px;
  color: #403B33;
  background-color: #D9C9BA;
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
  transition: all 0.3s ease;
}

.user-info p:hover {
  background-color: #A69485;
}

/* สไตล์สำหรับประวัติการใช้บริการ */
.service-history-container {
  border-top: 1px solid #D9C9BA;
  padding-top: 20px;
}

.service-history-item {
  background-color: #F2EDE4;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.service-history-item:hover {
  background-color: #D9C9BA;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.service-history-item p {
  font-size: 16px;
  color: #403B33;
  margin: 0 0 8px;
}

.service-history-item .title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #403B33;
}

.service-history-item .subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #736151;
}
</style>
