<template>
  <!-- คอนเทนเนอร์หลักของคอมโพเนนต์ตารางนัดหมาย -->
  <div class="schedule-view">

    <!-- ส่วนหัวสำหรับแสดงชื่อและคำอธิบายของปฏิทินตารางนัดหมาย -->
    <header class="header-section">
      <h1>Schedule Calendar</h1> <!-- ชื่อหลักของหน้าปฏิทิน -->
      <p>จัดการนัดหมายของคุณได้อย่างง่ายดายด้วยปฏิทินของเรา</p> <!-- คำอธิบายเกี่ยวกับฟีเจอร์ปฏิทิน -->
    </header>

    <!-- ส่วนสำหรับแสดงปฏิทิน รวมถึงปุ่มนำทางและปฏิทินประจำเดือน -->
    <section class="calendar-section">

      <!-- ปุ่มนำทางเพื่อเปลี่ยนเดือนของปฏิทิน -->
      <div class="nav-buttons">
        <button @click="changeMonth(-1)">Previous Month</button> <!-- ปุ่มสำหรับเดือนก่อนหน้า -->
        <button @click="changeMonth(1)">Next Month</button> <!-- ปุ่มสำหรับเดือนถัดไป -->
      </div>

      <!-- แสดงชื่อเดือนและปีปัจจุบัน -->
      <h2 id="month-year">{{ monthYear }}</h2>

      <!-- คอนเทนเนอร์ของปฏิทิน -->
      <div class="calendar" id="calendar">

        <!-- วนลูปแสดงวันต่างๆ ในเดือน โดยเรียกใช้ฟังก์ชัน editAppointment เมื่อคลิกที่วัน -->
        <div class="day" v-for="(day, dayIndex) in days" :key="dayIndex" @click="editAppointment(dayIndex, 0)">
          <div class="day-header">{{ day.date }}</div> <!-- แสดงวันที่ของแต่ละวันในเดือน -->

          <!-- แสดงข้อความหากมีหรือไม่มีการนัดหมายในวันนั้น -->
          <p>{{ day.appointments.length > 0 ? 'Appointments' : 'No Appointments' }}</p>

          <!-- วนลูปแสดงการนัดหมายในแต่ละวัน -->
          <div class="appointment" v-for="(appointment, appIndex) in day.appointments" :key="appIndex">
            {{ appointment.appointment_time }} {{ appointment.note }} <!-- แสดงเวลานัดและบันทึกย่อ -->

            <!-- ปุ่มสำหรับแก้ไขและลบการนัดหมาย  -->
            <button @click.stop="editAppointment(dayIndex, appIndex)">แก้ไขนัดหมาย</button>
            <button @click.stop="deleteAppointment(dayIndex, appIndex)">ลบนัดหมาย</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ส่วนของการจัดการนัดหมายสำหรับผู้ดูแลระบบ -->
    <section class="admin-section">
      <h2>Manage Appointments</h2>

      <!-- ฟอร์มสำหรับเพิ่มหรือแก้ไขการนัดหมาย -->
      <form @submit.prevent="handleSubmit" class="appointment-form">
        <h3>{{ isEditing ? 'Edit Appointment' : 'Add Appointment' }}</h3> <!-- เปลี่ยนชื่อหัวข้อฟอร์มตามโหมดแก้ไขหรือเพิ่มการนัดหมาย -->

        <!-- ฟิลด์เลือกวันที่ของการนัดหมาย -->
        <div class="form-group">
          <label for="appointmentDate">Date:</label> <!-- ป้ายบอกฟิลด์สำหรับกรอกวันที่ -->
          <input type="date" v-model="selectedDate" required /> <!-- รับค่าวันที่ -->
        </div>

        <!-- ฟิลด์เลือกเวลาของการนัดหมาย -->
        <div class="form-group">
          <label for="appointmentTime">Time:</label> <!-- ป้ายบอกฟิลด์สำหรับกรอกเวลา ผู้ใช้จะเห็นคำว่า Time: เป็นคำบอก (label) ว่าฟิลด์นี้เกี่ยวกับการกรอกเวลา -->
          <input type="time" v-model="selectedTime" required /> <!-- รับค่าเวลา -->
        </div>

        <!-- ฟิลด์สำหรับกรอกบันทึกย่อของการนัดหมาย -->
        <div class="form-group">
          <label for="appointmentName">Note:</label> <!-- ป้ายบอกฟิลด์สำหรับกรอกบันทึกย่อ -->
          <input type="text" v-model="selectedName" placeholder="Enter Note" required /> <!-- รับค่าบันทึกย่อ -->
        </div>

        <div class="group-button-custom">
          <!-- ปุ่มส่งฟอร์มเพื่อเพิ่มหรือแก้ไขการนัดหมาย -->
          <button type="submit" class="submit-button">{{ isEditing ? 'Update Appointment' : 'Add Appointment' }}</button>

          <!-- ปุ่มยกเลิกการกรอกข้อมูลฟอร์ม -->
          <button type="button" @click="resetForm" class="cancel-button">Cancel</button>
        </div>
      </form>
    </section>
  </div>
</template>


<script>
import { ref, computed } from 'vue'; // นำเข้า `ref` และ `computed` จาก Vue สำหรับสร้างตัวแปร reactive และค่าที่คำนวณ

export default {
  name: "ScheduleView", //กำหนดชื่อคอมโพเนนต์
  setup() { // ฟังก์ชันหลักสำหรับจัดการสถานะและการทำงานในคอมโพเนนต์
    
    // กำหนดค่าเดือนปัจจุบัน โดยใช้ `new Date().getMonth()` จะได้ค่าตัวเลขเป็น 0-11
    const currentMonth = ref(new Date().getMonth()); 

    // กำหนดค่าปีปัจจุบัน โดยใช้ `new Date().getFullYear()` จะได้ค่าเป็นปีในรูปแบบตัวเลข เช่นถ้าปีนี้ก็จะ2024
    const currentYear = ref(new Date().getFullYear()); 
    
    // กำหนดอาร์เรย์ของชื่อเดือนทั้งหมด เพื่อให้ currentmonth แสดงเดือรที่ถูกต้อง
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // กำหนด `monthYear` เป็นค่า `computedรวมชื่อเดือนจาก monthNames กับปีจาก currentY` ที่แสดงชื่อเดือนและปีตามค่าใน `currentMonth` และ `currentYear`
    const monthYear = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);
    
    // กำหนดตัวแปร `days` เป็นอาร์เรย์ที่จะเก็บข้อมูลวันทั้งหมดในปฏิทิน
    const days = ref([]);
    
    // กำหนดตัวแปร `appointments` เป็นอาร์เรย์ที่เก็บข้อมูลการนัดหมายทั้งหมด
    const appointments = ref([]);
    
    // กำหนดตัวแปร `selectedDate` เพื่อเก็บวันที่ที่เลือกในฟอร์มการนัดหมาย โดยกำหนดให้เป็นวันที่ปัจจุบัน
    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    
    // กำหนดตัวแปร `selectedTime` เก็บเวลาที่เลือกในฟอร์ม
    const selectedTime = ref('');
    
    // กำหนดตัวแปร `selectedName` เพื่อเก็บโน้ตที่กรอกในฟอร์มการนัดหมาย
    const selectedName = ref('');
    
    // กำหนดตัวแปร `isEditing` เป็น boolean เพื่อตรวจสอบว่ากำลังแก้ไขการนัดหมายอยู่หรือไม่
    const isEditing = ref(false);
    
    // กำหนดตัวแปร `editingIndex` เพื่อเก็บตำแหน่งการนัดหมายที่กำลังแก้ไขใน `appointments`
    const editingIndex = ref(-1);

    // ฟังก์ชัน `loadAppointments` สำหรับดึงข้อมูลการนัดหมายจากเซิร์ฟเวอร์
    const loadAppointments = async () => {
      try {
        // ส่งคำขอแบบ GET ไปที่ API endpoint `/schedule`
        const response = await fetch('http://localhost:8080/api/v1/schedule'); //await ตรงนี้ทำให้เรารอให้ fetch ดึงข้อมูลมาเสร็จ ก่อนที่ฟังก์ชันจะไปทำบรรทัดถัดไป (ไม่ข้ามไปโดยที่ข้อมูลยังไม่เสร็จ)
        
        // ตรวจสอบว่าการตอบกลับสำเร็จหรือไม่ ถ้าไม่สำเร็จให้โยน Error
        if (!response.ok) throw new Error('Failed to fetch appointments');
        
        // แปลงข้อมูลที่ได้จากการตอบกลับเป็น JSON และเก็บไว้ใน `appointments`
        const data = await response.json();
        appointments.value = data; //เก็บข้อมูลdate ไว้ที่ appointment value เก็บค่าข้อมูล ติดตามการเปลี่ยนแปลง
        
        // เรียกใช้ `renderCalendar` เพื่อสร้างปฏิทินหลังจากการนัดหมาย
        renderCalendar();
      } catch (error) {
        console.error('Error loading appointments:', error); // แสดงข้อความแจ้งข้อผิดพลาดใน console
      }
    };

    // ฟังก์ชัน `renderCalendar` สำหรับสร้างโครงสร้างปฏิทิน
    const renderCalendar = () => {
      // หาวันแรกของเดือนและจำนวนวันในเดือนนี้ ประกาศตัวแปรด้วย const การใช้.value ทำให้เราดึงค่าจริงได้ newdate ส่วนที่สร้างวันที่ใหม่เป็นวันแรกของเดือน
      const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay(); // พื่อดูว่าวันที่ 1 ของเดือนนั้นตรงกับวันอะไร (เช่น วันจันทร์, วันอังคาร)
      const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate(); // คำนวณวันสุดท้ายของเดือนว่ามีก่วัน โดยใช้การตั้งค่าเท่ากับ 0ในเดือนถัดไป  เพิ่มค่าเดือนขึ้น 1 เพราะการใช้เลข 0 ในวัน (0) จะทำให้ได้ วันสุดท้ายของเดือนก่อนหน้า
      
      days.value = []; //ให้ day กลายเป็นอาร์เรย์ว่างๆ เพื่อเริ่มสร้างข้อมูลปฏิทินใหม่

      // เพิ่มช่องว่างในปฏิทินจนถึงวันที่เริ่มต้นของเดือน
      for (let i = 0; i < firstDay; i++) {
        days.value.push({ date: '', appointments: [] }); //เพิ่ม { date: '', appointments: [] } ลงไปใน days ซึ่งแต่ละช่องว่างจะไม่มีข้อมูลวันที่ (date: '') และไม่มีการนัดหมาย (appointments: [])
      } //ให้ปฏิทินแสดงวันแรกของเดือนตรงกับวันในสัปดาห์ที่ถูกต้อง (เช่น วันที่ 1 ของเดือนเป็นวันอังคาร ช่องวันอาทิตย์และวันจันทร์จะเป็นช่องว่าง)

      // เพิ่มวันของเดือนลงในปฏิทิน
      for (let day = 1; day <= lastDate; day++) { //วนลูปตั้งแต่วันที่ 1 จนถึงวันสุดท้าย (lastDate) ของเดือน
        days.value.push({ date: day, appointments: [] }); // date: day คือวันที่ของวันนั้น appointments: [] คือการเตรียมช่องว่างสำหรับเก็บการนัดหมายในวันนั้น (ถ้ามี)
      }

      // appointment คือตัวแปรที่ใช้แทนข้อมูลของการนัดหมายแต่ละรายการใน appointments.value
      //ทุกครั้งที่ forEach วนลูปมาถึงการนัดหมายใหม่ ตัวแปร appointment ก็จะเป็นตัวแทนข้อมูลของการนัดหมายนั้นในรอบนั้นๆ

      appointments.value.forEach(appointment => {
        // แปลงวันที่ของการนัดหมายเพื่อให้สามารถเข้าถึงวัน เดือน และปีได้
        const appointmentDate = new Date(appointment.appointment_date);
        const date = appointmentDate.getDate(); // ได้วันที่ของการนัดหมาย
        const month = appointmentDate.getMonth();  // ได้เดือนของการนัดหมาย
        const year = appointmentDate.getFullYear(); // ได้ปีของการนัดหมาย
        
        // ตรวจสอบว่าการนัดหมายตรงกับเดือนและปีที่กำลังแสดงในปฏิทินหรือไม่
        if (month === currentMonth.value && year === currentYear.value) {
          const dayIndex = date + firstDay - 1; // หาตำแหน่งในปฏิทินที่ควรใส่การนัดหมาย
          
          // ตรวจสอบว่าช่องใน `days` มีอยู่จริงหรือไม่ แล้วเพิ่มการนัดหมายลงไป day.value แสดงแต่ละวันที่อยู่ในปฎิทิน
          if (days.value[dayIndex]) {
            days.value[dayIndex].appointments.push({ //เช็ค dayindex ถ้ามีจริง ใช้ .push เพื่อเพิ่มข้อมูลการนัดหมาย หากมีวันที่การนัดหมายอยู่แล้ว pushจะเพิ่มการนัดหมายใหม่เป็นลำดับต่อไป 
              appointment_time: appointment.appointment_time, // เวลาในการนัดหมาย ข้อมูลนี้ถูกเก็บอยู่ในฟิลด์ appointment_time ทำให้เวลาการนัดหมายของข้อมูลที่ดึงมาจากฐานข้อมูลถูกบันทึกไว้ในอาร์เรย์ appointments สำหรับวันนั้น ๆ
              note: appointment.note, // โน้ตของการนัดหมาย appointment.note คือข้อมูลที่มาจากฐานข้อมูล ซึ่งจะถูกเพิ่มลงใน appointments เพื่อใช้ในแสดง
              id_schedule: appointment.id_schedule // ไอดีของการนัดหมาย
            });
          }
        }
      });
    };

    // ฟังก์ชัน `changeMonth` สำหรับเปลี่ยนเดือนในปฏิทิน
    const changeMonth = (direction) => {
      currentMonth.value += direction; // เปลี่ยนค่า `currentMonth` ตามทิศทาง (+1 หรือ -1)
      
      // ตรวจสอบและจัดการกรณีที่เดือนเกินขอบเขต (น้อยกว่า 0 หรือมากกว่า 11)
      if (currentMonth.value < 0) {
        currentMonth.value = 11; // ถ้าเดือน < 0 ให้ตั้งค่าเป็นเดือนธันวาคม
        currentYear.value--; // ลดปีลง 1
      } else if (currentMonth.value > 11) {
        currentMonth.value = 0; // ถ้าเดือน > 11 ให้ตั้งค่าเป็นเดือนมกราคม
        currentYear.value++; // เพิ่มปีขึ้น 1
      }
      
      renderCalendar(); // เรียก `renderCalendar` เพื่ออัพเดทปฏิทิน
    };

    // ฟังก์ชัน `editAppointment` สำหรับแก้ไขการนัดหมาย
    const editAppointment = (dayIndex, appIndex) => {
      const day = days.value[dayIndex]; // เข้าถึงข้อมูลวันที่
      if (!day || !day.appointments[appIndex]) { // ถ้าวันหรือการนัดหมายไม่พบ
        selectedDate.value = `${currentYear.value}-${(currentMonth.value + 1).toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`;
        selectedTime.value = '';
        selectedName.value = '';
        isEditing.value = false; // ตั้งค่าโหมดแก้ไขเป็น false
        return;
      }

      const appointment = day.appointments[appIndex]; // เข้าถึงการนัดหมาย
      selectedDate.value = appointment.appointment_date; // ตั้งค่าการนัดหมายที่เลือก
      selectedTime.value = appointment.appointment_time;
      selectedName.value = appointment.note;

      isEditing.value = true; // ตั้งค่าโหมดแก้ไขเป็น true
      editingIndex.value = appointments.value.findIndex(a => a.id_schedule === appointment.id_schedule); // หาดัชนีของการนัดหมายใน `appointments`
    };

const handleSubmit = async () => {
  // กำหนดข้อมูลการนัดหมายใหม่
  const newAppointment = {
    appointment_date: selectedDate.value, // นำค่าของวันที่ที่ผู้ใช้เลือกมาใช้เป็นวันที่นัดหมาย
    appointment_time: selectedTime.value, // นำค่าของเวลาที่ผู้ใช้เลือกมาใช้เป็นเวลานัดหมาย
    status: 'available', // กำหนดสถานะเริ่มต้นเป็น 'available' เพื่อแสดงว่ายังว่างให้คนอื่นสามารถจองได้
    note: selectedName.value // เพิ่มข้อมูลเพิ่มเติมที่ผู้ใช้อาจระบุ เช่น ชื่อหรือรายละเอียด
  };

  try {
    // ถ้าอยู่ในโหมดแก้ไข (Check if in edit mode)
    if (isEditing.value) {
      await fetch(`http://localhost:8080/api/v1/schedule/${appointments.value[editingIndex.value].id_schedule}`, {
        method: 'PUT', // ใช้วิธี PUT สำหรับการอัพเดทข้อมูลในฐานข้อมูล
        headers: { 'Content-Type': 'application/json' }, // กำหนดหัวข้อเพื่อแจ้งว่าข้อมูลที่ส่งเป็น JSON
        body: JSON.stringify(newAppointment) // แปลงข้อมูลการนัดหมายใหม่เป็น JSON และส่งไปกับคำขอ
      });
      await loadAppointments(); // โหลดรายการนัดหมายใหม่เพื่ออัพเดทข้อมูลที่แสดงให้เป็นปัจจุบัน
      alert('Appointment updated successfully!'); // แสดงข้อความแจ้งเตือนเมื่อการอัพเดทสำเร็จ
    } else {
      // เพิ่มการนัดหมายใหม่ (Add new appointment)
      const response = await fetch('http://localhost:8080/api/v1/schedule', {
        method: 'POST', // ใช้วิธี POST สำหรับการเพิ่มข้อมูลใหม่ในฐานข้อมูล
        headers: { 'Content-Type': 'application/json' }, // กำหนดหัวข้อเพื่อแจ้งว่าข้อมูลที่ส่งเป็น JSON
        body: JSON.stringify(newAppointment) // แปลงข้อมูลการนัดหมายใหม่เป็น JSON และส่งไปกับคำขอ
      });
      const addedAppointment = await response.json(); // แปลงข้อมูลการตอบกลับจากเซิร์ฟเวอร์เป็น JSON
      appointments.value.push(addedAppointment); // เพิ่มนัดหมายใหม่ใน `appointments` เพื่ออัพเดทข้อมูลที่แสดง
      alert('Appointment added successfully!'); // แสดงข้อความแจ้งเตือนเมื่อการเพิ่มสำเร็จโดยใช้ฟังก์ชัน alert
    }
    resetForm(); // เรียก `resetForm` เพื่อล้างข้อมูลในฟอร์มหลังจากการส่งสำเร็จ
    renderCalendar(); // อัพเดทการแสดงผลของปฏิทินเพื่อแสดงข้อมูลล่าสุด
  } catch (error) {
    console.error('Error submitting appointment:', error); // แสดงข้อผิดพลาดหากเกิดปัญหาขณะส่งข้อมูล
  }
};


    // ฟังก์ชัน `deleteAppointment` สำหรับลบการนัดหมาย
    const deleteAppointment = async (dayIndex, appIndex) => {
      const appointment = days.value[dayIndex].appointments[appIndex]; // เข้าถึงการนัดหมายที่ต้องการลบ
      const id = appointment.id_schedule; // รับ `id_schedule` ของการนัดหมาย

      try {
        // ส่งคำขอแบบ DELETE ไปที่ API
        const response = await fetch(`http://localhost:8080/api/v1/schedule/${id}`, {
          method: 'DELETE', // ใช้วิธี DELETE สำหรับลบข้อมูล
        });

        if (!response.ok) throw new Error('Failed to delete appointment'); // ถ้าไม่สำเร็จให้โยน Error

        days.value[dayIndex].appointments.splice(appIndex, 1); // ลบการนัดหมายออกจากปฏิทิน
        alert('Appointment deleted successfully!'); // แจ้งเตือน
      } catch (error) {
        console.error('Error deleting appointment:', error); // แสดงข้อผิดพลาด
        alert('Error deleting appointment: ' + error.message); // แจ้งเตือนข้อผิดพลาด
      }
    };

    // ฟังก์ชัน `resetForm` สำหรับเคลียร์ค่าทั้งหมดในฟอร์ม
    const resetForm = () => {
      selectedDate.value = ''; // เคลียร์วันที่
      selectedTime.value = ''; // เคลียร์เวลา
      selectedName.value = ''; // เคลียร์โน้ต
      isEditing.value = false; // ตั้งค่าโหมดแก้ไขเป็น false
      editingIndex.value = -1; // ตั้งค่าดัชนีการแก้ไขเป็น -1
    };

    // ฟังก์ชัน `logout` สำหรับออกจากระบบ
    const logout = () => {
      localStorage.removeItem('isAdmin'); // ลบค่า `isAdmin` จาก localStorage
      window.location.href = '/login'; // เปลี่ยนเส้นทางไปยังหน้า login
    };

    loadAppointments(); // เรียก `loadAppointments` เมื่อเริ่มต้นคอมโพเนนต์

    // คืนค่าตัวแปรและฟังก์ชันทั้งหมดที่ต้องการให้ Vue ใช้งาน
    return {
      monthYear,
      days,
      changeMonth,
      selectedDate,  
      selectedTime,
      selectedName,
      handleSubmit,
      deleteAppointment,
      editAppointment,
      logout,
      isEditing,
      appointments,
      resetForm,
    };
  }
};
</script>

<style scoped>
.schedule-view {
  padding: 20px;
  color: #403B33; /* สีตัวอักษร */
  background-color: #F2EDE4; /* สีพื้นหลัง */
  border-radius: 10px;
}

/* ส่วนหัว */
.header-section {
  background: linear-gradient(to right, #D9C9BA, #A69485); /* กำหนดสีพื้นหลังแบบกราเดียนต์ */
  color: #403B33; /* สีตัวอักษร */
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

.nav-buttons {
  margin-bottom: 20px;
  text-align: center;
}

.nav-buttons button {
  background-color: #736151; /* ปุ่มก่อนหน้า/ถัดไป */
  color: #ffffff; /* สีตัวอักษร */
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
  transition: background-color 0.3s;
}

.nav-buttons button:hover {
  background-color: #A69485; /* เปลี่ยนสีเมื่อวางเมาส์ */
}

.calendar-section {
  padding: 20px;
  background-color: #ffffff; /* สีพื้นหลังของปฏิทิน */
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day {
  background-color: #D9C9BA; /* สีพื้นหลังของวัน */
  border: 1px solid #ccc; /* ขอบ */
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  cursor: pointer;
}

.day:hover {
  background-color: #C5A2A1; /* สีเมื่อวางเมาส์ */
}

.day-header {
  font-weight: bold;
  color: #403B33; /* สีตัวอักษร */
}

.admin-section {
  padding: 20px;
  background-color: #F9F9F9; /* สีพื้นหลังของส่วนผู้ดูแล */
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.appointment-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #403B33; /* สีตัวอักษร */
}

.form-group input {
  padding: 12px;
  border: 1px solid #ccc; /* ขอบของฟอร์ม */
  border-radius: 5px;
  width: 100%;
}

.submit-button {
  padding: 12px;
  background-color: #736151; /* สีปุ่มส่ง */
  color: #ffffff; /* สีตัวอักษร */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #A69485; /* สีเมื่อวางเมาส์ */
}

.cancel-button {
  padding: 12px;
  background-color: #e74c3c; /* สีปุ่มยกเลิก */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #c0392b; /* สีเมื่อวางเมาส์ */
}

.group-button-custom {
    display: flex;
    justify-content: center;
}
</style>
