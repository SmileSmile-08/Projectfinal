<template>
  <div class="admin-settings">
    <!-- สร้าง <header> ที่มีคลาส header-section สำหรับส่วนหัวของหน้า ซึ่งสามารถจัดสไตล์ให้ดูแตกต่างจากเนื้อหาหลัก -->
    <header class="header-section">
      <h1>Manage Projects</h1>
      <p>Effortlessly add, edit, and delete your projects.</p> <!--ให้ผู้ใช้เข้าใจว่าพวกเขาสามารถ เพิ่ม แก้ไข และลบ โปรเจกต์ได้ -->
    </header>

    <!-- ฟอร์มสำหรับเพิ่ม/แก้ไขโปรเจกต์ -->
    <form @submit.prevent="handleSubmit" class="project-form"> <!--submit การจัดการการส่งฟอร์ม เมื่อผู้ใช้กดส่งฟอร์ม จะเรียกฟังก์ชัน handleSubmitแทน-->
      <div class="form-group">
        <label for="title">Title:</label> <!--ป้ายกำกับ (label) สำหรับฟิลด์ชื่อโปรเจกต์-->
        <input type="text" id="title" v-model="formData.title" required /> <!--ฟิลด์ป้อนข้อมูลสำหรับชื่อโปรเจกต์ ใช้ v-model เพื่อเชื่อมโยงข้อมูลระหว่างฟอร์มและตัวแปร formData.title-->
      </div>  <!--formData ในที่นี้คือ ตัวแปรที่เก็บข้อมูลจากฟอร์ม ซึ่งประกอบด้วยข้อมูลที่ผู้ใช้กรอกในฟอร์ม -->

      <div class="form-group">
        <label for="description">Description:</label> <!--ช่องสำหรับกรอกข้อมูลคำอธิบาย มีไอดีที่ใช้ระบุว่าเป็นช่องของการอธิบาย -->
        <textarea id="description" v-model="formData.description" required></textarea>  <!--ใช้textarea เพื่อกรอกข้อความยาวๆ ใน description-->
      </div> 



      <div class="form-group"> <!--กลุ่มที่ใช้จัดรูปแบบฟิลด์สำหรับอัปโหลดรูปภาพ-->
        <label for="image_url">Image URL:</label>
        <input type="file" @change="handleFileUpload" accept="image/*" />
        <img v-if="previewImage" :src="previewImage" alt="Preview Image" class="preview-image" />
      </div>
      <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Add' }} Project</button>
    </form>



    <!-- รายการโปรเจกต์ -->
    <ul class="project-list">
      <li v-for="project in projects" :key="project.id_projects" class="project-item">
        <div class="project-info">
          <h2>{{ project.title }}</h2>
          <p>{{ project.description }}</p>
        </div>

        <!-- แสดงรูปภาพของโปรเจกต์ -->
        <img :src="`http://localhost:8080${project.image_url}`" alt="Project Image" class="project-image" />

        <!-- ปุ่มสำหรับแก้ไขและลบโปรเจกต์ -->
        <div class="project-actions">
          <button @click="editProject(project)" class="edit-button">Edit</button>
          <button @click="deleteProject(project.id_projects)" class="delete-button">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // นำเข้า `ref` สำหรับสร้างตัวแปร reactive และ `onMounted` สำหรับทำงานเมื่อคอมโพเนนต์ถูก mount

export default {
  name: 'AdminSetting', // กำหนดชื่อคอมโพเนนต์เป็น "AdminSetting"
  
  setup() { // ฟังก์ชันหลักที่ใช้สำหรับจัดการสถานะและการทำงานของคอมโพเนนต์
    
    // กำหนดตัวแปร `projects` เพื่อเก็บรายการโปรเจกต์ โดยตั้งค่าเริ่มต้นเป็นอาร์เรย์ว่าง
    const projects = ref([]);
    
    // กำหนดตัวแปร `formData` เพื่อเก็บข้อมูลจากฟอร์ม โดยมีฟิลด์ title, description, image_url
    const formData = ref({
      title: '', // กำหนดค่าเริ่มต้นของ title ให้เป็นสตริงว่าง
      description: '', // กำหนดค่าเริ่มต้นของ description ให้เป็นสตริงว่าง
      image_url: '', // กำหนดค่าเริ่มต้นของ image_url ให้เป็นสตริงว่าง
    });
    
    // กำหนดตัวแปร `previewImage` เพื่อเก็บ URL ของภาพตัวอย่างหลังจากอัปโหลดไฟล์ โดยเริ่มต้นเป็น null
    const previewImage = ref(null);
    
    // กำหนดตัวแปร `selectedFile` เพื่อเก็บไฟล์ที่เลือกเมื่อผู้ใช้ทำการอัปโหลด
    const selectedFile = ref(null);
    
    // กำหนดตัวแปร `isEditing` เป็น boolean เพื่อตรวจสอบว่าอยู่ในโหมดแก้ไขหรือไม่ โดยเริ่มต้นเป็น false
    const isEditing = ref(false);
    
    // กำหนดตัวแปร `currentProjectId` เพื่อเก็บ ID ของโปรเจกต์ที่กำลังแก้ไข โดยเริ่มต้นเป็น null
    const currentProjectId = ref(null);

    // ฟังก์ชัน `fetchProjects` ใช้สำหรับดึงข้อมูลโปรเจกต์ทั้งหมดจากเซิร์ฟเวอร์
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/projects'); // ส่งคำขอ GET ไปที่ API endpoint
        const data = await response.json(); // แปลงข้อมูลที่ตอบกลับเป็น JSON
        console.log("Fetched Projects: ", data); // แสดงข้อมูลที่ได้รับใน console
        projects.value = data; // เก็บข้อมูลโปรเจกต์ที่ได้ลงใน `projects`
      } catch (error) {
        console.error('Error fetching projects:', error); // แสดงข้อผิดพลาดใน console
      }
    };

    // ฟังก์ชัน `handleFileUpload` ใช้สำหรับจัดการไฟล์ที่ผู้ใช้อัปโหลด
    const handleFileUpload = (event) => {
      const file = event.target.files[0]; // เก็บไฟล์ที่ผู้ใช้เลือก
      selectedFile.value = file; // เก็บไฟล์ไว้ในตัวแปร `selectedFile`
      const reader = new FileReader(); // สร้าง `FileReader` สำหรับอ่านไฟล์
      reader.onload = (e) => {
        previewImage.value = e.target.result; // กำหนด `previewImage` เป็น URL ของภาพตัวอย่าง
      };
      reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL เพื่อแสดงเป็นภาพตัวอย่าง
    };
    //สร้างformdatatosend ใช้สำหรับส่งข้อมูลฟอร์ฒไปยังเซิร์ฟ สามารถส่งได้ทั้งตัวอักษรและไฟล์
    // ฟังก์ชัน `handleSubmit` ใช้สำหรับจัดการการส่งข้อมูลฟอร์ม ใช้ asyncเพื่อใช้awaitในการรอคำสั่งจากการเรียก apiได้
    //append ใช้เพิ่มข้อมูลผู้ใช้ที่กรอก ลงในฟอร์ม fromdata.valueเป็นค่าที่ผู้ใช้กรอกในฟอร์มสำหรับชื่อโปรเจกและคำอธิบาย
    const handleSubmit = async () => {
      const formDataToSend = new FormData(); // สร้าง `FormData` สำหรับส่งข้อมูลในรูปแบบ multipart
      formDataToSend.append('title', formData.value.title); // เพิ่ม title ลงใน `formDataToSend`
      formDataToSend.append('description', formData.value.description); // เพิ่ม description ลงใน `formDataToSend`
      
      if (selectedFile.value) { // ตรวจสอบว่ามีไฟล์ที่เลือกหรือไม่
        formDataToSend.append('image', selectedFile.value); // เพิ่มไฟล์ภาพลงใน `formDataToSend`โดยใช้ append ในชื่อ image
      }

      if (isEditing.value) { // ตรวจสอบว่ากำลังอยู่ในโหมดแก้ไขหรือไม่ถ้าเป็นtrueคือแก้โปรเจคเดิม แต่ถ้าไม่คือเพิ่มโปรเจคใหม่
        try {
          const response = await fetch(`http://localhost:8080/api/v1/projects/${currentProjectId.value}`, {
            method: 'PUT', // ใช้วิธี PUT เพื่ออัพเดทข้อมูลที่มีโปรเจคไอดีตรงกับcurrentprojectid
            body: formDataToSend, // ส่ง `formDataToSend` ไปที่เซิร์ฟเวอร์
          });
          const updatedProject = await response.json(); // แปลงข้อมูลที่ตอบกลับจากเซิฟเป็น JSONและเก็บไว้ในตัวแปร updatedproject
          
          // หาตำแหน่งของโปรเจกต์ที่ต้องการแก้ไขใน `projects` โดยใช้ `findIndex`
          const index = projects.value.findIndex((p) => p.id_projects === currentProjectId.value);
          
          projects.value[index] = updatedProject; // อัพเดทข้อมูลใน `projects`
          isEditing.value = false; // ตั้งค่า `isEditing` เป็น false ออกจากโหมดแก้ไข
          
          // รีเซ็ตค่า `formData` ให้กลับเป็นค่าเริ่มต้นหรือค่าว่าง
          formData.value = { title: '', description: '', image_url: '' };
          previewImage.value = null; // รีเซ็ต `previewImage` เป็น nullเพพื่อลบภาพตัวอย่าง
        } catch (error) {
          console.error('Error updating project:', error); // แสดงข้อผิดพลาดใน console
        }
      } else { // ถ้าไม่ใช่โหมดแก้ไข หมายถึงเป็นการเพิ่มโปรเจกต์ใหม่
        try {
          const response = await fetch('http://localhost:8080/api/v1/projects', {
            method: 'POST', // ใช้วิธี POST สำหรับเพิ่มข้อมูลใหม่ ระบุคำขอเป็นโพส เพื่อให้แจ้งว่าเป็นการสร้างข้อมูลใหม่
            body: formDataToSend, // ส่ง `formDataToSend` ไปที่เซิร์ฟเวอร์
          });
          const newProject = await response.json(); // แปลงข้อมูลที่ตอบกลับเป็น JSON
          
          projects.value.push(newProject); // เพิ่มโปรเจกต์ใหม่ลงใน `projects`
          
          // รีเซ็ตค่า `formData` ให้กลับเป็นค่าเริ่มต้น
          formData.value = { title: '', description: '', image_url: '' };
          previewImage.value = null; // รีเซ็ต `previewImage` เป็น null
        } catch (error) {
          console.error('Error adding project:', error); // แสดงข้อผิดพลาดใน console
        }
      }
    };

    // ฟังก์ชัน `deleteProject` สำหรับลบโปรเจกต์ โดยรับ `id` ของโปรเจกต์ที่ต้องการลบเป็นพารามิเตอร์
    const deleteProject = async (id) => {
      try {
        await fetch(`http://localhost:8080/api/v1/projects/${id}`, {
          method: 'DELETE', // ใช้วิธี DELETE เพื่อส่งคำขอไปที่เซิร์ฟเวอร์
        });
        
        // ลบโปรเจกต์ออกจาก `projects` โดยกรอง `projects` ที่ไม่ตรงกับ `id` ที่ต้องการลบ
        projects.value = projects.value.filter((p) => p.id_projects !== id);
      } catch (error) {
        console.error('Error deleting project:', error); // แสดงข้อผิดพลาดใน console
      }
    };

    // ฟังก์ชัน `editProject` ใช้สำหรับเปิดฟอร์มแก้ไขโปรเจกต์ โดยรับโปรเจกต์ที่ต้องการแก้ไขเป็นพารามิเตอร์
    const editProject = (project) => {
      formData.value = { ...project }; // กำหนดค่า `formData` ด้วยข้อมูลของโปรเจกต์ที่ต้องการแก้ไข
      currentProjectId.value = project.id_projects; // เก็บ ID ของโปรเจกต์ที่กำลังแก้ไข
      isEditing.value = true; // ตั้งค่า `isEditing` เป็น true เพื่อเข้าโหมดแก้ไข
      previewImage.value = project.image_url; // ตั้งค่า `previewImage` ให้แสดงรูปปัจจุบัน
    };

    // ใช้ `onMounted` เพื่อเรียก `fetchProjects` เมื่อคอมโพเนนต์ถูก mount
    onMounted(() => {
      fetchProjects(); // โหลดโปรเจกต์เมื่อคอมโพเนนต์พร้อมใช้งาน
    });

    // คืนค่าตัวแปรและฟังก์ชันที่ต้องการให้ Vue ใช้งานใน template
    return {
      projects,
      formData,
      previewImage,
      isEditing,
      handleSubmit,
      deleteProject,
      editProject,
      handleFileUpload,
    };
  },
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

.admin-settings {
  width: 100vw; /* ตั้งค่าความกว้างเป็นเต็มหน้าจอ */
  margin: 0; /* ลบค่าขอบด้านบนและด้านล่าง */
  padding: 20px; /* เพิ่ม padding เพื่อความสวยงาม */
  background-color: #ffffff; /* สีพื้นหลัง */
  border-radius: 10px; /* มุมมน */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* เงา */
}

.header-section {
  width: 100%; /* กำหนดความกว้างของส่วนหัวให้เต็ม */
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
.project-form {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-weight: 500;
  display: block;
  margin-bottom: 10px;
  color: #555;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
textarea:focus {
  border-color: #007bff;
}

textarea {
  height: 100px;
  resize: vertical;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.submit-button {
  background-color: #736151; /* ปุ่มเพิ่ม/แก้ไขโปรเจกต์ */
  color: white;
  font-weight: 500;
}

.submit-button:hover {
  background-color: #A69485; /* เปลี่ยนสีเมื่อวางเมาส์ */
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.project-item {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.project-info h2 {
  font-size: 1.5rem;
  color: #403B33; /* สีตัวอักษร */
  margin-bottom: 10px;
}

.project-info p {
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.project-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 20px;
}

.project-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.edit-button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
}

.edit-button:hover {
  background-color: #0056b3; /* เปลี่ยนสีเมื่อวางเมาส์ */
}

.delete-button {
  background-color: #dc3545;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
}

.delete-button:hover {
  background-color: #c82333; /* เปลี่ยนสีเมื่อวางเมาส์ */
}

.preview-image {
  max-width: 150px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>
