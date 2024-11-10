<template>
  <q-toolbar>
    <ul class="admin-menu">
      <li><router-link to="/admindashboard"><q-btn flat label="MANAGE SCHEDULE" class="menu-button" /></router-link></li>
      <li><router-link to="/admin/settings"><q-btn flat label="MANAGE PROJECT" class="menu-button" /></router-link></li>
      <li><router-link to="/adminuser"><q-btn flat label="MEMBER" class="menu-button" /></router-link></li>
      <li><router-link to="/adminreviews"><q-btn flat label="REVIEWS" class="menu-button" /></router-link></li>
      <li><router-link to="/adminservices"><q-btn flat label="SERVICES" class="menu-button" /></router-link></li>
       <li><router-link to="/chatcomponent"><q-btn flat label="MESSENGE" class="menu-button" /></router-link></li>
      <!-- <li v-if="isAdmin"><router-link to="/chatcomponent"><q-btn flat label="MESSENGE" class="menu-button" /></router-link></li>
    -->
    </ul>
  </q-toolbar>
</template>

<script>
export default {
  name: 'AdminNavbar',
  props: {
    isAdmin: {
      type: Boolean,
      required: true,  // กำหนดให้ต้องมีการส่งค่า
    }
  },
  mounted() {
    // ตรวจสอบว่าค่า isAdmin ถูกส่งมาหรือไม่
    console.log('isAdmin in AdminNavbar:', this.isAdmin);
  }
}
</script>

<style scoped>
.admin-menu {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-menu li {
  margin-right: 15px;
}

.menu-button {
  color: #5a4a3a; /* เปลี่ยนสีข้อความที่นี่ */
}

.menu-button:hover {
  color: #7957358f; /* สีเปลี่ยนเมื่อเลื่อนเมาส์ไปบนปุ่ม */
}
</style>
