// ── Vue Router ──────────────────────────────────────────────────────
// Định nghĩa tất cả các route (trang) trong ứng dụng
// Sử dụng history mode để URL sạch, không có dấu #

// Import Vue và thư viện Vue Router
import Vue from 'vue';
import Router from 'vue-router';

// Import các component trang giao diện (views)
import Dashboard from './views/Dashboard.vue';
import Words from './views/Words.vue';
import New from './views/New.vue';
import Show from './views/Show.vue';
import Edit from './views/Edit.vue';
import Categories from './views/Categories.vue';
import Test from './views/Test.vue';
import AboutMe from './views/AboutMe.vue';
import NotFound from './views/NotFound.vue';

// Đăng ký sử dụng plugin Vue Router
Vue.use(Router);

// Khởi tạo và xuất cấu hình Router cho ứng dụng
export default new Router({
  mode: 'history', // Sử dụng chế độ HTML5 History Mode cho đường dẫn đẹp
  base: process.env.BASE_URL,
  linkActiveClass: 'active', // Thêm class 'active' cho menu link đang chọn
  // Luôn cuộn về đầu trang khi đổi route để bố cục không bị nhảy
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    // Trang chủ: chuyển hướng tự động về trang Dashboard
    {
      path: '/',
      redirect: '/dashboard'
    },
    // Trang tổng quan và thống kê từ vựng
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    // Trang danh sách tất cả từ vựng
    {
      path: '/words',
      name: 'words',
      component: Words
    },
    // Trang tạo từ vựng mới
    {
      path: '/words/new',
      name: 'new-word',
      component: New
    },
    // Trang xem chi tiết một từ vựng theo ID
    {
      path: '/words/:id',
      name: 'show',
      component: Show
    },
    // Trang chỉnh sửa thông tin từ vựng theo ID
    {
      path: '/words/:id/edit',
      name: 'edit',
      component: Edit
    },
    // Trang quản lý danh mục từ vựng
    {
      path: '/categories',
      name: 'categories',
      component: Categories
    },
    // Trang kiểm tra / ôn tập từ vựng
    {
      path: '/test',
      name: 'test',
      component: Test
    },
    // Trang giới thiệu bản thân
    {
      path: '/about',
      name: 'about',
      component: AboutMe
    },
    // Route khớp với mọi đường dẫn không hợp lệ (Trang 404)
    {
      path: '*',
      name: 'not-found',
      component: NotFound
    }
  ]
});
