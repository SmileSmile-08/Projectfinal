<template>
  <div>
    <!-- ส่วนหัว -->
    <header class="header-section">
      <!-- หัวข้อใหญ่ของหน้า -->
      <h1>Manage Reviews</h1>
      <!-- คำอธิบายสั้นๆ -->
      <p>View and manage user reviews efficiently.</p>
    </header>

    <!-- ส่วนแสดงรีวิว -->
    <div class="reviews-container">
      <h3>Reviews:</h3>
      <ul class="reviews-list">
        <!-- แสดงรายการรีวิวจากข้อมูลใน reviews -->
        <li v-for="review in reviews" :key="review.id_reviews" class="review-item">
          <div class="review-info">
            <!-- แสดงชื่อผู้ใช้ ถ้าไม่มีก็แสดงเป็น Anonymous -->
            <strong class="username">{{ review.user_accounts?.Username || 'Anonymous' }}</strong>
            <!-- แสดงคอมเมนต์ -->
            <p class="comment">{{ review.comment }}</p>
            <!-- แสดงคะแนน -->
            <p class="rating">Rating: {{ review.rating }}</p>
          </div>
          <!-- ปุ่มสำหรับลบรีวิว -->
          <button @click="deleteReview(review.id_reviews)" class="delete-button">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: "AdminReviews",
  setup() {
    // สร้าง state สำหรับเก็บข้อมูลรีวิว
    const reviews = ref([]); 

    // ฟังก์ชันสำหรับดึงข้อมูลรีวิวจาก API
    const fetchReviews = async () => {
      try {
        // เรียก API เพื่อดึงข้อมูลรีวิว
        const response = await fetch('http://localhost:8080/api/v1/reviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        reviews.value = data; // ตั้งค่าข้อมูลรีวิวใน state
        console.log('Fetched reviews:', reviews.value);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    // ฟังก์ชันสำหรับลบรีวิว
    const deleteReview = async (id_reviews) => {
      try {
        // เรียก API เพื่อลบรีวิวตาม id_reviews ที่ส่งมา
        const response = await fetch(`http://localhost:8080/api/v1/reviews/${id_reviews}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete review');
        }
        // อัปเดตรายการรีวิวใน state หลังจากลบ
        reviews.value = reviews.value.filter(review => review.id_reviews !== id_reviews);
        console.log('Review deleted:', id_reviews);
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    };

    // ดึงข้อมูลรีวิวเมื่อโหลดหน้า
    onMounted(() => {
      fetchReviews();
    });

    return {
      reviews, // แสดงข้อมูลรีวิว
      deleteReview, // ฟังก์ชันลบรีวิว
    };
  }
};
</script>

<style scoped>
/* การตั้งค่าฟอนต์และพื้นหลัง */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
}

/* การตั้งค่าสำหรับส่วนหัว */
.header-section {
  width: 100%;
  background: linear-gradient(to right, #D9C9BA, #A69485); /* ไล่สีจากซ้ายไปขวา */
  color: #403B33;
  padding: 40px 20px; /* การเว้นระยะใน */
  border-radius: 10px; /* มุมมน */
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

/* การตั้งค่าสำหรับคอนเทนเนอร์ของรีวิว */
.reviews-container {
  padding: 20px;
  background-color: #ffffff; /* สีพื้นหลังขาว */
  border-radius: 8px; /* มุมมน */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* เงา */
}

/* การตั้งค่ารายการรีวิว */
.reviews-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* การตั้งค่าไอเท็มแต่ละรีวิว */
.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eaeaea; /* เส้นแบ่งแต่ละรีวิว */
}

.review-item:last-child {
  border-bottom: none; /* ลบเส้นแบ่งของรายการสุดท้าย */
}

/* ข้อมูลภายในแต่ละรีวิว */
.review-info {
  flex: 1;
}

/* การเน้นชื่อผู้ใช้ */
.username {
  font-weight: bold;
  font-size: 1.2em; /* ขนาดตัวอักษรใหญ่ */
  color: #5a4b42; /* สีที่โดดเด่น */
}

/* การตั้งค่าคำคอมเมนต์ */
.comment {
  font-style: italic; /* ตัวเอียง */
  margin: 5px 0; /* ระยะห่าง */
  color: #333; /* สีเข้ม */
}

/* การตั้งค่าคะแนน */
.rating {
  color: #888; /* สีอ่อน */
}

/* การตั้งค่าปุ่มลบ */
.delete-button {
  background-color: #d9534f; /* สีแดง */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* การเปลี่ยนสีเวลา hover */
}

.delete-button:hover {
  background-color: #c9302c; /* สีแดงเข้มเมื่อ hover */
}
</style>
