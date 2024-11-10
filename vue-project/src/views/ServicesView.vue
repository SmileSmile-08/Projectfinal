<template>
  <div>
    <!-- Services Section -->
    <div class="services-container">
      <h2 class="title">Our Services</h2>
      <div class="service-cards">
        <div class="service-card">
          <img src="@/assets/tools.png" alt="Service 1" />
          <h3>ซ่อมแซม</h3>
          <p>ช่วยแซมซ่อมแซมทุกรูปแบบที่ชำรุด แตกร้าว หรือผุพัง</p>
        </div>
        <div class="service-card">
          <img src="@/assets/bathtub.png" alt="Service 2" />
          <h3>เคลือบสีสุขภัณฑ์</h3>
          <p>เคลือบสีสัขภัณฑ์ทุกชนิด</p>
        </div>
        <div class="service-card">
          <img src="@/assets/polish.png" alt="Service 3" />
          <h3>ขัดเคลือบเงา</h3>
          <p>ขัดเงาเคลือบโดยไม่ต้องเคลือบสีใหม่</p>
        </div>
      </div>
    </div>

    <!-- Why Choose Us Timeline Section -->
    <div class="timeline-container">
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <p>"We are the leaders in sanitary ware repair and coating, with a team of experts and over 10 years of experience."</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <p>"Expert technicians"</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <p>"Guaranteed quality"</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <p>"Premium-grade materials"</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Section -->
    <div class="gallery-section">
      <h2>Restore your worn or damaged sanitary ware with our expert repair and recoating service. Trust us for quality and attention to detail.</h2>
      <div class="gallery-images">
        <img src="@/assets/project1.jpg" alt="Project 1" />
        <img src="@/assets/project2.jpg" alt="Project 2" />
        <img src="@/assets/project3.jpg" alt="Project 3" />
      </div>
    </div>

    <!-- Call to Action Section -->
    <div class="cta-section">
      <h2>Get a Free Estimate!</h2>
      <p>"Contact us today for a free consultation and estimate!"</p>
    </div>

    <!-- Calculate Form Section -->
    <div class="container">
      <h2>Calculate Your Service Cost</h2>
      <form @submit.prevent="calculateCost">
        <label for="service-type">Select Service Type:</label>
        <select v-model="serviceType" required>
          <option value="" disabled>Select a service</option>
          <option value="coating">พ่นสีสุขภัณฑ์</option>
          <option value="polish">ขัดเคลือบเงา</option>
        </select>

        <label for="item-type">Select Item Type:</label>
        <select v-model="itemType" required>
          <option value="" disabled>Select item type</option>
          <option value="iron">อ่างเหล็ก</option>
          <option value="fiber">อ่างไฟเบอร์</option>
          <option value="jacuzzi">อ่างจากุชชี่</option>
          <option value="sink">อ่างล้างหน้า</option>
          <option value="toiletLid">ฝาชักโครก</option>
        </select>

        <label for="item-size">Enter Number of Items (pieces or units):</label>
        <input type="number" v-model="itemSize" placeholder="Number of items" required />

        <div class="checkbox-container">
          <label for="paint-peeling">Is there any paint peeling?</label>
          <input type="checkbox" id="paint-peeling" v-model="paintPeeling" />
        </div>

        <button type="submit">Calculate Cost</button>
      </form>

      <div class="result" v-if="cost !== null">
        ค่าบริการพื้นฐานที่ประมาณการ: <span>฿{{ baseCost.toFixed(2) }}</span> <br>
        <span v-if="paintPeeling">ค่าบริการเพิ่มเติมสำหรับการลอกสี: ฿500</span> <br>
        ค่าบริการรวมที่ประมาณการ: <span>฿{{ cost.toFixed(2) }}</span>
        <p v-if="serviceType === 'coating'">หมายเหตุ: การเคลือบสีสุขภัณฑ์จะรวมการซ่อมรอยแตกร้าวอยู่แล้ว</p>
      </div>
    </div>
  </div>
</template>

<script>
// นำเข้า `ref` จาก Vue ซึ่งเป็นฟังก์ชันที่ใช้สร้างตัวแปร reactive
import { ref } from 'vue';

export default {
  name: "EnhancedPage", // กำหนดชื่อ component เป็น "EnhancedPage"
  setup() { // ฟังก์ชัน setup สำหรับ Composition API ที่ใช้กำหนดค่าตัวแปรและฟังก์ชันที่ใช้ใน component
    // ตัวแปร reactive เพื่อเก็บค่าต่าง ๆ ที่จะถูกใช้งานในฟังก์ชันคำนวณค่าบริการ
    const serviceType = ref(''); // `serviceType` เก็บประเภทบริการ เช่น 'coating' (เคลือบสี) หรือ 'polish' (ขัดเงา)
    const itemType = ref(''); // `itemType` เก็บประเภทของอ่าง เช่น 'iron' (เหล็ก), 'fiber' (ไฟเบอร์), 'jacuzzi' (จากุชชี่)
    const itemSize = ref(0); // `itemSize` เก็บจำนวนชิ้นของอ่างที่จะให้บริการ
    const paintPeeling = ref(false); // `paintPeeling` เป็น boolean เพื่อบอกว่ามีการลอกสีหรือไม่
    const baseCost = ref(0); // `baseCost` เก็บค่าบริการพื้นฐานที่คำนวณได้ตามเงื่อนไข
    const cost = ref(null); // `cost` เก็บค่าบริการรวมทั้งหมด

    const calculateBaseCost = () => {
      const itemTypes = {  //เก็บประเภทของอ่าง
        iron: "iron",
        fiber: "fiber",
        jacuzzi: "jacuzzi",
        sink: "sink",
        toiletLid: "toiletLid"
      }

      const serviceTypes = {  //เก็บประเภทของการบริการ
        coating: "coating",
        polish: "polish",
      }

      let result;   //ตัวแปร result ถูกสร้างขึ้นมาเพื่อเก็บค่า ราคาพื้นฐาน result ช่วยให้เราสามารถเปลี่ยนแปลงค่าของตัวแปรได้ตามเงื่อนไขต่าง ๆ ภายในฟังก์ชันเดียวกัน 
      //ตรวจสอบว่า serviceType.value ตรงกับ coating หรือไม่ (ง่ายๆคือหมายถึงว่าผู้ใช้ได้เลือก coating ไหม)
      if (serviceType.value == serviceTypes.coating) { 
        switch (itemType.value) {  //ตรวจสอบประเภทของอ่าง
          case itemTypes.iron: //case คือเงื่อนไขที่ต้องตรวจสอบถ้าค่าตรงกับcaseไหน caseนั้นก็จะทำงาน
            result = 3200;
            break;    //break ใช้เพื่อหยุดการทำงานของ switch หลังจากเจอเงื่อนไขที่ตรงแล้ว และจะไม่ตรวจสอบเงื่อนไขถัดไป 
          case itemTypes.fiber:
            result = 2400;
            break;
          case itemTypes.jacuzzi:
            result = 8000;
            break;
          case itemTypes.sink:
            result = 1400;
            break;
          case itemTypes.toiletLid:
            result = 900;
            break;
        }
      } else if (serviceType.value == serviceTypes.polish) { //ถ้าผู้ใช้เลือกบริการเป็นขัดเงา
        const x = itemType.value; // เก็บค่า itemType.value ไว้ในตัวแปร x
        result = (x == itemTypes.iron || x == itemTypes.fiber) ? 1200 :
          x == itemTypes.jacuzzi ? 2000 :
          x == itemTypes.sink ? 500 :
          x == itemTypes.toiletLid ? 300 : 0;  //ถ้าไม่ตรงกับกรณีใดเลย result จะถูกตั้งเป็น 0
      }
      return result;
    }

    // ฟังก์ชัน `calculateCost` ทำหน้าที่คำนวณค่าบริการรวมตามประเภทอ่างและประเภทบริการ
    const calculateCost = () => {
      // let calculatedBaseCost = 0; // กำหนดค่าพื้นฐานเริ่มต้นของค่าบริการเป็น 0

      // // เช็คเงื่อนไขของ `itemType` (ประเภทของอ่าง) และ `serviceType` (ประเภทบริการ) เพื่อกำหนดค่าบริการพื้นฐาน
      // if (itemType.value === 'iron') { // ถ้า `itemType` เป็น 'iron' (อ่างเหล็ก)
      //   if (serviceType.value === 'coating') { // ถ้า `serviceType` เป็น 'coating' (เคลือบสี)
      //     calculatedBaseCost = 3200; // ตั้งค่าพื้นฐานเป็น 3200 บาท
      //   } else if (serviceType.value === 'polish') { // ถ้า `serviceType` เป็น 'polish' (ขัดเงา)
      //     calculatedBaseCost = 1200; // ตั้งค่าพื้นฐานเป็น 1200 บาท
      //   }
      // } else if (itemType.value === 'fiber') { // ถ้า `itemType` เป็น 'fiber' (อ่างไฟเบอร์)
      //   if (serviceType.value === 'coating') { // ถ้า `serviceType` เป็น 'coating'
      //     calculatedBaseCost = 2400; // ตั้งค่าพื้นฐานเป็น 2400 บาท
      //   } else if (serviceType.value === 'polish') { // ถ้า `serviceType` เป็น 'polish'
      //     calculatedBaseCost = 1200; // ตั้งค่าพื้นฐานเป็น 1200 บาท
      //   }
      // } else if (itemType.value === 'jacuzzi') { // ถ้า `itemType` เป็น 'jacuzzi' (อ่างจากุชชี่)
      //   if (serviceType.value === 'coating') { // ถ้า `serviceType` เป็น 'coating'
      //     calculatedBaseCost = 8000; // ตั้งค่าพื้นฐานเป็น 8000 บาท
      //   } else if (serviceType.value === 'polish') { // ถ้า `serviceType` เป็น 'polish'
      //     calculatedBaseCost = 2000; // ตั้งค่าพื้นฐานเป็น 2000 บาท
      //   }
      // } else if (itemType.value === 'sink') { // ถ้า `itemType` เป็น 'sink' (อ่างล้างหน้า)
      //   if (serviceType.value === 'coating') { // ถ้า `serviceType` เป็น 'coating'
      //     calculatedBaseCost = 1400; // ตั้งค่าพื้นฐานเป็น 1400 บาท
      //   } else if (serviceType.value === 'polish') { // ถ้า `serviceType` เป็น 'polish'
      //     calculatedBaseCost = 500; // ตั้งค่าพื้นฐานเป็น 500 บาท
      //   }
      // } else if (itemType.value === 'toiletLid') { // ถ้า `itemType` เป็น 'toiletLid' (ฝาชักโครก)
      //   if (serviceType.value === 'coating') { // ถ้า `serviceType` เป็น 'coating'
      //     calculatedBaseCost = 900; // ตั้งค่าพื้นฐานเป็น 900 บาท
      //   } else if (serviceType.value === 'polish') { // ถ้า `serviceType` เป็น 'polish'
      //     calculatedBaseCost = 300; // ตั้งค่าพื้นฐานเป็น 300 บาท
      //   }
      // }


      // คำนวณค่าบริการพื้นฐานตามจำนวนชิ้นที่เลือกไว้ โดยเอาราคาต่อชิ้น (`calculatedBaseCost`) คูณด้วย `itemSize`
      //------ baseCost.value = calculatedBaseCost * itemSize.value;
      baseCost.value = calculateBaseCost() * itemSize.value;

      // เพิ่มค่าบริการเพิ่มเติมในกรณีที่มีการลอกสี
      let additionalCost = 0; // กำหนดค่าเริ่มต้นของค่าบริการเพิ่มเติมเป็น 0
      if (paintPeeling.value) { // ถ้า `paintPeeling` เป็น true (มีการลอกสี)
        additionalCost = 500 * itemSize.value; // ค่าบริการเพิ่มเติมเป็น 500 บาทต่อชิ้น คูณกับจำนวนชิ้นที่เลือก
      }

      // คำนวณค่าบริการรวมโดยรวมค่าบริการพื้นฐาน (`baseCost`) และค่าบริการเพิ่มเติม (`additionalCost`) เข้าด้วยกัน
      cost.value = baseCost.value + additionalCost;
    };

    // คืนค่าตัวแปรและฟังก์ชันที่ประกาศให้สามารถใช้งานใน template ของ component ได้
    return {
      serviceType, // ประเภทบริการ
      itemType, // ประเภทอ่าง
      itemSize, // จำนวนชิ้น
      paintPeeling, // การลอกสี
      baseCost, // ค่าบริการพื้นฐาน
      cost, // ค่าบริการรวม
      calculateCost // ฟังก์ชันคำนวณค่าบริการ
    };
  }
};
</script>


<style scoped>
/* General Styles */
body {
  font-family: "Garamond", serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #403B33;
  background-color: #F2EDE4;
}

/* Services Section */
.services-container {
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #736151, #A69485);
  border-radius: 10px;
  margin-bottom: 40px;
}

.title {
  font-size: 40px;
  margin-bottom: 30px;
  color: #403B33;
  font-weight: bold;
  text-transform: uppercase;
}

.service-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.service-card {
  background: #D9C9BA;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 30%;
  margin-bottom: 20px;
  overflow: hidden;
  text-align: center;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-10px);
}

.service-card img {
  width: 80px;
  height: 80px;
  margin-top: 20px;
}

.service-card h3 {
  font-size: 20px;
  margin: 10px 0;
  color: #403B33;
}

.service-card p {
  color: #736151;
  font-size: 16px;
}

/* Timeline Section */
.timeline-container {
  margin: 50px 0;
  position: relative;
}

.timeline {
  position: relative;
  max-width: 1200px;
  margin: auto;
}

.timeline-item {
  margin: 20px 0;
  position: relative;
  padding-left: 60px;
}

.timeline-item .timeline-icon {
  position: absolute;
  left: 20px;
  top: 15px;
  width: 20px;
  height: 20px;
  background-color: #403B33;
  border-radius: 50%;
}

.timeline-item .timeline-content {
  background-color: #A69485;
  padding: 15px 20px;
  border-radius: 8px;
  color: #F2EDE4;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.timeline-item h3, .timeline-item p {
  margin: 0;
  font-size: 18px;
}

/* Gallery Section */
.gallery-section {
  background-color: #A69485;
  color: #403B33;
  padding: 40px;
  text-align: center;
  border-radius: 10px;
}

.gallery-images {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.gallery-images img {
  width: 30%;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Call to Action Section */
.cta-section {
  background-color: #ffffff;
  color: #736151;
  padding: 40px;
  text-align: center;
  border-radius: 10px;
}

/* Container Styles */
.container {
  background: linear-gradient(135deg, #736151, #A69485);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 600px;
  max-width: 100%;
  padding: 30px;
  box-sizing: border-box;
  margin: 40px auto;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #403B33;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
}

form label {
  font-size: 16px;
  margin-bottom: 5px;
  color: #403B33;
}

form input,
form select {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #736151;
  border-radius: 5px;
  font-size: 16px;
  color: #403B33;
  background-color: #F2EDE4;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.checkbox-container label {
  margin-right: 10px;
  font-size: 16px;
  color: #403B33;
}

form button {
  padding: 15px;
  background-color: #736151;
  color: #F2EDE4;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

form button:hover {
  background-color: #A69485;
}

.result {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #F2EDE4;
  text-align: center;
}
</style>
