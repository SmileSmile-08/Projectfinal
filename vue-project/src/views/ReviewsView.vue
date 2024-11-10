<template>
  <div>
    <!-- ส่วนแสดงรีวิว -->
    <div class="reviews-container">
      <h2 class="title">User Reviews</h2>

      <!-- ส่วนแสดงคะแนนเฉลี่ยของรีวิวทั้งหมด -->
      <div class="average-rating">
        <h3>Average Rating: {{ averageRating }} ⭐</h3>
      </div>

      <!-- ฟอร์มรีวิว ถ้ามีผู้ใช้ล็อกอินอยู่ -->
      <template v-if="currentUser">
        <form @submit.prevent="submitReview" class="review-form">
          <!-- ช่องกรอกคอมเมนต์ของผู้ใช้ -->
          <label for="user-review">Your Review:</label>
          <textarea id="user-review" v-model="userReview" rows="4" placeholder="Write your review..." required></textarea>

          <!-- ช่องเลือกคะแนนรีวิว -->
          <label for="user-rating">Your Rating:</label>
          <select id="user-rating" v-model="userRating" required>
            <option v-for="n in 5" :value="n" :key="n">{{ n }} ⭐</option>
          </select>

          <!-- ปุ่มส่งฟอร์ม -->
          <button type="submit">Submit Review</button>
        </form>
      </template>
      <template v-else>
        <!-- ถ้ายังไม่ได้ล็อกอิน แสดงข้อความให้ล็อกอินก่อน -->
        <p>Please <router-link to="/login">login</router-link> to submit a review.</p>
      </template>

      <!-- ส่วนแสดงรายการรีวิวที่มีอยู่ -->
      <div class="review-list">
        <h3>Reviews:</h3>
        <ul>
          <!-- วนลูปรายการรีวิวที่ได้จากตัวแปร `reviews` -->
          <li v-for="(review, index) in reviews" :key="index">
            <!-- แสดงชื่อผู้ใช้ ถ้าไม่มีให้แสดงเป็น 'Anonymous' -->
            <strong>{{ review.user_accounts?.Username || 'Anonymous' }}</strong>
            <!-- แสดงคอมเมนต์ของรีวิว -->
            <p>{{ review.comment }}</p>
            <!-- แสดงคะแนนรีวิว -->
            <p>Rating: {{ review.rating }} ⭐</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // นำเข้า `ref` สำหรับสร้างตัวแปร reactive และ `onMounted` สำหรับเรียกใช้งานเมื่อ component ถูกโหลด

export default {
  name: "ReviewsView", // กำหนดชื่อ component

  setup() {
    // สร้างตัวแปรสำหรับเก็บข้อมูลต่างๆ ที่เกี่ยวข้องกับรีวิว
    const userReview = ref(''); // เก็บคอมเมนต์ของผู้ใช้ที่กำลังจะส่ง
    const userRating = ref(null); // เก็บคะแนนที่ผู้ใช้เลือก
    const reviews = ref([]); // เก็บรายการรีวิวทั้งหมด
    const currentUser = ref(null); // เก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่
    const averageRating = ref(0); // เก็บคะแนนเฉลี่ยของรีวิวทั้งหมด

    // ฟังก์ชันนี้จะทำงานเมื่อ component ถูก mount
    onMounted(() => {
      try {
        const storedUser = localStorage.getItem('currentUser'); // ดึงข้อมูลผู้ใช้จาก localStorage
        if (storedUser) {
          currentUser.value = JSON.parse(storedUser); // ถ้ามีข้อมูลผู้ใช้ ตั้งค่าตัวแปร currentUser
          if (!currentUser.value.user_id) {
            throw new Error('User ID is missing!');
          }
        }
      } catch (error) {
        console.error('Failed to load user information.');
      }
      fetchReviews(); // เรียกฟังก์ชัน fetchReviews เพื่อดึงข้อมูลรีวิวจาก API
    });

    // ฟังก์ชันสำหรับส่งรีวิวใหม่
    const submitReview = async () => {
      if (userReview.value && userRating.value && currentUser.value) {
        const newReview = {
          user_id: currentUser.value.user_id, // ID ของผู้ใช้ที่ล็อกอินอยู่
          comment: userReview.value, // คอมเมนต์ของผู้ใช้
          rating: userRating.value, // คะแนนที่ผู้ใช้ให้
        };

        try {
          // เรียก API เพื่อส่งข้อมูลรีวิวไปยัง backend
          const response = await fetch('http://localhost:8080/api/v1/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
          });

          if (!response.ok) {
            throw new Error('Failed to submit review'); // แสดงข้อผิดพลาดถ้าส่งข้อมูลไม่สำเร็จ
          }

          await fetchReviews(); // อัปเดตรายการรีวิวใหม่
          userReview.value = ''; // เคลียร์ข้อความรีวิวหลังส่ง
          userRating.value = null; // รีเซ็ตคะแนนหลังส่ง
          alert('ขอบคุณสำหรับรีวิวของคุณ!');
        } catch (error) {
          alert('Error submitting review.');
        }
      } else {
        alert("Please fill out all fields."); // แสดงข้อความเตือนถ้าฟิลด์ข้อมูลไม่ครบ
      }
    };

    // ฟังก์ชันสำหรับดึงข้อมูลรีวิวจาก API
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/reviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews'); // แสดงข้อผิดพลาดถ้าดึงข้อมูลไม่สำเร็จ
        }
        const data = await response.json(); // แปลงข้อมูลจาก JSON เป็น object
        reviews.value = data; // ตั้งค่ารีวิวที่ดึงมาให้กับตัวแปร reviews
        calculateAverageRating(); // คำนวณคะแนนเฉลี่ยใหม่
      } catch (error) {
        console.error('Error fetching reviews.');
      }
    };

    // ฟังก์ชันคำนวณคะแนนเฉลี่ยจากรายการรีวิว
    const calculateAverageRating = () => {
      const total = reviews.value.reduce((sum, review) => sum + review.rating, 0); // หาผลรวมของคะแนน
      averageRating.value = (total / reviews.value.length).toFixed(1); // หารผลรวมด้วยจำนวนรีวิว และปัดเป็นทศนิยม 1 ตำแหน่ง
    };

    // ฟังก์ชันจัดเรียงรีวิวตามเงื่อนไข
    const sortReviews = (criteria) => {
      if (criteria === 'highest') {
        reviews.value.sort((a, b) => b.rating - a.rating); // จัดเรียงจากคะแนนสูงไปต่ำ
      } else if (criteria === 'latest') {
        reviews.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // จัดเรียงจากรีวิวใหม่ไปเก่า
      }
    };

    // คืนค่าตัวแปรและฟังก์ชันที่ใช้ใน template
    return {
      userReview, // ส่งตัวแปร userReview ไปใช้งานใน template
      userRating, // ส่งตัวแปร userRating ไปใช้งานใน template
      reviews, // ส่งตัวแปร reviews ไปใช้งานใน template
      currentUser, // ส่งตัวแปร currentUser ไปใช้งานใน template
      submitReview, // ส่งฟังก์ชัน submitReview ไปใช้งานใน template
      averageRating, // ส่งตัวแปร averageRating ไปใช้งานใน template
      sortReviews, // ส่งฟังก์ชัน sortReviews ไปใช้งานใน template
    };
  }
};
</script>


<style scoped>
/* Reviews Section */
.reviews-container {
  padding: 40px;
  text-align: center;
  background-color: #F2EDE4;
}

.title {
  font-size: 32px;
  margin-bottom: 30px;
  color: #403B33;
  font-weight: bold;
  text-transform: uppercase;
}

.review-form {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  background: #D9C9BA;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.review-form label {
  font-size: 16px;
  margin-bottom: 5px;
  color: #403B33;
}

.review-form textarea, .review-form select {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #736151;
  border-radius: 5px;
  font-size: 16px;
  color: #403B33;
  background-color: #F2EDE4;
}

.review-form button {
  padding: 15px;
  background-color: #736151;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.review-form button:hover {
  background-color: #A69485;
}

/* Sort Buttons */
.sort-buttons {
  margin-bottom: 20px;
}

.sort-buttons button {
  padding: 10px 20px;
  margin: 5px;
  background-color: #736151;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.sort-buttons button:hover {
  background-color: #A69485;
}

/* Review List */
.review-list {
  text-align: left;
  max-width: 800px;
  margin: 0 auto;
}

.review-list h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #403B33;
}

.review-list ul {
  list-style: none;
  padding: 0;
}

.review-list li {
  margin-bottom: 15px;
  padding: 20px;
  background-color: #F2EDE4;
  border: 1px solid #736151;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.review-list strong {
  font-size: 18px;
  color: #403B33;
  display: block;
  margin-bottom: 10px;
}

.review-list p {
  font-size: 16px;
  color: #736151;
  margin-bottom: 10px;
}

/* Average Rating */
.average-rating {
  margin-bottom: 20px;
  font-size: 24px;
  color: #403B33;
}
</style>
