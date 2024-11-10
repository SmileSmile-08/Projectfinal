<template>
  <div class="schedule-container">
    <!-- Hero Section -->
    <section class="hero">
      <h1>Schedule Calendar</h1>
      <p>Manage your appointments effortlessly with our calendar.</p>
    </section>

    <!-- Calendar Section -->
    <section class="calendar-section">
      <div class="nav-buttons">
        <button @click="changeMonth(-1)" class="nav-button prev-button">❮ Previous Month</button>
        <h2 id="month-year">{{ monthYear }}</h2>
        <button @click="changeMonth(1)" class="nav-button next-button">Next Month ❯</button>
      </div>
      <div class="calendar" id="calendar">
        <div class="day" v-for="(day, index) in days" :key="index">
          <div class="day-header">{{ day.date }}</div>
          <p>{{ day.appointments.length > 0 ? 'Appointments' : 'No Appointments' }}</p>
          <div class="appointment" v-for="(appointment, appIndex) in day.appointments" :key="appIndex">
            {{ appointment.appointment_time }} - {{ appointment.note }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// นำเข้า `ref` และ `computed` จาก Vue เพื่อใช้ในการสร้างตัวแปร reactive และตัวแปรคำนวณอัตโนมัติ
import { ref, computed } from 'vue';

export default {
  // ตั้งชื่อ component นี้ว่า "ScheduleView"
  name: "ScheduleView",
  setup() { // ฟังก์ชัน `setup` สำหรับ Composition API ของ Vue ใช้กำหนดค่าตัวแปรและฟังก์ชันใน component

    //สร้างตัวแปร currentMonth ขึ้นมา โดยดึงหมายเลขของเดือนปัจจุบันจาก new Date() มาเก็บไว้ ค่าที่เก็บจะเป็นหมายเลขของเดือน เช่น เดือนพฤศจิกายน จะเก็บค่าเป็น 10 เช่นเดียวกับ currentYear
    // curruentmonth และ currentYear เป็นตัวแปรที่เก็บเดือนและปีปัจจุบันที่ได้จาก newDate
    //ใช้ new Date() สร้างวันที่เเละเวลาปัจจุบัน
    //ตัวอย่าง: ถ้าเราใช้ new Date() ในวันที่ 7 พฤศจิกายน 2024  ค่าที่ได้จาก new Date() ก็จะเก็บค่าเวลานี้ ง่ายๆคือมันจะเก็บวันที่ของวันปัจจุบัน
    //สรุป new Date()ดึงค่าเดือนและปีปัจจุบันมาเก็บไว้ในตัวแปร currentMonth และ currentYear โดยข้อมูลนี้จะถูกใช้เพื่อกำหนดปฏิทินให้แสดงเดือนและปีที่ตรงกับปัจจุบันค่ะ
    //getMonth หมายเลขของเดือน 0-11
    const currentMonth = ref(new Date().getMonth());

    // สร้างตัวแปร `currentYear` โดยใช้ `ref` เพื่อเก็บปีปัจจุบันที่ได้จาก Date object
    const currentYear = ref(new Date().getFullYear());

    // `monthNames` เป็น array ที่เก็บชื่อเดือนทั้งหมด ใช้ในการแสดงผลที่ปฏิทิน
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // monthYear เป็นตัวแปรแบบ computed ที่จะคำนวณชื่อเดือนและปีอัตโนมัติ เช่น ถ้า currentMonth คือ 0 (January) และ currentYear คือ 2024 ตัวแปรนี้จะแสดงเป็น "January 2024"
    const monthYear = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);
    //computed ใช้คำนวณค่าแบบอัตโนมัติ

    // ตัวแปร `days` เก็บข้อมูลวันทั้งหมดในเดือนปัจจุบัน ซึ่งเป็น array ของวันและการนัดหมายในแต่ละวัน
    const days = ref([]);

    // ตัวแปร `appointments` เก็บข้อมูลการนัดหมายทั้งหมดที่ดึงจาก API ซึ่งจะถูกกรองเพื่อนำมาแสดงในปฏิทินตามเดือนและปีที่เลือก
    const appointments = ref([]);

    // ฟังก์ชัน `loadAppointments` เป็นฟังก์ชัน asynchronous ที่ทำหน้าที่ดึงข้อมูลการนัดหมายจาก API
    const loadAppointments = async () => {
      try {
        // เรียก API เพื่อดึงข้อมูลการนัดหมาย โดยใช้ HTTP GET ไปที่ URL ที่ระบุ
        const response = await fetch('http://localhost:8080/api/v1/schedule');
        if (!response.ok) throw new Error('Failed to fetch appointments'); // ถ้าการตอบกลับไม่สำเร็จ ให้โยน error

        // แปลงข้อมูลที่ได้จาก response เป็น JSON และเก็บไว้ในตัวแปร `data`
        const data = await response.json();

        // กำหนดค่าของ `appointments` ให้เป็นข้อมูลการนัดหมายที่ดึงมา
        appointments.value = data;

        // เรียกฟังก์ชัน `renderCalendar` เพื่อแสดงข้อมูลปฏิทินพร้อมการนัดหมายที่ได้มา
        renderCalendar();
      } catch (error) {
        // ถ้ามีข้อผิดพลาดในการดึงข้อมูล จะแสดงข้อความข้อผิดพลาดใน console
        console.error('Error loading appointments:', error);
      }
    };

    // ฟังก์ชัน `renderCalendar` ใช้สร้างข้อมูลของเดือนและวันในปฏิทิน รวมทั้งแสดงการนัดหมายที่ตรงกับวันนั้น ๆ
    const renderCalendar = () => {
      // `firstDay` คือวันในสัปดาห์ (0-6) ของวันที่ 1 ของเดือนปัจจุบัน ใช้ในการจัดตำแหน่งวันในปฏิทิน
      const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();

      // `lastDate` คือวันที่สุดท้ายของเดือนปัจจุบัน ซึ่งใช้ในการระบุจำนวนวันในเดือนนั้น
      const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

      // เคลียร์ค่า `days` ก่อนเริ่มการสร้างปฏิทินใหม่
      days.value = [];

      // วนลูปตามค่า `firstDay` เพื่อเพิ่มช่องว่างในปฏิทินก่อนวันที่ 1 ของเดือน
      for (let i = 0; i < firstDay; i++) {
        days.value.push({ date: '', appointments: [] }); // ใส่ช่องว่างโดยไม่มีวันที่และไม่มีการนัดหมาย
      }

      // วนลูปตามจำนวนวันของเดือน และเพิ่มข้อมูลวันลงใน `days` โดยเริ่มจากวันที่ 1 ถึงวันที่สุดท้ายของเดือน
      for (let day = 1; day <= lastDate; day++) {
        days.value.push({ date: day, appointments: [] }); // เก็บวันที่ และเตรียม array `appointments` ว่าง ๆ สำหรับการนัดหมายของวันนั้น ๆ
      }

      // วนลูปการนัดหมายทั้งหมดใน `appointments` เพื่อจับคู่กับวันที่ใน `days`
      appointments.value.forEach(appointment => {
        // แปลงวันที่การนัดหมายเป็น Date object
        const appointmentDate = new Date(appointment.appointment_date);

        // ดึงวันที่ (1-31), เดือน (0-11) และปีของการนัดหมายจาก Date object
        const date = appointmentDate.getDate();
        const month = appointmentDate.getMonth();
        const year = appointmentDate.getFullYear();

        // ตรวจสอบว่าการนัดหมายนั้นอยู่ในเดือนและปีปัจจุบันหรือไม่
        /**
         *  month คือเดือนของการนัดหมายที่เราดึงออกมาจาก appointmentDate)
         * currentMonth.value คือ เดือนปัจจุบันที่เรากำลังแสดงในปฏิทิน
         * ถ้าทั้งสองค่าตรงกัน (=== คือการเปรียบเทียบความเท่ากัน แปลว่าการนัดหมายนั้นอยู่ใน เดือนเดียวกัน กับเดือนปัจจุบันที่เรากำลังแสดง
         * สรุป: ทั้งสองเงื่อนไขนี้จะบอกว่า การนัดหมายที่เราดูอยู่เป็นของเดือนและปีเดียวกับที่ปฏิทินแสดงอยู่ ถ้าใช่ เราจะสามารถแสดงนัดหมายนี้ในปฏิทินได้
         */
        if (month === currentMonth.value && year === currentYear.value) {
          // คำนวณ index ของวันที่ใน array `days` โดยบวก `firstDay` เพื่อจัดตำแหน่ง
          const dayIndex = date + firstDay - 1;

          // ตรวจสอบว่ามีวันที่ตรงใน `days` หรือไม่
          if (days.value[dayIndex]) {
            // เพิ่มการนัดหมายนั้นลงใน array `appointments` ของวันที่ใน `days`
            days.value[dayIndex].appointments.push({
              appointment_time: appointment.appointment_time, // เวลาในการนัดหมาย
              note: appointment.note // หมายเหตุการนัดหมาย
            });
          }
        }
      });
    };

    // ฟังก์ชัน `changeMonth` ใช้เปลี่ยนเดือนในปฏิทินตามทิศทางที่ระบุ
    const changeMonth = (direction) => { //ส่งตัวแปร direction มาจาก next month มีค่าแค่ 1 กับ -1 เอาไว้เปลี่ยนเดือน
      console.log('changeMonth direction', direction);
      // เปลี่ยนเดือนโดยบวกหรือลบตามค่า `direction`
      console.log('before change currentMonth.value',currentMonth.value);
      currentMonth.value += direction; //currentMonth.value = currentMonth.value + direction
      console.log('after change currentMonth.value',currentMonth.value);

      // CASE STUDY
      /*
      1. currentMonth.value = 10, direction = 1
        currentMonth.value = 10 + (1); -> 10 + 1
        currentMonth.value = 11;
        1.1 if แรก 11 < 0 ? ผิด
        1.2 if สอง 11 > 11 ? ผิด
        solution : เปลี่ยนจากเดือน พฤษจิกายน -> ธันวาคม (ปกติ)
      2. currentMonth.value = 11, direction = 1
        currentMonth.value = 11 + 1
        currentMonth.value = 12;
        2.1 if แรก 12 < 0 ? ผิด
        2.2 if สอง 12 > 11 ? ถูก
          currentMonth.value = 0 -> ธันวาคม 24 -> มกราคม 25
          currentYear.value++; สมมุติปีนี้คือ 24 ถ้าข้ามปีเอา 24 + 1;

          currentYear.value = 2024;
          ++ = "+ 1"
          solution: currentYear.value = 2024 + 1; || 2025
      3. currentMonth.value = 0, direction = -1
        currentMonth.value = 0 + (-1)
        currentMonth.value = -1;
          3.1 if แรก -1 < 0 ? ถูก
          currentMonth.value = 11 -> เปลี่ยนจากเดือน มกราคม เป็น ธันวาคม
          currentYear.value = 2025 - 1 (2025-- => -1)
          currentYear.value = 2024;
      
      
      */
      // ตรวจสอบว่าถ้า `currentMonth` ต่ำกว่า 0 ให้เปลี่ยนไปเป็นเดือนธันวาคมของปีก่อนหน้า
      if (currentMonth.value < 0) {
        currentMonth.value = 11; // ตั้งเดือนเป็นธันวาคม (11)
        currentYear.value--; // ลดปีลง 1
      } 
      // ถ้า `currentMonth` มากกว่า 11 ให้เปลี่ยนเป็นเดือนมกราคมของปีถัดไป
      else if (currentMonth.value > 11) { 
        currentMonth.value = 0; // ตั้งเดือนเป็นมกราคม (0)
        currentYear.value++; // เพิ่มปีขึ้น 1
      }

      // เรียก `renderCalendar` เพื่ออัปเดตปฏิทินตามเดือนที่เปลี่ยนใหม่
      renderCalendar();
    };

    // เรียกฟังก์ชัน `loadAppointments` เพื่อดึงข้อมูลการนัดหมายจาก API ทันทีที่ component โหลดเสร็จ
    loadAppointments();

    // คืนค่าตัวแปรและฟังก์ชันที่ต้องการให้สามารถใช้งานใน template ของ component ได้
    return {
      monthYear, // ข้อความที่แสดงเดือนและปีปัจจุบัน
      days, // ข้อมูลวันทั้งหมดของเดือนที่กำลังแสดงในปฏิทิน
      changeMonth // ฟังก์ชันเปลี่ยนเดือนในปฏิทิน
    };
  }
};
</script>

<style scoped>
/* Container Styles */
.schedule-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #F2EDE4; /* Background updated */
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #A69485, #D9C9BA); /* Colors updated */
  padding: 60px 20px;
  text-align: center;
  color: #403B33; /* Text color updated */
  border-radius: 10px;
}

.hero h1 {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 10px;
}

.hero p {
  font-size: 18px;
  margin-top: 0;
}

/* Calendar Section */
.calendar-section {
  padding: 40px 20px;
  background-color: #F2EDE4;
  text-align: center;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0px 4px 10px rgba(245, 232, 208, 0.1);
}

.calendar-section h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #403B33;
  font-weight: bold;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  max-width: 1000px;
  margin: 0 auto;
}

.day {
  background-color: #736151; /* Updated day background */
  border: 1px solid #A69485; /* Updated border */
  padding: 15px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  cursor: pointer;
}

.day:hover {
  background-color: #A69485;
}

.day-header {
  font-weight: bold;
  color: #F2EDE4; /* Text color updated */
  margin-bottom: 8px;
  font-size: 18px;
}

.day p {
  font-size: 14px;
  color: #F2EDE4; /* Text color updated */
}

.appointment {
  margin-top: 8px;
  background-color: #D9C9BA; /* Appointment color updated */
  color: #403B33;
  padding: 5px;
  border-radius: 6px;
  font-size: 12px;
  text-align: left;
  padding-left: 10px;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-button {
  background-color: #736151; /* Button background updated */
  color: #F2EDE4; /* Button text color updated */
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #A69485;
}

.prev-button {
  margin-right: 20px;
}

.next-button {
  margin-left: 20px;
}

#month-year {
  font-size: 24px;
  color: #403B33;
  font-weight: bold;
}
</style>
