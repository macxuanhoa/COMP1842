// ── Vue Router ──────────────────────────────────────────────────────
// Định nghĩa tất cả các route (trang) trong ứng dụng
// Sử dụng history mode để URL sạch, không có dấu #

import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Words from './views/Words.vue';
import New from './views/New.vue';
import Show from './views/Show.vue';
import Edit from './views/Edit.vue';
import Categories from './views/Categories.vue';
import Test from './views/Test.vue';
import AboutMe from './views/AboutMe.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/words',
      name: 'words',
      component: Words
    },
    {
      path: '/words/new',
      name: 'new-word',
      component: New
    },
    {
      path: '/words/:id',
      name: 'show',
      component: Show
    },
    {
      path: '/words/:id/edit',
      name: 'edit',
      component: Edit
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories
    },
    {
      path: '/test',
      name: 'test',
      component: Test
    },
    {
      path: '/about',
      name: 'about',
      component: AboutMe
    },
    {
      path: '*',
      name: 'not-found',
      component: NotFound
    }
  ]
});
