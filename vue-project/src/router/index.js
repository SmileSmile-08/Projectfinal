import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // ใช้ประวัติการเปลี่ยนแปลง
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // หน้าแรก
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue') 
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue') // หน้าเข้าสู่ระบบ
    },
    {
      path: '/services',
      name: 'Services',
      component: () => import('../views/ServicesView.vue') // หน้าเซอร์วิส
    },
    
    {
      path: '/reviews',
      name: 'Reviews',
      component: () => import('../views/ReviewsView.vue') // หน้ารีวิว
    },
    {
      path: '/schedule',
      name: 'Schedule',
      component: () => import('../views/ScheduleView.vue') // หน้าตารางนัดหมาย
    },
    {
      path: '/contact',
      name: 'Contact',
      component: () => import('../views/ContactView.vue') // หน้า ติดต่อ
    },
    {
      path: '/admindashboard', // เส้นทางสำหรับหน้า Admin
      name: 'Admindashboard',
      component: () => import('../views/AdminDashboard.vue') // หน้า ติดต่
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: () => import('../views/AdminSetting.vue') // หน้า ติดต่
    },
    {
      path: '/adminuser',
      name: 'AdminUser',
      component: () => import('../views/AdminUser.vue') // หน้า ติดต่
    },
    {
      path: '/adminreviews',
      name: 'AdminReviews',
      component: () => import('../views/AdminReviews.vue') // หน้า ติดต่
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profileview.vue') // หน้า ติดต่
    },
    {
      path: '/chatcomponent',
      name: 'Chatcomponent',
      component: () => import('../views/Chatcomponent.vue') 
    },
    // {
    //   path: '/adminchatcomponent',
    //   name: 'AdminChatComponent',
    //   component: () => import('../views/AdminChatComponent.vue') 
    // },
    
    
    {
      path: '/adminservices',
      name: 'Adminservices',
      component: () => import('../views/Adminservices.vue') 
    },
    {
      path: '/userchatcomponent',
      name: 'UserChatComponent',
      component: () => import('../views/UserChatComponent.vue') 
    },
    // {
    //   path: '/chatpage',
    //   name: 'ChatPage',
    //   component: () => import('../views/ChatPage.vue') 
    // },
  ]
});

export default router; // ส่งออก router
