<template>
  <div>
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="chart bar icon"></i>
          Learning overview
        </div>
        <h1>Dashboard</h1>
        <p>Overview of your vocabulary collection and quiz performance.</p>
      </div>
      <div class="workspace-header-actions">
        <router-link to="/test" class="ui primary button">
          <i class="play icon"></i>
          Practice now
        </router-link>
      </div>
    </header>

    <div>
      <div class="ui three cards">
        <div class="ui card">
          <div class="content">
            <div class="header">{{ totalWords }}</div>
            <div class="meta">Total Words</div>
          </div>
        </div>
        <div class="ui card">
          <div class="content">
            <div class="header">{{ favouriteCount }}</div>
            <div class="meta">Favourites</div>
          </div>
        </div>
        <div class="ui card">
          <div class="content">
            <div class="header">{{ categoryCount }}</div>
            <div class="meta">Categories</div>
          </div>
        </div>
      </div>

      <h3 class="ui dividing header">Recent Quiz Attempts</h3>
      <p v-if="quizHistory.length" style="color: #687386; margin-bottom: 0.75rem;">
        Average of last {{ Math.min(quizHistory.length, 5) }}: <strong style="color: #2185d0;">{{ recentAverage }}%</strong>
      </p>

      <div v-if="quizHistory.length === 0" class="ui message">
        No quiz attempts yet. <router-link to="/test">Take your first quiz.</router-link>
      </div>
      <table v-else class="ui celled compact table">
        <thead>
          <tr>
            <th>Date &amp; time</th>
            <th class="center aligned">Score</th>
            <th class="center aligned">Result</th>
            <th class="right aligned">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(attempt, idx) in quizHistory.slice(0, 5)" :key="idx">
            <td>{{ formatDateTime(attempt.timestamp) }}</td>
            <td class="center aligned">
              <strong>{{ attempt.score }}</strong> / {{ attempt.total }}
            </td>
            <td class="center aligned">
              <span class="ui label" :class="getScoreClass(attempt)">{{ getScorePercent(attempt) }}%</span>
            </td>
            <td class="right aligned">
              <button
                v-if="attempt.wordIds && attempt.wordIds.length"
                class="ui basic primary mini button"
                @click="retakeTest(attempt)"
              >
                <i class="redo icon"></i> Retake
              </button>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getWords, getCategories } from '../helpers/helpers';

export default {
  name: 'dashboard',
  data() {
    return {
      totalWords: 0, // Tổng số từ.
      favouriteCount: 0, // Số từ favourite.
      categoryCount: 0, // Số category.
      quizHistory: [] // Lịch sử quiz.
    };
  },
  computed: {
    recentAverage() {
      // Lấy 5 lần gần nhất trong `quizHistory`, đổi sang phần trăm bằng `getScorePercent()`, rồi tính trung bình để hiển thị trên dashboard.
      const recentAttempts = this.quizHistory.slice(0, 5);
      if (!recentAttempts.length) return 0;
      const totalPercent = recentAttempts.reduce((sum, attempt) => sum + this.getScorePercent(attempt), 0);
      return Math.round(totalPercent / recentAttempts.length);
    }
  },
  async mounted() {
    try {
      // Gọi `getWords()` và `getCategories()` để lấy số liệu tổng quan từ backend, rồi gán vào các state đếm trên dashboard.
      const words = await getWords();
      const categories = await getCategories();
      this.totalWords = words.length;
      this.favouriteCount = words.filter(word => word.favourite).length;
      this.categoryCount = categories.length;
      try {
        // Đọc lịch sử quiz từ `localStorage` key `coursework03_quiz_history` rồi lưu vào `this.quizHistory`.
        this.quizHistory = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
      } catch (error) {
        // Nếu dữ liệu trong `localStorage` lỗi format thì trả về mảng rỗng để UI vẫn chạy.
        this.quizHistory = [];
      }
    } catch (error) {
      console.error(error);
      this.flash('Failed to load dashboard data.', 'error');
    }
  },
  methods: {
    getScorePercent(attempt) {
      // Dùng `score` và `total` của mỗi lần quiz để đổi sang phần trăm hiển thị.
      if (!attempt.total) return 0;
      return Math.round((attempt.score / attempt.total) * 100);
    },
    getScoreClass(attempt) {
      // Dùng kết quả từ `getScorePercent()` để chọn màu nhãn: xanh, cam hoặc đỏ.
      const scorePercent = this.getScorePercent(attempt);
      if (scorePercent >= 80) return 'green';
      if (scorePercent >= 50) return 'orange';
      return 'red';
    },
    formatDateTime(isoString) {
      // Đổi chuỗi ISO lấy từ lịch sử quiz thành text ngày giờ gọn để render trong bảng.
      if (!isoString) return '—';
      const date = new Date(isoString);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    },
    retakeTest(attempt) {
      // Lưu `attempt.wordIds` vào `sessionStorage` key `retake_word_ids`, rồi chuyển sang `/test` để Test.vue đọc lại và mở phiên retake.
      if (attempt.wordIds && attempt.wordIds.length) {
        sessionStorage.setItem('retake_word_ids', JSON.stringify(attempt.wordIds));
        this.$router.push('/test');
      }
    }
  }
};
</script>
