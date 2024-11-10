<template>
  <div class="container">
    <!-- หัวข้อส่วนของการเข้าสู่ระบบ -->
    <h2 class="title">Login</h2>

    <!-- ฟอร์มเข้าสู่ระบบ เมื่อกด submit จะเรียกใช้ฟังก์ชัน onLoginSubmit -->
    <form @submit.prevent="onLoginSubmit" class="login-form">
      <input type="email" v-model="loginEmail" placeholder="Email" required />
      <!-- ช่องกรอกอีเมล โดยใช้ `v-model` ผูกข้อมูลกับตัวแปร `loginEmail` -->
      
      <input type="password" v-model="loginPassword" placeholder="Password" required />
      <!-- ช่องกรอกรหัสผ่าน โดยใช้ `v-model` ผูกข้อมูลกับตัวแปร `loginPassword` -->
      
      <button type="submit">Login</button>
      <!-- ปุ่มสำหรับเข้าสู่ระบบ -->
    </form>
    
    <div class="form-footer">
      <!-- ข้อความลิงก์ไปที่หน้าสมัครสมาชิก ซึ่งเมื่อกดจะเรียกใช้ฟังก์ชัน showSignUp -->
      <p>Don't have an account? <a href="#" @click="showSignUp">Sign up</a></p>
    </div>

    <!-- ฟอร์มสมัครสมาชิก แสดงเมื่อ `isSignUpVisible` เป็นจริง -->
    <div v-if="isSignUpVisible" class="signup-form">
      <h2 class="title">Sign Up</h2>
      
      <form @submit.prevent="onSignUpSubmit" class="signup-form">
        <!-- ช่องกรอกชื่อผู้ใช้ ใช้ `v-model` ผูกข้อมูลกับตัวแปร `username` -->
        <input type="text" v-model="username" placeholder="Username" required />
        
        <!-- ช่องกรอกชื่อจริง ใช้ `v-model` ผูกข้อมูลกับตัวแปร `firstName` -->
        <input type="text" v-model="firstName" placeholder="First Name" required />
        
        <!-- ช่องกรอกนามสกุล ใช้ `v-model` ผูกข้อมูลกับตัวแปร `lastName` -->
        <input type="text" v-model="lastName" placeholder="Last Name" required />
        
        <!-- ช่องกรอกอีเมล ใช้ `v-model` ผูกข้อมูลกับตัวแปร `email` -->
        <input type="email" v-model="email" placeholder="Email" required />
        
        <!-- ช่องกรอกรหัสผ่าน ใช้ `v-model` ผูกข้อมูลกับตัวแปร `password` -->
        <input type="password" v-model="password" placeholder="Password" required />
        
        <!-- ตัวเลือกสำหรับกำหนดสิทธิ์การใช้งาน โดยมีค่าเป็น `user` หรือ `admin` -->
        <select v-model="role" required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <!-- ช่องกรอกโค้ดสำหรับแอดมิน จะแสดงเฉพาะเมื่อเลือก role เป็น "admin" -->
        <input
          v-if="role === 'admin'"
          type="text"
          v-model="adminToken"
          placeholder="Admin Token (สำหรับแอดมินเท่านั้น)"
          required
        />

        <!-- ปุ่มสำหรับส่งฟอร์มสมัครสมาชิก -->
        <button type="submit">Sign Up</button>
      </form>
    </div>

    <!-- แสดงข้อความ error เมื่อมีข้อผิดพลาด โดยข้อความจะถูกเก็บใน `errorMessage` -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'; // นำเข้า `ref` จาก Vue เพื่อสร้างตัวแปร reactive
import { useRouter } from 'vue-router'; // นำเข้า `useRouter` จาก Vue Router เพื่อใช้ในการเปลี่ยนเส้นทาง (route)

const loginEmail = ref(''); // ตัวแปรสำหรับเก็บอีเมลที่ใช้เข้าสู่ระบบ
const loginPassword = ref(''); // ตัวแปรสำหรับเก็บรหัสผ่านที่ใช้เข้าสู่ระบบ
const isSignUpVisible = ref(false); // ตัวแปรเพื่อควบคุมการแสดงฟอร์มสมัครสมาชิก
const errorMessage = ref(''); // ตัวแปรสำหรับเก็บข้อความข้อผิดพลาด

// ตัวแปรสำหรับฟอร์มสมัครสมาชิก
const username = ref(''); // ตัวแปรเก็บชื่อผู้ใช้
const firstName = ref(''); // ตัวแปรเก็บชื่อจริงของผู้ใช้
const lastName = ref(''); // ตัวแปรเก็บนามสกุลของผู้ใช้
const email = ref(''); // ตัวแปรเก็บอีเมลของผู้ใช้
const password = ref(''); // ตัวแปรเก็บรหัสผ่านของผู้ใช้
const role = ref('user'); // ตัวแปรเก็บสิทธิ์การใช้งาน ซึ่งมีค่าเริ่มต้นเป็น `user`
const adminToken = ref(''); // ตัวแปรเก็บโค้ดสำหรับแอดมิน (จะแสดงเมื่อเลือก role เป็น admin)

const router = useRouter(); // สร้างตัวแปร `router` เพื่อใช้ในการเปลี่ยนเส้นทาง

// ฟังก์ชันสำหรับแสดงฟอร์มสมัครสมาชิก
const showSignUp = () => {
  isSignUpVisible.value = !isSignUpVisible.value; // สลับค่าของ `isSignUpVisible` ระหว่าง true และ false
};

// ฟังก์ชันที่ทำงานเมื่อผู้ใช้เข้าสู่ระบบ
const onLoginSubmit = async () => {
  errorMessage.value = ''; // เคลียร์ข้อความ error ก่อนเริ่มดำเนินการ

  try {
    // ส่ง request เพื่อเข้าสู่ระบบ โดยเรียกใช้ API ที่ URL และส่งข้อมูลอีเมลและรหัสผ่าน
    const response = await fetch('http://localhost:8080/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value,
      }),
    });

    if (!response.ok) {
      throw new Error('Invalid email or password'); // หากการเข้าสู่ระบบล้มเหลว แสดง error
    }

    const data = await response.json(); // แปลงข้อมูล response ที่ได้จาก API เป็น JSON

    // เก็บข้อมูลผู้ใช้ใน localStorage เพื่อเก็บสถานะการล็อกอิน
    localStorage.setItem('currentUser', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      isAdmin: data.isAdmin,
    }));

    // หากผู้ใช้เป็น admin เปลี่ยนเส้นทางไปที่หน้าของแอดมิน มิฉะนั้นไปที่หน้าหลัก
    if (data.isAdmin) {
      router.push('/Admindashboard');
    } else {
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = error.message; // แสดงข้อความข้อผิดพลาดที่เกิดขึ้น
  }
};

// ฟังก์ชันที่ทำงานเมื่อผู้ใช้สมัครสมาชิก
const onSignUpSubmit = async () => {
  errorMessage.value = ''; // เคลียร์ข้อความ error ก่อนเริ่มดำเนินการ

  // ตรวจสอบว่า username เป็นภาษาอังกฤษเท่านั้น
  const usernamePattern = /^[A-Za-z0-9]+$/;
  if (!usernamePattern.test(username.value)) {
    errorMessage.value = 'Username ต้องเป็นภาษาอังกฤษเท่านั้น';
    return;
  }

  // ตรวจสอบรหัสผ่านว่ามีความยาวอย่างน้อย 5 ตัวอักษรและไม่มีภาษาไทย
  const passwordPattern = /^[A-Za-z0-9!@#$%^&*()_+]+$/;
  if (password.value.length < 5) {
    errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 5 ตัว';
    return;
  }
  if (!passwordPattern.test(password.value)) {
    errorMessage.value = 'รหัสผ่านต้องเป็นภาษาอังกฤษและไม่มีภาษาไทย';
    return;
  }

  // การตั้งค่าตัวเลือกของ request สำหรับการสมัครสมาชิก
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
      isAdmin: role.value === 'admin', // ตรวจสอบว่าผู้ใช้สมัครเป็น admin หรือไม่
      adminToken: role.value === 'admin' ? adminToken.value : undefined // ส่งโค้ด admin เฉพาะเมื่อสมัครเป็น admin
    }),
  };

  try {
    // ส่งข้อมูลสมัครสมาชิกไปยัง API
    const response = await fetch("http://localhost:8080/api/v1/user_accounts", requestOptions);
    if (!response.ok) {
      const errorData = await response.json(); // หากการสมัครไม่สำเร็จ ให้แปลงข้อมูล error เป็น JSON
      throw new Error(errorData.error || 'Network response was not ok'); // แสดงข้อความ error
    }
    const result = await response.json(); // แปลงข้อมูล response เป็น JSON
    alert(result.message); // แสดงข้อความสำเร็จที่ได้รับจาก API

    // หากสมัครสำเร็จให้ตั้งค่าข้อมูลล็อกอินเพื่อเข้าสู่ระบบทันที
    if (result.message === "User created successfully") {
      loginEmail.value = email.value; // ตั้งค่า `loginEmail` จาก email ที่สมัคร
      loginPassword.value = password.value; // ตั้งค่า `loginPassword` จาก password ที่สมัคร
      await onLoginSubmit(); // เข้าสู่ระบบโดยใช้ข้อมูลที่ตั้งค่าไว้
    }
  } catch (error) {
    errorMessage.value = "Error occurred during signup: " + error.message; // แสดงข้อความ error หากเกิดข้อผิดพลาดในการสมัคร
  }
};
</script>

<style scoped>
.container {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 100%;
  padding: 40px;
  box-sizing: border-box;
  text-align: center;
  margin: auto;
  margin-top: 80px;
}

.title {
  font-size: 32px;
  margin-bottom: 25px;
  color: #333;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-form,
.signup-form {
  display: flex;
  flex-direction: column;
}

.login-form input,
.signup-form input,
.signup-form select {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  color: #555;
  transition: border-color 0.3s;
}

.login-form input:focus,
.signup-form input:focus,
.signup-form select:focus {
  border-color: #111;
  outline: none;
}

.login-form button,
.signup-form button {
  padding: 15px;
  background-color: #111;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-form button:hover,
.signup-form button:hover {
  background-color: #333;
}

.form-footer {
  margin-top: 25px;
}

.form-footer p {
  font-size: 16px;
  color: #888;
}

.form-footer a {
  color: #111;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

.signup-form {
  margin-top: 25px;
}

.error-message {
  color: red;
  margin-top: 15px;
}
</style>
