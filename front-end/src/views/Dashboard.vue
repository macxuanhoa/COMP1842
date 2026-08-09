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
          Practice Now
        </router-link>
      </div>
    </header>

    <!-- Stat strip -->
    <div class="stat-row">
      <div class="stat-item">
        <div class="stat-item-head">
          <i class="book icon stat-icon-blue"></i>
          <span class="stat-label">Total Words</span>
        </div>
        <span class="stat-value">{{ totalWords }}</span>
      </div>

      <div class="stat-item">
        <div class="stat-item-head">
          <i class="star icon stat-icon-amber"></i>
          <span class="stat-label">Favourites</span>
        </div>
        <span class="stat-value">{{ favouriteCount }}</span>
      </div>

      <div class="stat-item">
        <div class="stat-item-head">
          <i class="tags icon stat-icon-green"></i>
          <span class="stat-label">Categories</span>
        </div>
        <span class="stat-value">{{ categoryCount }}</span>
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
        <span class="history-empty-icon"><i class="trophy icon"></i></span>
        <p>No quiz attempts yet.</p>
        <router-link to="/test" class="ui primary button icon labeled">
          <i class="play icon"></i> Take Your First Quiz
        </router-link>
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
import { getWords, getCategories, QUIZ_HISTORY_KEY } from '../helpers/helpers';

export default {
  name: 'dashboard',
  // Khởi tạo các trạng thái dữ liệu cho trang dashboard
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
        this.quizHistory = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
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
/* Stat strip — một panel phẳng, 3 ô ngăn cách bằng kẻ mờ */
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.25rem 1.5rem;
}

.stat-item + .stat-item {
  border-left: 1px solid #f1f5f9;
}

.stat-item-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.stat-item-head .icon {
  display: block;
  margin: 0 !important;
  font-size: 0.85rem;
  line-height: 1;
}

.stat-icon-blue { color: #2563eb; }
.stat-icon-amber { color: #d97706; }
.stat-icon-green { color: #059669; }

.stat-value {
  color: #0f172a;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
}

.stat-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* History table */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.25rem 1rem;
  background: #f8fafc;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  text-align: center;
}
.history-empty p {
  margin: 0 0 0.4rem;
}
.history-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fffbeb;
  color: #d97706;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}
.history-empty-icon .icon {
  display: block;
  margin: 0 !important;
  line-height: 1;
}
.history-table thead th {
  color: #64748b !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  padding-bottom: 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}
.history-table tbody td {
  vertical-align: middle !important;
  color: #334155;
  font-size: 0.875rem;
  padding: 0.75rem 0.5rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
}
.history-table tbody tr:hover td {
  background: #f8fafc !important;
}
.history-table tbody tr:last-child td {
  border-bottom: none !important;
}
.muted { color: #94a3b8; }

@media (max-width: 767px) {
  .stat-row {
    grid-template-columns: 1fr;
  }
}
.score-good { 
  color: #16a34a; 
  font-weight: 600; 
  background: #f0fdf4;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
}
.score-mid  { 
  color: #ea580c; 
  font-weight: 600; 
  background: #fff7ed;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
}
.score-low  { 
  color: #dc2626; 
  font-weight: 600; 
  background: #fef2f2;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
}
</style>
