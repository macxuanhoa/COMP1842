<template>
  <div class="workspace-page">
    <div v-if="!isSessionActive">
      <header class="workspace-header">
        <div>
          <div class="workspace-eyebrow">
            <i class="graduation cap icon"></i>
            Practice workspace
          </div>
          <h1>Vocabulary Test</h1>
          <p>Test your translation skills with your saved vocabulary.</p>
        </div>
        <div class="workspace-header-actions">
          <router-link to="/words" class="ui basic primary button">
            <i class="book open icon"></i>
            Open Library
          </router-link>
        </div>
      </header>

      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-title">
            <span class="workspace-panel-icon green" aria-hidden="true">
              <i class="sliders horizontal icon"></i>
            </span>
            <div>
              <h2>Session setup</h2>
              <p>Choose language, word set, and number of questions.</p>
            </div>
          </div>
        </div>

        <div class="ui form">
          <div class="field">
            <label>Question Language</label>
            <select class="ui dropdown fluid" v-model="questionLanguage" @change="onQuestionLanguageChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>
          <div class="field">
            <label>Answer Language</label>
            <select class="ui dropdown fluid" v-model="answerLanguage" @change="onAnswerLanguageChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>

          <div class="field">
            <label>Word set</label>
            <select class="ui dropdown fluid" v-model="selectedWordSet">
              <option value="all">All words ({{ words.length }})</option>
              <option value="fav">Favourites only ({{ favouriteWordCount }})</option>
              <option value="category">By category</option>
            </select>
          </div>

          <div v-if="selectedWordSet === 'category'" class="field">
            <label>Category</label>
            <select class="ui dropdown fluid" v-model="selectedCategoryId">
              <option value="">Choose a category…</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }} ({{ words.filter(word => word.category._id === category._id).length }} words)
              </option>
            </select>
          </div>

          <div v-if="selectedWordSet !== 'category'" class="field">
            <label>Number of questions</label>
            <select class="ui dropdown fluid" v-model="selectedQuestionCount">
              <option value="all">All ({{ availableWordCount }} words)</option>
              <option v-for="count in questionSizeOptions" :key="count" :value="count">{{ count }} questions</option>
              <option value="custom">Custom…</option>
            </select>
          </div>

          <div v-if="selectedQuestionCount === 'custom' && selectedWordSet !== 'category'" class="field">
            <label>Custom amount</label>
            <input
              type="number"
              min="1"
              :max="availableWordCount"
              v-model.number="customQuestionCount"
              placeholder="Enter a number"
            />
          </div>

          <button
            class="ui primary fluid large button icon labeled"
            :disabled="availableWordCount < 5 || !hasValidQuestionCount"
            @click="startTest"
          >
            <i class="play icon"></i> Start Test
          </button>
        </div>

        <div v-if="availableWordCount === 0" class="ui warning message">
          <i class="attention icon"></i>
          No words available in this selection. Add some words first.
        </div>
        <div v-else-if="availableWordCount < 5" class="ui warning message">
          <i class="attention icon"></i>
          You need at least 5 words. Currently only {{ availableWordCount }} available.
        </div>
      </section>
    </div>

    <div v-else>
      <vocab-test
        :words="testWords"
        :question-language="questionLanguage"
        :answer-language="answerLanguage"
        @exitTest="exitTest"
      ></vocab-test>
    </div>
  </div>
</template>

<script>
// ── Trang thiết lập quiz ─────────────────────────────────────────────
// Chọn ngôn ngữ hỏi/đáp, bộ từ, số câu hỏi → khởi động VocabTest
import { getWords, getCategories } from '../helpers/helpers';
import VocabTest from '../components/VocabTest.vue';

export default {
  name: 'test',
  components: { 'vocab-test': VocabTest },
  data() {
    return {
      words: [],                  // tất cả từ trong database
      categories: [],             // tất cả category
      questionLanguage: 'german', // ngôn ngữ câu hỏi (mặc định: hỏi tiếng Đức)
      answerLanguage: 'english',  // ngôn ngữ trả lời (mặc định: trả lời tiếng Anh)
      selectedWordSet: 'all',     // bộ từ: 'all' | 'fav' | 'category'
      selectedCategoryId: '',       // category đã chọn (khi wordSet = 'category')
      selectedQuestionCount: 'all', // số câu: 'all' | 5 | 10 | 20 | 'custom'
      customQuestionCount: 5,     // số câu tùy chỉnh
      isSessionActive: false,     // đang trong phiên quiz
      testWords: []               // danh sách từ đưa vào quiz
    };
  },
  computed: {
    // Số từ được đánh dấu yêu thích
    favouriteWordCount() {
      return this.words.filter(word => word.favourite).length;
    },
    availableWords() {
      if (this.selectedWordSet === 'all') return this.words;
      if (this.selectedWordSet === 'fav') return this.words.filter(word => word.favourite);
      if (this.selectedWordSet === 'category') {
        if (!this.selectedCategoryId) return [];
        return this.words.filter(
          word => word.category._id === this.selectedCategoryId
        );
      }
      return this.words;
    },
    availableWordCount() {
      return this.availableWords.length;
    },
    // Các lựa chọn số câu hỏi preset
    questionSizeOptions() {
      return [5, 10, 20].filter(count => count <= this.availableWordCount);
    },
    // Kiểm tra số câu hỏi nhập vào có hợp lệ không
    hasValidQuestionCount() {
      if (this.selectedQuestionCount !== 'custom' || this.selectedWordSet === 'category') return true;
      const enteredQuestionCount = Number(this.customQuestionCount);
      return Number.isFinite(enteredQuestionCount) && enteredQuestionCount >= 5 && enteredQuestionCount <= this.availableWordCount;
    }
  },
  watch: {
    // Nếu số từ khả dụng giảm → điều chỉnh customQuestionCount
    availableWordCount(newMax) {
      if (Number(this.customQuestionCount) > newMax) {
        this.customQuestionCount = newMax;
      }
    },
    customQuestionCount(newValue) {
      const enteredQuestionCount = Number(newValue);
      if (!Number.isFinite(enteredQuestionCount)) {
        this.customQuestionCount = Math.min(5, this.availableWordCount || 5);
      }
    }
  },
  // Khi mount: load words + categories, kiểm tra retake từ Dashboard
  async mounted() {
    try {
      this.words = await getWords();
      this.categories = await getCategories();

      const retakeIds = sessionStorage.getItem('retake_word_ids');
      if (retakeIds) {
        sessionStorage.removeItem('retake_word_ids');
        const retakeWordIds = JSON.parse(retakeIds);
        const retakeWords = this.words.filter(word => retakeWordIds.includes(word._id));
        if (retakeWords.length > 0) {
          this.testWords = retakeWords;
          this.isSessionActive = true;
        }
      }
    } catch (error) {
      this.flash('Failed to load test data.', 'error');
    }
  },
  methods: {
    // Đảm bảo 2 ngôn ngữ hỏi/đáp không trùng nhau
    onQuestionLanguageChange() {
      if (this.questionLanguage === this.answerLanguage) {
        this.answerLanguage = this.questionLanguage === 'german' ? 'english' : 'german';
      }
    },
    onAnswerLanguageChange() {
      if (this.answerLanguage === this.questionLanguage) {
        this.questionLanguage = this.answerLanguage === 'german' ? 'english' : 'german';
      }
    },
    // Khởi động quiz: chọn ngẫu nhiên số câu hỏi từ danh sách từ khả dụng
    startTest() {
      let questionLimit = this.availableWordCount;
      if (this.selectedWordSet !== 'category') {
        if (this.selectedQuestionCount === 'custom') {
          questionLimit = Number(this.customQuestionCount);
        } else if (this.selectedQuestionCount !== 'all') {
          questionLimit = Number(this.selectedQuestionCount);
        }
      }
      if (!Number.isFinite(questionLimit) || questionLimit < 1) {
        questionLimit = this.availableWordCount;
      }
      questionLimit = Math.min(questionLimit, this.availableWordCount);

      const randomWords = [...this.availableWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, questionLimit);
      this.testWords = randomWords;
      this.isSessionActive = true;
    },
    // Thoát quiz, quay về màn hình thiết lập
    exitTest() {
      this.isSessionActive = false;
      this.testWords = [];
    }
  }
};
</script>
