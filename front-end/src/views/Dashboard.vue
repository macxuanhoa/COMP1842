<template>
  <div class="workspace-page dashboard-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="chart bar icon"></i> Learning overview</div>
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

    <!-- Stat row -->
    <div class="stat-row">
      <div class="stat-item">
        <span class="stat-value">{{ totalWords }}</span>
        <span class="stat-label">Total words</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ favouriteCount }}</span>
        <span class="stat-label">Favourites</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ categoryCount }}</span>
        <span class="stat-label">Categories</span>
      </div>
    </div>

    <!-- Recent quiz history -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Recent quiz attempts</h2>
            <p v-if="quizHistory.length">
              Average of last {{ Math.min(quizHistory.length, 5) }} sessions:
              <strong :class="recentAverage >= 80 ? 'score-good' : recentAverage >= 50 ? 'score-mid' : 'score-low'">{{ recentAverage }}%</strong>
            </p>
            <p v-else>No attempts yet.</p>
          </div>
        </div>
        <span class="workspace-panel-icon">
          <i class="history icon"></i>
        </span>
      </div>

      <div v-if="quizHistory.length === 0" class="history-empty">
        No quiz attempts yet. <router-link to="/test">Take your first quiz.</router-link>
      </div>

      <table v-else class="ui very basic compact table history-table">
        <thead>
          <tr>
            <th><i class="calendar alternate outline icon"></i> Date &amp; time</th>
            <th class="center aligned"><i class="check square outline icon"></i> Score</th>
            <th class="center aligned"><i class="chart line icon"></i> Result</th>
            <th class="right aligned"><i class="cog icon"></i> Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(attempt, index) in quizHistory.slice(0, 5)" :key="index">
            <td>{{ formatDateTime(attempt.timestamp) }}</td>
            <td class="center aligned">
              {{ attempt.score }} / {{ attempt.total }}
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
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
// ── Trang Dashboard ──────────────────────────────────────────────────
// Hiển thị tổng quan: số từ, favourites, categories, lịch sử quiz gần đây
import { getWords, getCategories } from '../helpers/helpers';

export default {
  name: 'dashboard',
  data() {
    return {
      totalWords: 0,      // tổng số từ trong database
      favouriteCount: 0,  // số từ được đánh dấu yêu thích
      categoryCount: 0,   // tổng số category
      quizHistory: []     // lịch sử quiz từ localStorage
    };
  },
  computed: {
    // Điểm trung bình của 5 lần quiz gần nhất
    recentAverage() {
      const recentAttempts = this.quizHistory.slice(0, 5);
      if (!recentAttempts.length) return 0;
      let totalPercent = 0;
      for (let i = 0; i < recentAttempts.length; i++) {
        totalPercent += this.getScorePercent(recentAttempts[i]);
      }
      return Math.round(totalPercent / recentAttempts.length);
    }
  },
  // Khi mount: gọi API lấy words + categories, load quiz history từ localStorage
  async mounted() {
    try {
      const words = await getWords();
      const categories = await getCategories();
      this.totalWords = words.length;
      this.favouriteCount = words.filter(word => word.favourite).length;
      this.categoryCount = categories.length;
      try {
        this.quizHistory = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
      } catch (error) { this.quizHistory = []; }
    } catch (error) {
      this.flash('Failed to load dashboard data.', 'error');
    }
  },
  methods: {
    // Tính điểm % của 1 lần quiz
    getScorePercent(attempt) {
      if (!attempt.total) return 0;
      return Math.round((attempt.score / attempt.total) * 100);
    },
    // Trả về class màu dựa trên điểm số
    getScoreClass(attempt) {
      const percent = this.getScorePercent(attempt);
      if (percent >= 80) return 'green';
      if (percent >= 50) return 'orange';
      return 'red';
    },
    // Format timestamp thành chuỗi ngày giờ dễ đọc
    formatDateTime(isoString) {
      if (!isoString) return '\u2014';
      const date = new Date(isoString);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    },
    // Làm lại bài test với các từ sai của lần quiz cũ (qua URL query)
    retakeTest(attempt) {
      const ids = attempt.wrongWordIds && attempt.wrongWordIds.length
        ? attempt.wrongWordIds
        : attempt.wordIds;
      if (ids && ids.length) {
        this.$router.push({ path: '/test', query: { retake: ids.join(',') } });
      }
    }
  }
};
</script>

<style scoped>
/* Stat row */
.stat-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  margin-bottom: 1.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.35rem 1.6rem;
}
.stat-divider {
  width: 1px;
  background: #e2e8f0;
  flex: 0 0 1px;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.03em;
}
.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* History table */
.history-empty {
  color: #64748b;
  font-size: 0.88rem;
  padding: 0.5rem 0;
}
.history-table thead th {
  color: #64748b !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  padding-bottom: 0.7rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
.history-table tbody td {
  vertical-align: middle !important;
  color: #1e293b;
  font-size: 0.88rem;
}
.muted { color: #94a3b8; }
.score-good { color: #16a34a; font-weight: 700; }
.score-mid  { color: #ea580c; font-weight: 700; }
.score-low  { color: #dc2626; font-weight: 700; }
</style>
