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
              <i class="sliders horizontal icon"></i>
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
              <i class="language icon"></i>
              <span>Language Pair</span>
            </div>

            <div class="language-pair-container">
              <div class="language-box">
                <label for="q-lang">Question Language</label>
                <div class="ui icon input fluid">
                  <select
                    id="q-lang"
                    class="ui dropdown fluid setup-select"
                    v-model="questionLanguage"
                    @change="onQuestionLanguageChange"
                  >
                    <option value="german">🇩🇪 German (DE)</option>
                    <option value="english">🇬🇧 English (EN)</option>
                    <option value="french">🇫🇷 French (FR)</option>
                  </select>
                </div>
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
                <div class="ui icon input fluid">
                  <select
                    id="a-lang"
                    class="ui dropdown fluid setup-select"
                    v-model="answerLanguage"
                    @change="onAnswerLanguageChange"
                  >
                    <option value="german">🇩🇪 German (DE)</option>
                    <option value="english">🇬🇧 English (EN)</option>
                    <option value="french">🇫🇷 French (FR)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Word Set Scope -->
          <div class="setup-section">
            <div class="setup-section-title">
              <i class="layer group icon"></i>
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
                <select class="ui dropdown fluid setup-select" v-model="selectedCategoryId">
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
              <i class="list ol icon"></i>
              <span>Number of Questions</span>
            </div>

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

            <div v-if="selectedQuestionCount === 'custom'" class="custom-count-sub">
              <label>Custom Question Amount</label>
              <input
                type="number"
                class="ui input"
                v-model.number="customQuestionCount"
                placeholder="Enter question amount"
                min="5"
                :max="availableWordCount"
              />
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

        <!-- Summary & Action CTA -->
        <div class="setup-footer">
          <div class="session-summary-badge" v-if="availableWordCount >= 5">
            <i class="info circle icon"></i>
            <span>
              Configured: <strong>{{ langName(questionLanguage) }}</strong> &rarr; <strong>{{ langName(answerLanguage) }}</strong> | 
              <strong>{{ effectiveQuestionCount }} questions</strong>
            </span>
          </div>

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
    },
    effectiveQuestionCount() {
      if (this.selectedWordSet === 'category') return this.availableWordCount;
      if (this.selectedQuestionCount === 'custom') return Number(this.customQuestionCount) || 0;
      if (this.selectedQuestionCount === 'all') return this.availableWordCount;
      return Number(this.selectedQuestionCount);
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
    langName(code) {
      const names = { german: 'German', english: 'English', french: 'French' };
      return names[code] || code;
    },
    swapLanguages() {
      const temp = this.questionLanguage;
      this.questionLanguage = this.answerLanguage;
      this.answerLanguage = temp;
    },
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
  padding: 1.75rem !important;
}

.setup-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setup-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.setup-section-title .icon {
  margin: 0 !important;
  color: #0284c7;
}

/* Step 1: Language Pair */
.language-pair-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.language-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.language-box label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.setup-select {
  border-color: #cbd5e1 !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}

.swap-lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0284c7;
  cursor: pointer;
  margin-top: 1.25rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.swap-lang-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  transform: rotate(180deg);
}

/* Step 2: Scope Cards */
.word-set-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.word-set-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.word-set-card:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.word-set-card.active {
  border-color: #0f172a;
  background: #f8fafc;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-size: 1rem;
  flex: 0 0 auto;
}

.card-icon.yellow {
  background: #fffbeb;
  color: #d97706;
}

.card-icon.blue {
  background: #f0f9ff;
  color: #0284c7;
}

.card-icon .icon {
  margin: 0 !important;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info strong {
  font-size: 0.9rem;
  color: #0f172a;
}

.card-info span {
  font-size: 0.78rem;
  color: #64748b;
}

.category-select-sub {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.category-select-sub label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.45rem;
}

/* Step 3: Question Chips */
.question-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.chip-btn {
  padding: 0.55rem 1.1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background: #f8fafc;
  border-color: #0f172a;
}

.chip-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.custom-count-sub {
  margin-top: 0.75rem;
  max-width: 260px;
}

.custom-count-sub label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
}

.setup-warning {
  margin-top: 1.5rem !important;
}

/* Step 4: Footer CTA */
.setup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.session-summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.95rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  color: #0369a1;
  font-size: 0.85rem;
}

.session-summary-badge .icon {
  margin: 0 !important;
}

.start-test-btn {
  margin: 0 !important;
  padding: 0.85rem 1.75rem !important;
  font-size: 0.98rem !important;
  border-radius: 8px !important;
}

@media (max-width: 640px) {
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
}
</style>
