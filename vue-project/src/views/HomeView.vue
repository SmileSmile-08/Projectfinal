<template>
  <div>
    <!-- Hero Section: ส่วนหัวของหน้าเพจ ใช้สำหรับแสดงข้อความต้อนรับหรือข้อความหลัก -->
    <section class="hero">
      <div class="container">
        <!-- ข้อความหลักของหน้าในรูปแบบตัวอักษรที่มีเอฟเฟกต์การแยกแต่ละตัวอักษรแสดงทีละตัว -->
        <h1>
          <span v-for="(char, index) in title" :key="index" class="animate-letter">{{ char }}</span>
        </h1>
        <!-- คำอธิบายเสริมเกี่ยวกับการบริการของเว็บไซต์ -->
        <p>Extend the life and beauty of your sanitary ware with our advanced coating technology.</p>
      </div>
    </section>

    <!-- Gallery Section: ส่วนแกลเลอรี แสดงรูปภาพตัวอย่างของงาน -->
    <section class="gallery-section">
      <div class="container">
        <!-- ใช้ grid แสดงรูปภาพแบบ 4 ช่อง โดยแต่ละภาพจะมี overlay แสดงชื่อและคุณสมบัติของ coating -->
        <div class="gallery-grid">
          <div class="gallery-item">
            <!-- รูปภาพที่ 1 พร้อม overlay แสดงข้อความ -->
            <img src="@/assets/h1.jpg" alt="Image 1" />
            <div class="overlay">
              <h3>High-Gloss Finish</h3>
              <p>Shiny / Easy to Clean</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="@/assets/h3.jpg" alt="Image 2" />
            <div class="overlay">
              <h3>Premium Coating</h3>
              <p>Durability / Protection</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="@/assets/h2.jpg" alt="Image 3" />
            <div class="overlay">
              <h3>Eco Coating</h3>
              <p>Sustainable / Safe Materials</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="@/assets/h4.jpg" alt="Image 4" />
            <div class="overlay">
              <h3>Scratch-Resistant</h3>
              <p>Protection / Long-lasting</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section: ส่วนขั้นตอนการให้บริการ แสดงในรูปแบบ timeline -->
    <section class="services">
      <div class="container">
        <!-- หัวข้อของขั้นตอนการให้บริการ -->
        <h2 class="section-title">Service Process</h2>
        <div class="timeline">
          <!-- วนลูปแสดงแต่ละขั้นตอนของการให้บริการใน timeline -->
          <div class="timeline-item" v-for="(step, index) in serviceSteps" :key="index">
            <!-- จุดกลมๆ ในแต่ละขั้นของ timeline -->
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <!-- หัวข้อและคำอธิบายสำหรับแต่ละขั้นตอนการบริการ -->
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
            <!-- เส้นเชื่อมระหว่างจุดใน timeline หากยังไม่ถึงขั้นตอนสุดท้าย -->
            <div v-if="index < serviceSteps.length - 1" class="timeline-line"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Us Section: ส่วนเกี่ยวกับเรา พร้อมรูปภาพและคำอธิบายบริการ -->
    <section class="about-us">
      <div class="about-container">
        <div class="about-text">
          <h2>Long-lasting Sanitary Ware Protection</h2>
          <!-- คำอธิบายเกี่ยวกับบริการเคลือบสีของบริษัท -->
          <p>
            Our premium sanitary ware coating service not only restores the beauty of your fixtures but also extends their lifespan, providing a durable and high-quality finish.
          </p>
          <p>
            With advanced coating techniques designed for a wide range of surfaces, we ensure a protective layer that guards against scratches, stains, and wear, keeping your sanitary ware looking pristine and glossy for years.
          </p>
          <!-- ปุ่มนำทางไปยังส่วนบริการ -->
          <a href="#services" class="btn">Get Started</a>
        </div>
        <div class="about-image">
          <!-- รูปภาพประกอบเกี่ยวกับบริการของบริษัท -->
          <img src="@/assets/about.jpg" alt="About us" />
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section: ส่วนเหตุผลที่ควรเลือกใช้บริการของเรา -->
    <section class="why-choose-us">
      <div class="container">
        <h2>Why Choose Us</h2>
        <div class="benefits">
          <!-- รายการประโยชน์ของการใช้บริการ -->
          <div class="benefit-item">
            <h3>Cost Saving</h3>
            <p>Coating sanitary ware helps save you money while keeping it looking fresh and durable for years to come.</p>
          </div>
          <div class="benefit-item">
            <h3>Eco-Friendly</h3>
            <p>Our process extends the lifespan of your products, reducing waste and environmental impact.</p>
          </div>
          <div class="benefit-item">
            <h3>2-Year Warranty</h3>
            <p>Our services come with a 2-year warranty, ensuring long-lasting protection for your sanitary ware.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  // ชื่อ component เป็น HomeView
  name: 'HomeView',
  data() {
    return {
      // ข้อความ title ของหน้า ถูกแยกเป็นตัวอักษรแต่ละตัวใน array เพื่อใช้แสดงผลแบบ letter-by-letter animation
      title: 'Sanitary Ware with Our Premium Coating'.split(''),
      
      // ข้อมูลขั้นตอนการให้บริการ แสดงเป็น timeline
      serviceSteps: [
        {
          title: "Step 1: Surface Preparation", // ชื่อของขั้นตอน
          description: "Cleaning will be done using products specifically designed for sanitary ware to ensure the surface is clean and ready." // คำอธิบายของขั้นตอน
        },
        {
          title: "Step 2: Surface Preparation Enhancement",
          description: "The surface is prepared to ensure the coating adheres well and increases the durability of the coating."
        },
        {
          title: "Step 3: Coating Application",
          description: "The coating used has scratch-resistant properties and is durable for heavy use, ensuring your sanitary ware always looks like new."
        },
        {
          title: "Step 4: Quality Inspection",
          description: "Our team will thoroughly check the quality of the coating, ensuring there are no air bubbles, scratches, or errors in the process."
        }
      ]
    };
  }
};
</script>


<style scoped>
/* General Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero {
  background-color: #736151;
  color: #F2EDE4;
  text-align: center;
  padding: 100px 20px;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}

.btn {
  background-color: #A69485;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
}

.btn:hover {
  background-color: #736151;
}

/* Gallery Section (4 Images) */
.gallery-section {
  padding: 40px 0;
  background-color: #403B33;
}

.gallery-grid {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.gallery-item {
  position: relative;
  flex: 1;
  overflow: hidden;
  max-width: 300px;
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #FFF;
  padding: 10px;
  text-align: center;
}

.overlay h3 {
  font-size: 15px;
  margin-bottom: 5px;
}

.overlay p {
  font-size: 10px;
}

/* Services Section */
.services {
  background-color: #403B33;
  padding: 60px 0;
  text-align: center;
}

.services h2, .services h3, .services p {
  color: #F2EDE4;
}

/* Timeline Layout */
.timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Timeline Item */
.timeline-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 40px;
  text-align: left;
  position: relative;
}

/* จุดกลมสำหรับแต่ละขั้นตอน */
.timeline-dot {
  flex: 0 0 20px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: #F2EDE4;
  margin-right: 20px;
}

/* ส่วนเนื้อหาของ timeline */
.timeline-content {
  flex: 1;
}

.timeline-content h3 {
  font-size: 24px;
  color: #F2EDE4;
  margin-bottom: 10px;
  font-weight: bold;
}

.timeline-content p {
  font-size: 16px;
  color: #D9C9BA;
}

/* เส้นเชื่อมระหว่างขั้นตอน */
.timeline-line {
  position: absolute;
  left: 30px;
  top: 100%;
  width: 2px;
  height: 40px;
  background-color: #F2EDE4;
}

.timeline-line:last-child {
  display: none;
}

/* About Us Section */
.about-us {
  background-color: #736151;
  padding: 80px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-container {
  display: flex;
  max-width: 1200px;
  width: 100%;
  gap: 20px;
  padding: 20px;
  justify-content: space-between;
  align-items: center;
}

.about-text {
  flex: 1;
  max-width: 50%;
  color: #F2EDE4;
}

.about-text h2 {
  font-size: 36px;
  margin-bottom: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.about-text p {
  font-size: 16px;
  margin-bottom: 20px;
  color: #D9C9BA;
  line-height: 1.6;
}

.about-text .btn {
  background-color: #A69485;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
}

.about-text .btn:hover {
  background-color: #736151;
}

.about-image {
  flex: 1;
  max-width: 50%;
}

.about-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

/* Why Choose Us Section */
.why-choose-us {
  background-color: #A69485;
  padding: 60px 0;
  text-align: center;
}

.why-choose-us h2, .why-choose-us h3, .why-choose-us p {
  color: #F2EDE4;
}

.benefits {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.benefit-item {
  flex: 1;
  padding: 20px;
  background-color: #403B33;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.benefit-item h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #F2EDE4;
}

.benefit-item p {
  font-size: 16px;
  color: #F2EDE4;
}
</style>
