<template>
  <div id="app">
    <!-- ส่วนโครงสร้างหลักของแอปพลิเคชัน -->
    <q-layout view="hHh lpR fFf">
      <!-- ส่วน header ของแอปพลิเคชัน -->
      <header>
        <q-toolbar>
          <!-- ปุ่มเมนูสำหรับนำทางไปยังหน้าเพจต่าง ๆ -->
          <q-btn flat label="Home" @click="$router.push('/')" />
          <q-btn flat label="Projects" @click="$router.push('/projects')" />
          <q-btn flat label="Services" @click="$router.push('/services')" />
          <q-btn flat label="Reviews" @click="$router.push('/reviews')" />
          <q-btn flat label="Contact" @click="$router.push('/contact')" />
          <q-btn flat label="Schedule" @click="$router.push('/schedule')" />
          <q-btn flat label="Profile" @click="$router.push('/profile')" />
          <q-btn flat label="User Chat" @click="$router.push('/userchatcomponent')" />

          <!-- แสดงสถานะการล็อกอิน -->
          <div class="login-status">
            <!-- ถ้าผู้ใช้ล็อกอินแล้ว แสดงชื่อผู้ใช้และปุ่ม Logout -->
            <template v-if="currentUser">
              <span>👤 {{ currentUser.username }}</span>
              <q-btn flat label="Logout" @click="logout" />
            </template>
            <!-- ถ้าผู้ใช้ยังไม่ล็อกอิน แสดงปุ่ม Login -->
            <template v-else>
              <q-btn flat label="Login" @click="$router.push('/login')" />
            </template>
          </div>
        </q-toolbar>
      </header>

      <!-- แสดง AdminNavbar ถ้าผู้ใช้เป็นแอดมิน -->
      <AdminNavbar v-if="isAdmin" :isAdmin="isAdmin" />

      <q-page-container>
        <!-- แสดง router-view สำหรับเนื้อหาของหน้าแต่ละหน้า -->
        <router-view :user_id="user_id" />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import AdminNavbar from './views/AdminNavbar.vue'; // นำเข้า component AdminNavbar
import { ref, watchEffect } from 'vue'; // นำเข้า ref และ watchEffect สำหรับจัดการ reactive data
import { useRouter } from 'vue-router'; // นำเข้า useRouter สำหรับการนำทางใน Vue Router

export default {
  components: {
    AdminNavbar // กำหนดให้ AdminNavbar เป็น component ย่อยใน component นี้
  },
  
  setup() {
    const currentUser = ref(null); // สร้างตัวแปร currentUser เก็บข้อมูลผู้ใช้ปัจจุบัน เริ่มต้นเป็น null
    const isAdmin = ref(false); // สร้างตัวแปร isAdmin ตรวจสอบสถานะแอดมิน เริ่มต้นเป็น false
    const user_id = ref(null); // สร้างตัวแปร user_id เก็บ id ของผู้ใช้ปัจจุบัน
    const router = useRouter(); // ใช้ useRouter สำหรับการนำทาง

    // ตรวจสอบข้อมูลผู้ใช้ใน localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
    watchEffect(() => {
      const user = JSON.parse(localStorage.getItem('currentUser')); // ดึงข้อมูลผู้ใช้จาก localStorage และแปลงเป็น JSON
      if (user) { // ถ้ามีข้อมูลผู้ใช้ใน localStorage
        currentUser.value = user; // ตั้งค่า currentUser ให้เท่ากับข้อมูลผู้ใช้
        user_id.value = String(user.user_id); // กำหนด user_id เป็น string
        isAdmin.value = user.isAdmin || user.email === 'admin@admin'; // ตรวจสอบว่าเป็นแอดมินจาก isAdmin หรือ email
        console.log('User ID in App.vue:', user_id.value); // แสดง user_id ใน console สำหรับตรวจสอบ
      } else {
        console.warn("No user data found in localStorage."); // แจ้งเตือนถ้าไม่มีข้อมูลผู้ใช้
      }
    });

    // ฟังก์ชันสำหรับการล็อกเอาท์
    const logout = () => {
      localStorage.removeItem('currentUser'); // ลบข้อมูลผู้ใช้จาก localStorage
      currentUser.value = null; // รีเซ็ต currentUser เป็น null
      user_id.value = null; // รีเซ็ต user_id เป็น null
      isAdmin.value = false; // รีเซ็ตสถานะแอดมินเป็น false
      router.push('/login'); // นำไปหน้าล็อกอิน
    };

    // คืนค่าตัวแปรและฟังก์ชันที่ใช้ใน template
    return {
      currentUser, // ส่งตัวแปร currentUser ไปใช้งานใน template
      isAdmin, // ส่งตัวแปร isAdmin ไปใช้งานใน template
      user_id, // ส่งตัวแปร user_id ไปใช้งานใน template
      logout // ส่งฟังก์ชัน logout ไปใช้งานใน template
    };
  }
};
</script>

<style scoped>
.login-status {
  margin-left: auto; /* จัดตำแหน่งให้ login status ไปทางขวาสุด */
}
.menu-button:hover {
  color: #5a4a3a; /* เปลี่ยนสีตัวหนังสือเมื่อ hover */
}
</style>
