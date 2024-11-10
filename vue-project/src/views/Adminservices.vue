<template>
  <div>
    <h2>Services History</h2>
    
    <input type="text" v-model="searchQuery" placeholder="Search services..." class="search-input" />
    
    <div class="status-buttons">
      <div class="status-container">
        <button 
          :class="['status-button', { selected: statusFilter === '' }]" 
          @click="statusFilter = ''"></button>
        <p>All: {{ statusCounts.all || 0 }}</p>
      </div>
      <div class="status-container">
        <button 
          :class="['status-button', { selected: statusFilter === 'completed' }]" 
          @click="statusFilter = 'completed'"></button>
        <p>Completed: {{ statusCounts.completed || 0 }}</p>
      </div>
      <div class="status-container">
        <button 
          :class="['status-button', { selected: statusFilter === 'pending' }]" 
          @click="statusFilter = 'pending'"></button>
        <p>Pending: {{ statusCounts.pending || 0 }}</p>
      </div>
      <div class="status-container">
        <button 
          :class="['status-button', { selected: statusFilter === 'canceled' }]" 
          @click="statusFilter = 'canceled'"></button>
        <p>Canceled: {{ statusCounts.canceled || 0 }}</p>
      </div>
    </div>

    
    <button @click="openCreateModal" class="btn-add">Add New Service History</button>

    <table v-if="filteredHistories.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>User ID</th>
          <th>User Name</th> <!-- เพิ่มคอลัมน์ User Name -->
          <th>Service Name</th>
          <th>Appointment Date</th>
          <th>Status</th>
          <th>Warranty End Date</th>
          <th>Amount Charged</th>
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="history in filteredHistories" :key="history.id">
          <td>{{ history.id }}</td>
          <td>{{ history.user_id }}</td>
          <td>{{ history.user_name }}</td> <!-- แสดง User Name -->
          <td>{{ history.service_name }}</td>
          <td>{{ new Date(history.appointment_date).toLocaleDateString() }}</td>
          <td>
            <span>{{ history.status }}</span>
          </td>
          <td>{{ new Date(history.warranty_end_date).toLocaleDateString() }}</td>
          <td>฿{{ history.amount_charged.toFixed(2) }}</td>
          <td>{{ history.location || 'N/A' }}</td>
          <td>
            <button @click="openEditModal(history)" class="btn-edit">Edit</button>
            <button @click="deleteServiceHistory(history.id)" class="btn-delete">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No service histories found.</p>

    <h3>Total Amount Charged: ฿{{ totalAmountCharged.toFixed(2) }}</h3>

    <canvas id="serviceChart" width="500" height="300"></canvas>

    <div v-if="isModalOpen" class="modal">
      <h3>{{ isEditMode ? 'Edit' : 'Add' }} Service History</h3>
      <form @submit.prevent="isEditMode ? updateServiceHistory() : createServiceHistory()" class="service-form">
        <label for="serviceId">Service ID:</label>
        <input type="text" v-model="currentHistory.id" placeholder="Service ID" readonly class="form-control" id="serviceId" />
        
        <label for="userId">User ID:</label>
        <input v-model="currentHistory.user_id" placeholder="User ID" required class="form-control" id="userId" />
        
        <label for="serviceName">Service Name:</label>
        <input v-model="currentHistory.service_name" placeholder="Service Name" required class="form-control" id="serviceName" />
        
        <label for="appointmentDate">Appointment Date:</label>
        <input type="date" v-model="currentHistory.appointment_date" required class="form-control" id="appointmentDate" />
        
        <label for="status">Status:</label>
        <select v-model="currentHistory.status" class="form-control" id="status">
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="canceled">Canceled</option>
        </select>
        
        <label for="location">Location:</label>
        <input v-model="currentHistory.location" placeholder="Location" required class="form-control" id="location" />
        
        <label for="warrantyEndDate">Warranty End Date:</label>
        <input type="date" v-model="currentHistory.warranty_end_date" class="form-control" id="warrantyEndDate" />
        
        <label for="amountCharged">Amount Charged:</label>
        <input v-model="currentHistory.amount_charged" placeholder="Amount Charged" required class="form-control" id="amountCharged" />
        
        <div class="form-actions">
          <button type="submit" class="btn-submit">{{ isEditMode ? 'Update' : 'Create' }}</button>
          <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>

    <div v-if="isSuccessPopupVisible" class="success-popup">
      <span class="success-icon">✔️</span>
      <p>{{ isEditMode ? 'Updated Successfully!' : 'Created Successfully!' }}</p>
      <button @click="isSuccessPopupVisible = false">Close</button>
    </div>
  </div>
</template>

<script>
// นำเข้า `ref`, `computed`, และ `onMounted` จาก Vue ซึ่งเป็นฟังก์ชันที่ใช้ใน Composition API
// `ref` ใช้สร้างตัวแปรที่สามารถเก็บค่าที่เปลี่ยนแปลงได้ (reactive state)
// `computed` ใช้สร้างตัวแปรที่คำนวณค่าจากตัวแปรอื่น ๆ และอัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลง
// `onMounted` เป็น lifecycle hook ที่จะถูกเรียกเมื่อ component ทำงานเสร็จแล้ว (mounted)
import { ref, computed, onMounted } from 'vue';

// นำเข้า Chart.js ซึ่งเป็นไลบรารีสำหรับการวาดกราฟ เพื่อใช้แสดงผลข้อมูลบริการในรูปแบบกราฟ
import Chart from 'chart.js/auto';

// เริ่มต้น component Vue
export default {
  name: 'AdminServices', // กำหนดชื่อ component ให้เป็น 'AdminServices' ซึ่งใช้ใน component tree

  setup() { // ฟังก์ชัน `setup` ของ Composition API ใช้กำหนดค่าตัวแปรและฟังก์ชันทั้งหมดที่ใช้ใน component
    // กำหนดตัวแปรแบบ reactive และตัวแปรที่เกี่ยวข้องกับสถานะต่าง ๆ ภายใน component

    const histories = ref([]);  // ตัวแปร `histories` ถูกกำหนดด้วย `ref` เพื่อเก็บข้อมูลประวัติการบริการ โดยเริ่มต้นเป็น array ว่าง
    const isModalOpen = ref(false); // ตัวแปร `isModalOpen` เป็น boolean ที่บอกว่า modal (หน้าต่างป๊อปอัป) เปิดอยู่หรือไม่ เริ่มต้นเป็น false
    const isEditMode = ref(false); // ตัวแปร `isEditMode` เป็น boolean ที่บอกว่าอยู่ในโหมดแก้ไข (edit mode) หรือไม่ เริ่มต้นเป็น false

    // กำหนดตัวแปร `currentHistory` เก็บข้อมูลของประวัติการบริการที่กำลังถูกสร้างหรือแก้ไข
    const currentHistory = ref({
      id: null, // `id` ของบริการ เริ่มต้นเป็น null (ยังไม่มีข้อมูล)
      user_id: '', // รหัสของผู้ใช้ (user_id) ที่เกี่ยวข้องกับบริการนี้
      service_name: '', // ชื่อบริการที่ผู้ใช้เลือก
      appointment_date: '', // วันที่นัดหมายที่ใช้บริการ
      status: 'completed', // สถานะของบริการ เช่น 'completed' หรือ 'canceled' เริ่มต้นเป็น 'completed'
      warranty_end_date: '', // วันที่ที่การรับประกันบริการจะหมดอายุ
      amount_charged: 0, // จำนวนเงินที่เรียกเก็บจากบริการ เริ่มต้นเป็น 0
      location: '' // สถานที่ให้บริการหรือรายละเอียดที่ตั้ง เริ่มต้นเป็นสตริงว่าง
    });

    const searchQuery = ref(''); // ตัวแปร `searchQuery` เก็บข้อความที่ใช้ค้นหาข้อมูลบริการ เริ่มต้นเป็นสตริงว่าง (ไม่มีการค้นหา)
    const statusFilter = ref(''); // ตัวแปร `statusFilter` เก็บสถานะที่ใช้กรองข้อมูล เช่น 'completed', 'canceled' เริ่มต้นเป็นค่าว่าง (แสดงทั้งหมด)
    const isSuccessPopupVisible = ref(false); // ตัวแปร `isSuccessPopupVisible` ใช้ตรวจสอบว่าป๊อปอัปแสดงผลความสำเร็จในการบันทึกจะแสดงหรือไม่ เริ่มต้นเป็น false

    // ฟังก์ชัน `fetchServiceHistories` ดึงข้อมูลประวัติการบริการจาก API
    const fetchServiceHistories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/service_history'); // เรียก API แบบ GET ไปที่ URL ของเซิร์ฟเวอร์เพื่อดึงข้อมูลประวัติการบริการ
        if (!response.ok) throw new Error('Failed to fetch service histories'); // หาก response ไม่สำเร็จ (response.ok เป็น false) ให้แสดงข้อความข้อผิดพลาด
        histories.value = await response.json(); // กำหนดค่าของ `histories` ด้วยข้อมูล JSON ที่ได้จาก response เพื่อใช้แสดงข้อมูลในหน้า
        drawChart(); // เรียกฟังก์ชัน `drawChart` เพื่อวาดกราฟหลังจากได้ข้อมูล
      } catch (error) {
        console.error('Error fetching service histories:', error); // แสดงข้อผิดพลาดใน console หากการดึงข้อมูลล้มเหลว
      }
    };

    // ฟังก์ชัน `drawChart` สร้างกราฟเพื่อแสดงข้อมูลค่าบริการต่อเดือนโดยใช้ Chart.js
    const drawChart = () => {
      // `monthlyTotals` จะเก็บยอดรวมค่าบริการในแต่ละเดือนที่ไม่ถูกยกเลิก (filtered data)
      const monthlyTotals = filteredHistories.value.reduce((acc, history) => {
        if (history.status !== 'canceled') { // ตรวจสอบสถานะบริการที่ไม่ใช่ `canceled`
          const date = new Date(history.appointment_date); // สร้างออบเจ็กต์ Date จากวันที่นัดหมาย
          const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // แปลงวันที่เป็นเดือนและปี เช่น "January 2024"

          if (!acc[monthYear]) { // ตรวจสอบว่าเดือนนั้นมีข้อมูลใน accumulator หรือยัง
            acc[monthYear] = 0; // ถ้าไม่มี กำหนดค่าเริ่มต้นเป็น 0
          }
          acc[monthYear] += history.amount_charged; // เพิ่มยอดค่าบริการของเดือนนั้น ๆ เข้าไปใน accumulator
        }
        return acc; // ส่งคืนค่า accumulator
      }, {}); // กำหนดค่าเริ่มต้นของ accumulator เป็นออบเจ็กต์ว่าง

      const labels = Object.keys(monthlyTotals); // สร้าง array ของชื่อเดือนจาก key ของ `monthlyTotals` สำหรับ label ในแกน X ของกราฟ
      const dataValues = Object.values(monthlyTotals); // สร้าง array ของยอดค่าบริการจาก value ของ `monthlyTotals` สำหรับข้อมูลกราฟ

      const chartData = { // ข้อมูลที่จะใช้ในการสร้างกราฟ
        labels: labels, // กำหนดชื่อของแต่ละเดือนให้แสดงบนแกน X
        datasets: [{
          label: 'Amount Charged (บาท)', // ชื่อของชุดข้อมูลในกราฟ
          data: dataValues, // ค่าข้อมูลในกราฟแสดงยอดค่าบริการแต่ละเดือน
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // สีพื้นหลังของแถบกราฟ
          borderColor: 'rgba(75, 192, 192, 1)', // สีของเส้นขอบกราฟ
          borderWidth: 1 // ความหนาของเส้นขอบ
        }]
      };

      const ctx = document.getElementById('serviceChart').getContext('2d'); // สร้าง context ของ canvas สำหรับใช้วาดกราฟ โดยอ้างอิงจาก id `serviceChart`

      if (Chart.getChart('serviceChart')) { // ตรวจสอบว่ามีกราฟเดิมอยู่หรือไม่ หากมีจะทำลาย (destroy) ก่อนเพื่อเตรียมสร้างใหม่
        Chart.getChart('serviceChart').destroy();
      }

      // ใช้ Chart.js สร้างกราฟแบบเส้น (line chart) โดยใช้ข้อมูล `chartData` และกำหนดการตั้งค่าเพิ่มเติม
      new Chart(ctx, {
        type: 'line', // ประเภทกราฟคือ line chart
        data: chartData, // ข้อมูลของกราฟ
        options: {
          responsive: true, // กราฟสามารถปรับขนาดได้ตามหน้าจอ
          scales: { // การตั้งค่าแกน X และ Y
            x: {
              title: {
                display: true, // แสดงชื่อแกน X
                text: 'เดือน' // กำหนดข้อความของแกน X เป็น 'เดือน'
              }
            },
            y: {
              beginAtZero: true, // แกน Y เริ่มจากค่า 0
              title: {
                display: true, // แสดงชื่อแกน Y
                text: 'บาท' // กำหนดข้อความของแกน Y เป็น 'บาท'
              }
            }
          }
        }
      });
    };

    // `statusCounts` เป็น computed property ใช้คำนวณจำนวนของแต่ละสถานะ เช่น completed และ canceled โดยจะอัปเดตอัตโนมัติเมื่อ `histories` เปลี่ยนแปลง
    const statusCounts = computed(() => {
      return histories.value.reduce((counts, history) => {
        counts[history.status] = (counts[history.status] || 0) + 1; // นับจำนวนของแต่ละสถานะ โดยเพิ่มค่า 1 ในแต่ละครั้งที่พบสถานะเดียวกัน
        counts.all = (counts.all || 0) + 1; // นับจำนวนทั้งหมดของบริการ
        return counts; // ส่งคืนค่า accumulator ที่เก็บการนับของแต่ละสถานะ
      }, {}); // ค่าเริ่มต้นเป็นออบเจ็กต์ว่าง
    });

    // `filteredHistories` เป็น computed property ที่กรองข้อมูลบริการตามเงื่อนไข เช่นสถานะและคำค้นหา
    const filteredHistories = computed(() => {
      return histories.value.filter(history => { // ใช้ filter เพื่อกรองรายการ
        const statusMatch = statusFilter.value ? history.status === statusFilter.value : true; // ตรวจสอบว่าตรงกับสถานะที่เลือกใน `statusFilter` หรือไม่

        // ค้นหาข้อมูลโดยตรงจากชื่อผู้ใช้ หรือชื่อบริการ หรือวันที่ที่ใช้บริการ
        const userNameMatch = !searchQuery.value || //ตัวแปร userNameMatch ถูกสร้างขึ้นเพื่อเก็บผลลัพธ์ว่า ชื่อผู้ใช้ตรงกับคำค้นหามั้ย
          `${history.user_accounts.First_name} ${history.user_accounts.Last_name}`.toLowerCase().includes(searchQuery.value.toLowerCase()); // ตรวจสอบว่าคำค้นหาตรงกับชื่อผู้ใช้
        
        /**
         * -----!searchQuery.value หมายถึง ถ้า searchQuery.value เป็นค่าว่าง (ไม่มีการใส่คำค้นหา) 
                จะให้ userNameMatch เป็น true ทันที ซึ่งหมายความว่า ถ้าไม่มีคำค้นหา ก็ให้แสดงชื่อผู้ใช้ทั้งหมด
                ถ้า !searchQuery.value เป็น true (ไม่มีคำค้นหา) หรือ คำค้นหาตรงกับชื่อผู้ใช้ (userNameMatch) 
                หรือชื่อบริการ หรือวันที่นัดหมาย ผลลัพธ์จะเป็น true และรายการนี้จะตรงกับเงื่อนไขการค้นหา


           ----เครื่องหมาย ! คือไม่ใช่หรือ Notใช้เพื่อกลับค่าจาก true เป็น false และจาก false เป็น true

           ----toLowerCase() เป็นฟังก์ชันที่ใช้เพื่อแปลงสตริงให้เป็น ตัวพิมพ์เล็ก ทั้งหมด
           ----includes() เป็นฟังก์ชันที่ใช้เพื่อ ตรวจสอบว่าสตริงมีคำหรือข้อความที่กำหนดหรือไม่ ถ้าพบข้อความที่ค้นหา จะคืนค่าเป็น true ถ้าไม่พบจะคืนค่าเป็น false
         */
        const searchMatch = userNameMatch ||  
          history.service_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          new Date(history.appointment_date).toLocaleDateString().includes(searchQuery.value); // ค้นหาจากชื่อบริการหรือวันที่

        return statusMatch && searchMatch; // คืนค่าผลลัพธ์ที่ตรงกับการค้นหาและสถานะที่เลือก
      });
    });

    //ฟังก์ชันนี้จะตั้งค่าข้อมูลเริ่มต้นของ currentHistory สำหรับการสร้างบริการใหม่ และเปิด modal พร้อมทั้งตั้งค่า isEditMode ให้เป็น false เพื่อระบุว่าเราอยู่ในโหมดสร้าง ไม่ใช่โหมดแก้ไข
    const openCreateModal = () => {
      currentHistory.value = { // ตั้งค่า default ข้อมูลใหม่ใน `currentHistory`
        id: null, 
        user_id: '',
        service_name: '',
        appointment_date: '',
        status: 'completed',
        warranty_end_date: '',
        amount_charged: 0,
        location: ''
      };
      isEditMode.value = false; // เปลี่ยนโหมดเป็นสร้างใหม่ (ไม่ใช่แก้ไข)
      isModalOpen.value = true; // เปิด modal
    };

    // ฟังก์ชัน `openEditModal` เปิด modal พร้อมข้อมูลของบริการที่เลือกเพื่อแก้ไข
    const openEditModal = (history) => {
      currentHistory.value = { 
        ...history, // ใช้ข้อมูลจาก `history` ที่เลือก
        appointment_date: history.appointment_date ? new Date(history.appointment_date).toISOString().split('T')[0] : '', // แปลงวันที่ให้อยู่ในรูปแบบที่ใช้ได้ใน input field
        warranty_end_date: history.warranty_end_date ? new Date(history.warranty_end_date).toISOString().split('T')[0] : '' // แปลงวันที่ให้ถูกต้อง
      };
      isEditMode.value = true; // ตั้งค่าเป็นโหมดแก้ไข
      isModalOpen.value = true; // เปิด modal
    };

    const closeModal = () => {
      isModalOpen.value = false; // ปิด modal
    };

    // ฟังก์ชัน `createServiceHistory` ใช้สำหรับสร้างประวัติการบริการใหม่ โดยส่งข้อมูลไปที่ API
    const createServiceHistory = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/service_history', { // เรียก API  POST เพื่อสร้างข้อมูลใหม่
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // กำหนด Content-Type เป็นชื่อของ HTTP header ที่ใช้ระบุประเภทของข้อมูลที่เรากำลังส่งไปกับคำขอ
          },
          body: JSON.stringify(currentHistory.value), // ส่งข้อมูล JSON ของ `currentHistory`
        });
        if (!response.ok) throw new Error('Failed to create service history'); // ตรวจสอบว่าคำขอสำเร็จหรือไม่
        await fetchServiceHistories(); // ดึงข้อมูลใหม่หลังจากสร้างข้อมูลสำเร็จ
        closeModal(); // ปิด modal
        isSuccessPopupVisible.value = true; // แสดง popup ความสำเร็จ
      } catch (error) {
        console.error('Error creating service history:', error); // แสดง error ใน console หากเกิดข้อผิดพลาด
      }
    };

    // ฟังก์ชัน `updateServiceHistory` ใช้สำหรับอัปเดตประวัติบริการที่เลือก โดยส่งข้อมูลไปที่ API
    const updateServiceHistory = async () => {
      try {
        if (!currentHistory.value.id) {
          throw new Error('Service ID is not defined'); // ตรวจสอบว่ามี id ของประวัติหรือไม่
        }
        const response = await fetch(`http://localhost:8080/api/v1/service_history/${currentHistory.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentHistory.value), // ส่งข้อมูล JSON ที่อัปเดตไปที่ API
        });
        if (!response.ok) throw new Error('Failed to update service history');
        await fetchServiceHistories(); // ดึงข้อมูลใหม่หลังจากอัปเดตสำเร็จ
        closeModal(); // ปิด modal
        isSuccessPopupVisible.value = true; // แสดง popup ความสำเร็จ
      } catch (error) {
        console.error('Error updating service history:', error); // ข้อผิดพลาดเมื่ออัปเดตล้มเหลว
      }
    };

    // ฟังก์ชัน `deleteServiceHistory` ใช้สำหรับลบประวัติบริการที่เลือก
    const deleteServiceHistory = async (id) => {
      const confirmed = confirm("คุณแน่ใจว่าต้องการลบบริการประวัตินี้?"); // แสดงข้อความยืนยันก่อนลบ
      if (!confirmed) return;

      try {
        const response = await fetch(`http://localhost:8080/api/v1/service_history/${id}`, { // เรียก API ด้วย method DELETE
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete service history');
        await fetchServiceHistories(); // ดึงข้อมูลใหม่หลังจากลบสำเร็จ
      } catch (error) {
        console.error('Error deleting service history:', error);
      }
    };

    // `totalAmountCharged` เป็น computed property ที่คำนวณยอดรวมของค่าบริการทั้งหมด โดยไม่นับบริการที่ถูกยกเลิก
    const totalAmountCharged = computed(() => {
      return filteredHistories.value.reduce((total, history) => {
        if (history.status !== 'canceled') { // ถ้า สถานะไม่ใช่ canceled จะเพิ่มค่า history.amount_charged เข้าไปใน total ถ้าบริการนี้ถูกยกเลิกเป็น "canceled" จะไม่เพิ่มจำนวนเงินของบริการนั้นในยอดรวม
          return total + history.amount_charged;
        }
        return total;
      }, 0);
    });
    /**
     !== คือ เครื่องหมายเปรียบเทียบความไม่เท่ากันตรวจสอบทั้ง "ค่า" และ "ชนิดของข้อมูล" ว่าตรงกันมั้ย ถ้าไม่ตรงเป็น true ตรงเป็น false
     */

    onMounted(fetchServiceHistories); // เรียกใช้ `fetchServiceHistories` เมื่อ component นี้ mount ครั้งแรก เพื่อดึงข้อมูล

    // คืนค่าตัวแปรและฟังก์ชันที่ถูกประกาศทั้งหมดให้สามารถใช้งานใน template ของ component ได้
    return {
      histories,
      isModalOpen,
      isEditMode,
      currentHistory,
      fetchServiceHistories,
      openCreateModal,
      openEditModal,
      closeModal,
      createServiceHistory,
      updateServiceHistory,
      deleteServiceHistory,
      totalAmountCharged,
      searchQuery,
      statusFilter,
      filteredHistories,
      isSuccessPopupVisible,
      statusCounts,
    };
  },
};
</script>

<style scoped>

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #736151;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #A69485;
  color: #F2EDE4;
}

td {
  background-color: #D9C9BA;
}

.search-input {
  padding: 10px;
  margin-bottom: 20px; /* เพิ่มระยะห่างด้านล่าง */
  border: 1px solid #736151;
  border-radius: 5px;
  font-size: 16px;
  width: 100%; /* ทำให้ฟิลด์ค้นหากว้างเต็มพื้นที่ */
}

.status-buttons {
  display: flex;
  justify-content: space-around; /* จัดปุ่มให้ห่างกัน */
  margin-bottom: 20px; /* เพิ่มระยะห่างด้านล่าง */
}

.status-container {
  display: flex;
  flex-direction: column; /* ให้เป็นคอลัมน์ */
  align-items: center; /* จัดตำแหน่งอยู่ตรงกลาง */
}

.status-button {
  background-color: #D9C9BA;
  border: none;
  border-radius: 50%; /* ทำให้ปุ่มกลม */
  width: 40px; /* ขนาดของปุ่ม */
  height: 40px; /* ขนาดของปุ่ม */
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 5px; /* เพิ่มระยะห่างระหว่างปุ่มกับข้อความ */
}

.status-button:hover {
  background-color: #C5B3A1; /* เปลี่ยนสีเมื่อโฮเวอร์ */
}

.status-button.selected {
  background-color: #736151; /* สีเมื่อเลือก */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  border-radius: 10px;
  width: 700px; /* กำหนดความกว้าง */
}

.service-form {
  display: flex;
  flex-direction: column;
}

.form-control {
  padding: 5px;
  margin: 8px 0; /* เพิ่มระยะห่างระหว่างฟิลด์ */
  border: 1px solid #736151;
  border-radius: 5px; /* เพิ่มมุมโค้ง */
  font-size: 14px;
}

.form-control:focus {
  border-color: #A69485; /* เปลี่ยนสีกรอบเมื่อโฟกัส */
  outline: none; /* ไม่ให้มีเส้นขอบ */
}

.form-actions {
  display: flex;
  justify-content: space-between; /* จัดเรียงปุ่มให้อยู่ที่สองด้าน */
}

.btn-add {
  background-color: #4CAF50; /* สีเขียว */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 20px; /* เพิ่มระยะห่างด้านล่าง */
}

.btn-add:hover {
  background-color: #45a049; /* สีเขียวเข้มเมื่อโฮเวอร์ */
}

.btn-edit {
  background-color: #FFA500; /* สีส้ม */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-edit:hover {
  background-color: #e59400; /* สีส้มเข้มเมื่อโฮเวอร์ */
}

.btn-delete {
  background-color: #f44336; /* สีแดง */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-delete:hover {
  background-color: #c62828; /* สีแดงเข้มเมื่อโฮเวอร์ */
}

.success-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  border-radius: 10px;
  text-align: center;
}

.success-icon {
  font-size: 40px; /* ขนาดของเครื่องหมายถูก */
  color: green; /* สีของเครื่องหมายถูก */
}

.success-popup button {
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #736151;
  color: white;
  cursor: pointer;
}

.success-popup button:hover {
  background-color: #A69485; /* เปลี่ยนสีเมื่อโฮเวอร์ */
}

canvas {
  display: block; /* ทำให้แสดงเป็นบล็อก */
  margin: 20px auto; /* ตั้งระยะห่างด้านบนและล่าง 20px และกลางซ้ายขวา */
  width: 100%; /* ทำให้กราฟมีความกว้างเต็มพื้นที่ */
  max-width: 800px; /* จำกัดความกว้างสูงสุด */
  max-height: 400px; /* จำกัดความสูงสูงสุด */
}
</style>
