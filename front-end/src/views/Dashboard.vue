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
      <div class="workspace-header__actions">
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
              <span class="ui label" :class="scoreClass(attempt)">{{ percent(attempt) }}%</span>
            </td>
            <td class="right aligned">
              <button
                v-if="attempt.wordIds && attempt.wordIds.length"
                class="ui basic primary mini button"
                @click="retakeQuiz(attempt)"
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
      totalWords: 0,
      favouriteCount: 0,
      categoryCount: 0,
      quizHistory: []
    };
  },
  computed: {
    recentAverage() {
      const recent = this.quizHistory.slice(0, 5);
      if (!recent.length) return 0;
      const sum = recent.reduce((acc, a) => acc + this.percent(a), 0);
      return Math.round(sum / recent.length);
    }
  },
  async mounted() {
    try {
      const words = await getWords();
      const categories = await getCategories();
      this.totalWords = words.length;
      this.favouriteCount = words.filter(w => w.favourite).length;
      this.categoryCount = categories.length;
      try {
        this.quizHistory = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
      } catch (e) {
        this.quizHistory = [];
      }
    } catch (e) {
      console.error(e);
      this.flash('Failed to load dashboard data.', 'error');
    }
  },
  methods: {
    percent(attempt) {
      if (!attempt.total) return 0;
      return Math.round((attempt.score / attempt.total) * 100);
    },
    scoreClass(attempt) {
      const p = this.percent(attempt);
      if (p >= 80) return 'green';
      if (p >= 50) return 'orange';
      return 'red';
    },
    formatDateTime(isoString) {
      if (!isoString) return '—';
      const d = new Date(isoString);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const day = d.getDate(), month = months[d.getMonth()], year = d.getFullYear();
      const h = String(d.getHours()).padStart(2, '0'), m = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${h}:${m}`;
    },
    retakeQuiz(attempt) {
      if (attempt.wordIds && attempt.wordIds.length) {
        sessionStorage.setItem('retake_word_ids', JSON.stringify(attempt.wordIds));
        this.$router.push('/test');
      }
    }
  }
};
</script>
