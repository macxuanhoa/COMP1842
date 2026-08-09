// ── Khởi tạo ứng dụng Vue ────────────────────────────────────────────
// File entry point: import global CSS, plugin, và mount app vào #app

// Import thư viện Vue core
import Vue from 'vue';
// Import component gốc App
import App from './App.vue';
// Import cấu hình định tuyến Vue Router
import router from './router';

// CSS framework + flash message plugin
// Import CSS framework Semantic UI
import 'semantic-ui-css/semantic.css';
// Import plugin hiển thị thông báo flash
import VueFlashMessage from 'vue-flash-message';
// Import CSS cho plugin flash message
import 'vue-flash-message/dist/vue-flash-message.min.css';

// Tắt thông báo nhắc nhở môi trường production trong console
Vue.config.productionTip = false;

// Đăng ký flash message toàn cục (this.flash() ở mọi component)
Vue.use(VueFlashMessage, {
  messageOptions: {
    timeout: 3000,
    pauseOnInteract: true
  }
});

// Mount app với router: tạo Vue instance và gắn vào phần tử #app
new Vue({
  router,
  render: createElement => createElement(App)
}).$mount('#app');

