<template>
  <div class="workspace-page workspace-page-narrow">
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
            <select class="ui dropdown fluid" v-model="selectedCategory">
              <option value="">Choose a category…</option>
              <option v-for="categoryName in categories" :key="categoryName" :value="categoryName">
                {{ categoryName }} ({{ words.filter(word => word.category === categoryName).length }} words)
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
import { getWords, getCategoryNames } from '../helpers/helpers';
import VocabTest from '../components/VocabTest.vue';

export default {
  name: 'test',
  components: {
    'vocab-test': VocabTest
  },
  data() {
    return {
      words: [], // Danh sách từ.
      categories: [], // Danh sách category.
      questionLanguage: 'german', // Ngôn ngữ hỏi.
      answerLanguage: 'english', // Ngôn ngữ đáp án.
      selectedWordSet: 'all', // Kiểu chọn bộ từ.
      selectedCategory: '', // Category đang chọn.
      selectedQuestionCount: 'all', // Số câu hỏi.
      customQuestionCount: 5, // Số câu tự nhập.
      isSessionActive: false, // Trạng thái làm bài.
      testWords: [] // Bộ từ của phiên test.
    };
  },
  computed: {
    favouriteWordCount() {
      // Dùng `this.words` để đếm nhanh số từ favourite và hiển thị cạnh option "Favourites only".
      return this.words.filter(word => word.favourite).length;
    },
    availableWords() {
      if (this.selectedWordSet === 'fav') {
        return this.words.filter(word => word.favourite);
      }

      if (this.selectedWordSet === 'category') {
        if (!this.selectedCategory) return [];

        return this.words.filter(
          word => word.category === this.selectedCategory
        );
      }

      return this.words;
    },
    availableWordCount() {
      // Lấy độ dài của `availableWords` để biết hiện tại có bao nhiêu từ khả dụng cho bài test.
      return this.availableWords.length;
    },
    questionSizeOptions() {
      // Lọc các mốc 5, 10, 20 theo `availableWordCount` để dropdown chỉ hiện option hợp lệ.
      return [5, 10, 20].filter(count => count <= this.availableWordCount);
    },
    hasValidQuestionCount() {
      // Nếu không dùng custom thì xem như hợp lệ ngay.
      if (this.selectedQuestionCount !== 'custom' || this.selectedWordSet === 'category') return true;

      // Khi dùng custom, kiểm tra `customQuestionCount` có phải số hợp lệ, không nhỏ hơn 5 và không vượt quá số từ đang có.
      const enteredQuestionCount = Number(this.customQuestionCount);
      return Number.isFinite(enteredQuestionCount) && enteredQuestionCount >= 5 && enteredQuestionCount <= this.availableWordCount;
    }
  },
  watch: {
    availableWordCount(newMax) {
      // Khi bộ lọc đổi làm số từ giảm xuống, ép `customQuestionCount` về mức tối đa mới để tránh chọn quá số từ hiện có.
      if (Number(this.customQuestionCount) > newMax) this.customQuestionCount = newMax;
    },
    customQuestionCount(newValue) {
      // Nếu ô custom bị nhập sai kiểu dữ liệu, đưa giá trị về mức an toàn để form không bị lỗi.
      const enteredQuestionCount = Number(newValue);
      if (!Number.isFinite(enteredQuestionCount)) this.customQuestionCount = Math.min(5, this.availableWordCount || 5);
    }
  },
  async mounted() {
    try {
      this.words = await getWords();
      this.categories = await getCategoryNames();

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
      console.error(error);
    }
  },
  methods: {
    onQuestionLanguageChange() {
      // Nếu `questionLanguage` trùng `answerLanguage`, tự đổi `answerLanguage` sang ngôn ngữ khác để câu hỏi và đáp án không bị trùng nhau.
      if (this.questionLanguage === this.answerLanguage) {
        this.answerLanguage = this.questionLanguage === 'german' ? 'english' : 'german';
      }
    },
    onAnswerLanguageChange() {
      // Xử lý ngược lại cho dropdown đáp án: nếu bị trùng thì đổi `questionLanguage`.
      if (this.answerLanguage === this.questionLanguage) {
        this.questionLanguage = this.answerLanguage === 'german' ? 'english' : 'german';
      }
    },
    startTest() {
      // Bắt đầu từ `availableWords`, tính ra số câu cần lấy, trộn ngẫu nhiên rồi lưu kết quả vào `testWords`.
      let questionLimit = this.availableWordCount;

      // Nếu không phải mode category thì đọc thêm `selectedQuestionCount` hoặc `customQuestionCount` để chốt số câu.
      if (this.selectedWordSet !== 'category') {
        if (this.selectedQuestionCount === 'custom') {
          questionLimit = Number(this.customQuestionCount);
        } else if (this.selectedQuestionCount !== 'all') {
          questionLimit = Number(this.selectedQuestionCount);
        }
      }

      // Chuẩn hóa `questionLimit` để không âm, không NaN và không vượt quá số từ hiện có.
      if (!Number.isFinite(questionLimit) || questionLimit < 1) questionLimit = this.availableWordCount;
      questionLimit = Math.min(questionLimit, this.availableWordCount);

      const randomWords = [...this.availableWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, questionLimit);

      // Lưu bộ từ đã chốt vào `testWords` và bật `isSessionActive` để render component `VocabTest`.
      this.testWords = randomWords;
      this.isSessionActive = true;
    },
    exitTest() {
      // Khi thoát bài test, tắt trạng thái làm bài và xóa `testWords` để quay về màn setup.
      this.isSessionActive = false;
      this.testWords = [];
    }
  }
};
</script>
