// ── Khởi tạo ứng dụng Vue ────────────────────────────────────────────
// File entry point: import global CSS, plugin, và mount app vào #app

import Vue from 'vue';
import App from './App.vue';
import router from './router';

// CSS framework + flash message plugin
import 'semantic-ui-css/semantic.css';
import VueFlashMessage from 'vue-flash-message';
import 'vue-flash-message/dist/vue-flash-message.min.css';

Vue.config.productionTip = false;

// Đăng ký flash message toàn cục (this.flash() ở mọi component)
Vue.use(VueFlashMessage, {
  messageOptions: {
    timeout: 3000,
    pauseOnInteract: true
  }
});

// Mount app với router
new Vue({
  router,
  render: createElement => createElement(App)
}).$mount('#app');
