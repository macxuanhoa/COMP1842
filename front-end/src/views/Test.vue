<template>
  <div class="workspace-page">
    <div v-if="!isSessionActive"> <!-- Nếu chưa bắt đầu bài test -> setup -->
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

      <section class="ui segment workspace-panel session-setup-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-title">
            <span class="workspace-panel-icon green">
              <i class="cog icon"></i>
            </span>
            <div>
              <h2>Session Setup</h2>
              <p>Configure language direction, word scope, and question count.</p>
            </div>
          </div>
        </div>

        <div class="setup-grid">
          <!-- Step 1: Language Direction -->
          <div class="setup-section">
            <div class="setup-section-title">
              <span>Language Pair</span>
            </div>

            <div class="language-pair-container">
              <div class="language-box">
                <label for="q-lang">Question Language</label>
                <select
                  id="q-lang"
                  class="setup-select"
                  v-model="questionLanguage"
                  @change="onQuestionLanguageChange"
                >
                  <option value="german">German (DE)</option>
                  <option value="english">English (EN)</option>
                  <option value="french">French (FR)</option>
                </select>
              </div>

              <button
                type="button"
                class="swap-lang-btn"
                title="Swap Question and Answer languages"
                @click="swapLanguages"
              >
                <i class="exchange icon"></i>
              </button>

              <div class="language-box">
                <label for="a-lang">Answer Language</label>
                <select
                  id="a-lang"
                  class="setup-select"
                  v-model="answerLanguage"
                  @change="onAnswerLanguageChange"
                >
                  <option value="german">German (DE)</option>
                  <option value="english">English (EN)</option>
                  <option value="french">French (FR)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 2: Word Set Scope -->
          <div class="setup-section">
            <div class="setup-section-title">
              <span>Word Set Scope</span>
            </div>

            <div class="word-set-cards">
              <div
                class="word-set-card"
                :class="{ active: selectedWordSet === 'all' }"
                @click="selectedWordSet = 'all'"
              >
                <div class="card-icon"><i class="book icon"></i></div>
                <div class="card-info">
                  <strong>All Words</strong>
                  <span>{{ words.length }} words available</span>
                </div>
              </div>

              <div
                class="word-set-card"
                :class="{ active: selectedWordSet === 'fav' }"
                @click="selectedWordSet = 'fav'"
              >
                <div class="card-icon yellow"><i class="star icon"></i></div>
                <div class="card-info">
                  <strong>Favourites Only</strong>
                  <span>{{ favouriteWordCount }} words starred</span>
                </div>
              </div>

              <div
                class="word-set-card"
                :class="{ active: selectedWordSet === 'category' }"
                @click="selectedWordSet = 'category'"
              >
                <div class="card-icon blue"><i class="tag icon"></i></div>
                <div class="card-info">
                  <strong>By Category</strong>
                  <span>{{ categories.length }} categories</span>
                </div>
              </div>
            </div>

            <!-- Category dropdown if selected -->
            <transition name="slide-fade">
              <div v-if="selectedWordSet === 'category'" class="category-select-sub">
                <label><i class="tag icon"></i> Select Category</label>
                <select class="setup-select" v-model="selectedCategoryId">
                  <option value="">Choose a category…</option>
                  <option v-for="category in categories" :key="category._id" :value="category._id">
                    {{ category.name }} ({{ words.filter(word => word.category && word.category._id === category._id).length }} words)
                  </option>
                </select>
              </div>
            </transition>
          </div>

          <!-- Step 3: Question Count -->
          <div class="setup-section" v-if="selectedWordSet !== 'category'">
            <div class="setup-section-title">
              <span>Number of Questions</span>
            </div>

            <div class="question-count-row">
              <div class="question-chips">
                <button
                  type="button"
                  class="chip-btn"
                  :class="{ active: selectedQuestionCount === 'all' }"
                  @click="selectedQuestionCount = 'all'"
                >
                  All ({{ availableWordCount }})
                </button>

                <button
                  v-for="count in questionSizeOptions"
                  :key="count"
                  type="button"
                  class="chip-btn"
                  :class="{ active: selectedQuestionCount === count }"
                  @click="selectedQuestionCount = count"
                >
                  {{ count }} Questions
                </button>

                <button
                  type="button"
                  class="chip-btn"
                  :class="{ active: selectedQuestionCount === 'custom' }"
                  @click="selectedQuestionCount = 'custom'"
                >
                  Custom…
                </button>
              </div>

              <div v-if="selectedQuestionCount === 'custom'" class="custom-count-field">
                <input
                  id="custom-count"
                  type="number"
                  aria-label="Custom question amount"
                  v-model.number="customQuestionCount"
                  placeholder="5"
                  min="5"
                  :max="availableWordCount"
                />
                <span class="custom-count-hint">of {{ availableWordCount }} available</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning notices -->
        <div v-if="availableWordCount === 0" class="ui warning message setup-warning">
          <i class="attention icon"></i>
          No words available in this selection. Add some words or select another scope first.
        </div>
        <div v-else-if="availableWordCount < 5" class="ui warning message setup-warning">
          <i class="attention icon"></i>
          You need at least 5 words to start a test. Currently only {{ availableWordCount }} available in this scope.
        </div>

        <!-- Action CTA -->
        <div class="setup-footer">
          <button
            class="ui primary large button icon labeled start-test-btn"
            :disabled="availableWordCount < 5 || !hasValidQuestionCount"
            @click="startTest"
          >
            <i class="play icon"></i> Start Test Session
          </button>
        </div>
      </section>
    </div>

    <div v-else>
      <vocab-test
        :key="sessionKey"
        :words="testWords"
        :question-language="questionLanguage"
        :answer-language="answerLanguage"
        @exitTest="exitTest"
        @retakeWrong="retakeWrongAnswers"
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
      words: [],                  // Danh sách tất cả từ vựng
      categories: [],             // Danh sách tất cả danh mục
      questionLanguage: 'german', // Ngôn ngữ câu hỏi
      answerLanguage: 'english',  // Ngôn ngữ trả lời
      selectedWordSet: 'all',     // 'all' | 'fav' | 'category'
      selectedCategoryId: '',     // Category ID khi selectedWordSet = 'category'
      selectedQuestionCount: 'all', // 'all', 5, 10, 20, 'custom'
      customQuestionCount: 5,     // Số câu tùy chỉnh
      isSessionActive: false,     // Phiên test đang chạy
      testWords: [],              // Các từ được chọn cho bài test
      sessionKey: 0               // Key để reset VocabTest
    };
  },
  computed: {
    favouriteWordCount() {
      return this.words.filter(word => word.favourite).length;
    },
    selectedWords() {
      if (this.selectedWordSet === 'all') return this.words;
      if (this.selectedWordSet === 'fav') return this.words.filter(word => word.favourite);
      if (!this.selectedCategoryId) return [];
      return this.words.filter(word => word.category && word.category._id === this.selectedCategoryId);
    },
    availableWordCount() {
      return this.selectedWords.length;
    },
    questionSizeOptions() {
      return [5, 10, 20].filter(count => count <= this.availableWordCount);
    },
    hasValidQuestionCount() {
      if (this.selectedQuestionCount !== 'custom' || this.selectedWordSet === 'category') return true;
      const enteredQuestionCount = Number(this.customQuestionCount);
      return Number.isInteger(enteredQuestionCount) && enteredQuestionCount >= 5 && enteredQuestionCount <= this.availableWordCount;
    }
  },
  watch: {
    availableWordCount(newMax) {
      this.customQuestionCount = newMax;
    }
  },
  async mounted() {
    try {
      this.words = await getWords();
      this.categories = await getCategories();

      const retakeParam = this.$route.query.retake;
      if (retakeParam) {
        const retakeWordIds = retakeParam.split(',');
        const retakeWords = this.words.filter(word => retakeWordIds.includes(word._id));
        if (retakeWords.length > 0) {
          this.testWords = retakeWords;
          this.isSessionActive = true;
        }
      }
    } catch {
      this.flash('Failed to load test data.', 'error');
    }
  },
  methods: {
    swapLanguages() {
      const temp = this.questionLanguage;
      this.questionLanguage = this.answerLanguage;
      this.answerLanguage = temp;
    },
    onQuestionLanguageChange() {
      if (this.questionLanguage === this.answerLanguage) {
        this.answerLanguage = this.randomLanguageExcluding(this.questionLanguage);
      }
    },
    onAnswerLanguageChange() {
      if (this.answerLanguage === this.questionLanguage) {
        this.questionLanguage = this.randomLanguageExcluding(this.answerLanguage);
      }
    },
    // Chọn ngẫu nhiên 1 trong 2 ngôn ngữ khác ngôn ngữ bị loại
    randomLanguageExcluding(excluded) {
      const options = ['german', 'english', 'french'].filter(lang => lang !== excluded);
      return options[Math.floor(Math.random() * options.length)];
    },
    shuffleArray(array) {
      for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
      }
      return array;
    },
    startTest() {
      let questionLimit = this.availableWordCount;

      if (this.selectedWordSet !== 'category') {
        if (this.selectedQuestionCount === 'custom') {
          questionLimit = Number(this.customQuestionCount);
        } else if (this.selectedQuestionCount !== 'all') {
          questionLimit = Number(this.selectedQuestionCount);
        }
      }

      questionLimit = Math.min(questionLimit, this.availableWordCount);

      const shuffledWords = this.shuffleArray([...this.selectedWords]);
      this.testWords = shuffledWords.slice(0, questionLimit);
      this.isSessionActive = true;
    },
    retakeWrongAnswers(wrongWordIds) {
      const retakeWords = this.words.filter(word => wrongWordIds.includes(word._id));
      if (retakeWords.length > 0) {
        this.testWords = retakeWords;
      }
    },
    exitTest() {
      this.isSessionActive = false;
      this.testWords = [];
      if (this.$route.query.retake) {
        this.$router.replace({ path: '/test' });
      }
    }
  }
};
</script>

<style scoped>
.session-setup-panel {
  padding: 0 !important;
  overflow: hidden;
}

.session-setup-panel .workspace-panel-heading {
  margin-bottom: 0;
  padding: 1.35rem 1.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.setup-grid {
  counter-reset: setup-step;
  display: flex;
  flex-direction: column;
}

.setup-section {
  padding: 1.35rem 1.75rem;
}

.setup-section + .setup-section {
  border-top: 1px solid #f1f5f9;
}

.setup-section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
}

.setup-section-title::before {
  counter-increment: setup-step;
  content: '0' counter(setup-step);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0;
}

/* Language Pair */
.language-pair-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
}

.language-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.language-box label {
  color: #334155;
  font-size: 0.8rem;
  font-weight: 500;
}

.setup-select {
  display: block;
  width: 100%;
  padding: 0.65rem 0.8rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 500;
}

.setup-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.swap-lang-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  padding: 0.65rem 0;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.swap-lang-btn:hover {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #f8fafc;
}

.swap-lang-btn .icon {
  margin: 0 !important;
  line-height: 1;
}

/* Scope Cards */
.word-set-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.word-set-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.word-set-card:hover {
  border-color: #94a3b8;
}

.word-set-card.active {
  border-color: #0f172a;
  background: #ffffff;
  box-shadow: none;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.95rem;
  flex: 0 0 auto;
}

.card-icon.yellow {
  background: #fffbeb;
  color: #d97706;
}

.card-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}

.card-icon .icon {
  display: block;
  margin: 0 !important;
  line-height: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.card-info strong {
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
}

.card-info span {
  color: #64748b;
  font-size: 0.78rem;
}

.category-select-sub {
  margin-top: 0.85rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
}

.category-select-sub label {
  display: block;
  margin-bottom: 0.4rem;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
}

/* Question Chips — segmented control trải đều trong panel */
.question-count-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  width: 100%;
  padding: 0.9rem 1rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
}

.question-chips {
  display: flex;
  flex: 1 1 auto;
  gap: 0.25rem;
  padding: 0.3rem;
  background: #e8edf4;
  border-radius: 10px;
}

.chip-btn {
  flex: 1 1 auto;
  padding: 0.5rem 0.9rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.chip-btn:hover {
  color: #0f172a;
}

.chip-btn.active {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
}

.custom-count-field {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 0 0 auto;
}

.custom-count-field input {
  width: 110px;
  padding: 0.55rem 0.75rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
}

.custom-count-field input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.custom-count-hint {
  color: #94a3b8;
  font-size: 0.78rem;
}

.setup-warning {
  margin: 0 1.75rem 1.5rem !important;
}

/* Footer CTA */
.setup-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.start-test-btn {
  margin: 0 !important;
  padding: 0.75rem 1.6rem !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
}

.start-test-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .setup-section {
    padding: 1.25rem;
  }
  .language-pair-container {
    grid-template-columns: 1fr;
  }
  .swap-lang-btn {
    margin: 0 auto;
  }
  .word-set-cards {
    grid-template-columns: 1fr;
  }
  .setup-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .setup-warning {
    margin: 0 1.25rem 1.25rem !important;
  }
}
</style>
