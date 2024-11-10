const express = require('express');
const router = express.Router(); // ใช้ router แทน routes
const user_accountController = require('../controllers/user_accounts'); // ตรวจสอบว่าไฟล์นี้มีอยู่และชื่อถูกต้อง
const projectController = require('../controllers/projects');
const reviewController = require('../controllers/reviews'); 
const pricingController = require('../controllers/pricing');// ตรวจสอบว่าไฟล์นี้มีอยู่และชื่อถูกต้อง
//const notificationController = require('../controllers/notifications');
const scheduleController = require('../controllers/schedule'); // เปลี่ยนเส้นทางให้ตรงกับที่คุณเก็บไฟล์ควบคุม
const chatbotController = require('../controllers/chatbot'); // เปลี่ยนเส้นทางให้ตรงกับที่คุณเก็บไฟล์ควบคุม
const serviceHistoryController = require('../controllers/service_history');


// กำหนดเส้นทางต่างๆ
router.post('/user_accounts', user_accountController.createUser_account); // สร้างผู้ใช้
router.put('/user_accounts', user_accountController.updateUser_account); // อัปเดตผู้ใช้
router.delete('/user_accounts/:ID', user_accountController.deleteUser_account); // ลบผู้ใช้
router.get('/user_accounts', user_accountController.getUser_accounts); // ดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/user_accounts/:ID', user_accountController.getUser_account); // ดึงข้อมูลผู้ใช้โดย ID
router.get('/user_accounts/search/:term', user_accountController.getUser_accountsByTerm); // ดึงข้อมูลผู้ใช้ตามเงื่อนไขการค้นหา
router.post('/login', user_accountController.loginUser);
router.post('/register', user_accountController.registerUser); // สมัครสมาชิก


router.post('/service_history', serviceHistoryController.createServiceHistory); // สร้างประวัติการใช้บริการใหม่
router.put('/service_history/:id', serviceHistoryController.updateServiceHistory); // อัปเดตประวัติการใช้บริการตาม id
router.delete('/service_history/:id', serviceHistoryController.deleteServiceHistory); // ลบประวัติการใช้บริการตาม id
router.get('/service_history', serviceHistoryController.getServiceHistories); // ดึงข้อมูลประวัติการใช้บริการทั้งหมด
router.get('/service_history/user/:user_id', serviceHistoryController.getServiceHistoryByUserId); // ดึงข้อมูลประวัติการใช้บริการตาม user_id






// กำหนดเส้นทางต่างๆ สำหรับโปรเจกต์
// route สำหรับสร้างโปรเจกต์ใหม่ พร้อมการอัพโหลดไฟล์ภาพ
router.post('/projects', projectController.upload.single('image'), projectController.createProject);

// route สำหรับอัปเดตโปรเจกต์ พร้อมการอัพโหลดไฟล์ภาพใหม่ (ถ้ามี)
router.put('/projects/:id_projects', projectController.upload.single('image'), projectController.updateProject);

// route สำหรับลบโปรเจกต์
router.delete('/projects/:id_projects', projectController.deleteProject);

// route สำหรับดึงข้อมูลโปรเจกต์ทั้งหมด
router.get('/projects', projectController.getProjects);

// route สำหรับดึงข้อมูลโปรเจกต์ตาม ID
router.get('/projects/:id_projects', projectController.getProjectsById);

//router.post('/reviews', reviewController.createReview); 
//router.put('/reviews/:id_reviews', reviewController.updateReview); // อัปเดตรีวิวตาม id_reviews
//router.delete('/reviews/:id_reviews', reviewController.deleteReview); 
//router.get('/reviews', reviewController.getReviews); 
//router.get('/reviews/:id_reviews', reviewController.getReviewById); 
//router.get('/reviews/search/:term', reviewController.getReviewsByTerm); 

router.post('/pricing', pricingController.createPricing); // สร้าง pricing ใหม่
router.put('/pricing/:id_pricing', pricingController.updatePricing); // อัปเดต pricing ตาม id_pricing
router.delete('/pricing/:id_pricing', pricingController.deletePricing); // ลบ pricing ตาม id_pricing
router.get('/pricing', pricingController.getPricings); // ดึง pricing ทั้งหมด
router.get('/pricing/:id_pricing', pricingController.getPricings); // ดึง pricing ตาม id_pricing



router.post('/reviews', reviewController.createReview);
router.put('/reviews/:id_reviews', reviewController.updateReview);
router.delete('/reviews/:id_reviews', reviewController.deleteReview);
router.get('/reviews', reviewController.getReviews);
router.get('/reviews/:id_reviews', reviewController.getReviewById);
router.get('/reviews/search/:term', reviewController.getReviewsByTerm);

// router.post('/', notificationController.createNotification); // สร้างการแจ้งเตือนใหม่
// router.put('/:id', notificationController.updateNotification); // อัปเดตการแจ้งเตือนตาม ID
// router.delete('/:id', notificationController.deleteNotification); // ลบการแจ้งเตือนตาม ID
// router.get('/', notificationController.getNotifications); // ดึงการแจ้งเตือนทั้งหมด
// router.get('/:id', notificationController.getNotification); // ดึงการแจ้งเตือนตาม ID



router.post('/schedule', scheduleController.createSchedule); 
router.put('/schedule/:id', scheduleController.updateSchedule); // เพิ่ม / ก่อน :id
router.delete('/schedule/:id', scheduleController.deleteSchedule); 
router.get('/schedule', scheduleController.getSchedules); // GET สำหรับเรียกข้อมูลทั้งหมด
router.get('/schedule/:id', scheduleController.getSchedule); // GET สำหรับเรียกข้อมูลตาม ID


router.post('/chatbot', chatbotController.chatbot); // ตอบคำถามแชทบอต
router.post('/chatbot/new', chatbotController.createChatbot); // เพิ่มคำถามและคำตอบใหม่
router.put('/chatbot/:id', chatbotController.updateChatbot); // อัปเดตคำตอบตาม id
router.delete('/chatbot/:id', chatbotController.deleteChatbot); // ลบคำตอบตาม id
router.get('/chatbot', chatbotController.getChatbotResponses); // ดึงคำตอบทั้งหมด
router.get('/chatbot/:id', chatbotController.getChatbotResponse); // ดึงคำตอบตาม id

// เส้นทาง API สำหรับคำถามอัตโนมัติ
router.get('/chatbot', chatbotController.getAutoQuestions); // ดึงคำถามอัตโนมัติ



module.exports = router;
