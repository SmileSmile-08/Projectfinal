<template>
  <div>
    <!-- Projects Section -->
    <div class="projects-container">
      <!-- หัวข้อส่วนโปรเจกต์ -->
      <h2 class="title">Our Projects</h2>

      <!-- ส่วนที่แสดงการ์ดโปรเจกต์ทั้งหมด -->
      <div class="project-cards">
        <!-- วนลูปเพื่อแสดงการ์ดโปรเจกต์แต่ละอันใน `projects` -->
        <div v-for="project in projects" :key="project.id_projects" class="project-card">
          <!-- แสดงรูปภาพของโปรเจกต์โดยอิงจาก URL ที่ได้จาก API -->
          <img :src="`http://localhost:8080${project.image_url}`" :alt="project.title" @error="imageError($event)" />
          <div class="project-info">
            <h3>{{ project.title }}</h3> <!-- แสดงชื่อโปรเจกต์ -->
            <p>{{ project.description }}</p> <!-- แสดงคำอธิบายโปรเจกต์ -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // กำหนดชื่อ component ว่า "ProjectsView"
  name: "ProjectsView",
  
  data() { // ใช้ฟังก์ชัน data สำหรับการสร้างตัวแปรที่เป็น reactive
    return {
      projects: [] // ตัวแปร `projects` เก็บข้อมูลโปรเจกต์ที่ดึงจาก API
    };
  },

  created() { // lifecycle hook `created` ถูกเรียกเมื่อ component ถูกสร้าง
    // เรียกใช้ฟังก์ชัน `fetchProjects` เพื่อดึงข้อมูลโปรเจกต์จาก API เมื่อ component ถูกสร้าง
    this.fetchProjects();
  },

  methods: { // กำหนด methods ที่ใช้ใน component นี้
    // ฟังก์ชัน `fetchProjects` ใช้สำหรับดึงข้อมูลโปรเจกต์จาก API
    async fetchProjects() {
      try {
        // เรียกใช้ API โดยใช้ fetch และรอการตอบกลับจาก server
        const response = await fetch('http://localhost:8080/api/v1/projects');

        // แปลง response ที่ได้จาก server ให้เป็น JSON และเก็บไว้ในตัวแปร `data`
        const data = await response.json();
        console.log(data);  // ตรวจสอบข้อมูลที่ได้จาก API โดยแสดงใน console
        
        // กำหนดค่าของ `projects` ให้เป็นข้อมูลโปรเจกต์ที่ดึงมา
        this.projects = data;
      } catch (error) {
        // แสดงข้อความ error ใน console หากเกิดข้อผิดพลาดในการดึงข้อมูล
        console.error('Error fetching projects:', error);
      }
    },

    // ฟังก์ชัน `imageError` ใช้จัดการกรณีที่รูปภาพไม่สามารถโหลดได้
    imageError(event) {
      // เปลี่ยน URL ของรูปภาพเป็นภาพแทนที่ (placeholder) หากไม่สามารถโหลดรูปจริงได้
      event.target.src = '/path/to/placeholder-image.jpg';
    }
  }
};
</script>


<style scoped>
/* Projects Section */
.projects-container {
  padding: 40px;
  text-align: center;
  background: #F2EDE4; /* ใช้สีพื้นหลังอ่อน */
}

.title {
  font-size: 32px;
  margin-bottom: 30px;
  color: #403B33; /* ใช้สีข้อความหลักเข้ม */
  font-weight: bold;
  text-transform: uppercase;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* ปรับให้ใช้ grid layout */
  gap: 30px; /* ช่องว่างระหว่างการ์ด */
}

.project-card {
  background: #736151; /* สีพื้นหลังของการ์ด */
  border: 2px solid #D9C9BA; /* กรอบสีรอง */
  border-radius: 10px;
  box-shadow: 0px 4px 20px rgba(217, 187, 169, 0.5); /* เงาสีของข้อความรอง */
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  position: relative;
}

.project-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(166, 148, 133, 0.1), transparent); /* ใช้โทนสีรอง */
  transition: all 0.5s;
}

.project-card:hover::before {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.project-card:hover {
  transform: scale(1.08);
  box-shadow: 0px 8px 30px rgba(166, 148, 133, 0.8); /* เงาเข้มขึ้นเมื่อ hover */
}

.project-card img {
  width: 100%;
  height: 600px; /* คงขนาดภาพแนวตั้ง */
  object-fit: cover; /* ให้ภาพเต็มพื้นที่โดยไม่บิดเบือน */
  border-bottom: 4px solid #A69485; /* เส้นแบ่งสีเข้ม */
}

.project-info {
  padding: 15px;
}

.project-info h3 {
  font-size: 20px;
  font-family: 'Playfair Display', serif; /* ใช้ฟอนต์ serif เพิ่มความหรู */
  margin: 10px 0;
  color: #A69485; /* ข้อความสีรอง */
}

.project-info p {
  color: #D9C9BA; /* ข้อความสีรองใน About Us section */
  font-size: 14px;
}

/* Footer Section */
footer {
  text-align: center;
  padding: 15px;
  background-color: #403B33; /* พื้นหลังเข้ม */
  color: #F2EDE4; /* ข้อความสีหลัก */
  width: 100%;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .project-card {
    width: 100%; /* จัดให้การ์ดใช้ความกว้างเต็มพื้นที่ในจอเล็ก */
  }
}
</style>
