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

      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-title">
            <span class="workspace-panel-icon green">
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
              <option v-for="category in categories" :key="category._id" :value="category._id"> <!-- Ban đầu: selectedCategoryId: '' -> Choose a category… -->
                {{ category.name }} ({{ words.filter(word => word.category._id === category._id).length }} words)
              </option>
            </select>
          </div>

          <div v-if="selectedWordSet !== 'category'" class="field"> <!-- là All và fav -->
            <label>Number of questions</label>
            <select class="ui dropdown fluid" v-model="selectedQuestionCount">
              <option value="all">All ({{ availableWordCount }} words)</option>
              <option v-for="count in questionSizeOptions" :key="count" :value="count">{{ count }} questions</option>
              <option value="custom">Custom…</option>
            </select>
          </div>

          <div v-if="selectedQuestionCount === 'custom'" class="field">
            <label>Custom amount</label>
            <input
              type="number"
              v-model.number="customQuestionCount"
              placeholder="Enter a number"
            />
          </div>
          
          <!-- Nút sẽ bị khóa khi: Có ít hơn 5 từ hoặc số câu hỏi nhập vào không hợp lệ -->
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
      words: [],                  // tất cả từ trong database
      categories: [],             // tất cả category
      questionLanguage: 'german', // ngôn ngữ câu hỏi (mặc định: hỏi tiếng Đức)
      answerLanguage: 'english',  // ngôn ngữ trả lời (mặc định: trả lời tiếng Anh)
      selectedWordSet: 'all',     // bộ từ: 'all' | 'fav' | 'category'
      selectedCategoryId: '',       // category đã chọn (khi wordSet = 'category')
      selectedQuestionCount: 'all', // số câu: 'all' | 5 | 10 | 20 | 'custom'
      customQuestionCount: 5,     // số câu tùy chỉnh
      isSessionActive: false,     // đang trong phiên quiz
      testWords: [],              // danh sách từ đưa vào quiz
      sessionKey: 0               // key để force re-mount VocabTest khi retake
    };
  },
  computed: {
    // Số từ được đánh dấu yêu thích
    favouriteWordCount() { 
      return this.words.filter(word => word.favourite).length;
    },
    selectedWords() { //1
      if (this.selectedWordSet === 'all') return this.words; // Nếu chọn All words -> trả về tất cả từ
      if (this.selectedWordSet === 'fav') return this.words.filter(word => word.favourite); // Nếu chọn Favourites only -> trả về các từ favourite
      if (!this.selectedCategoryId) return []; // Nếu chọn By category nhưng chưa chọn category cụ thể -> trả về mảng rỗng, selectedCategoryId = '' --> hasvalidQuestionCount = false --> nút Start Test bị khóa
      return this.words.filter(word => word.category._id === this.selectedCategoryId); // Nếu chọn By category -> lọc từ theo category đã chọn
    },
    availableWordCount() { //2
      return this.selectedWords.length;
    },
    // Các lựa chọn số câu hỏi preset
    questionSizeOptions() {
      return [5, 10, 20].filter(count => count <= this.availableWordCount);
    },
    // Kiểm tra số câu hỏi nhập vào có hợp lệ không
    hasValidQuestionCount() { 
      if (this.selectedQuestionCount !== 'custom' || this.selectedWordSet === 'category') return true; // Nếu không có trường tự điền thì không cần kiểm tra số tự nhập
      const enteredQuestionCount = Number(this.customQuestionCount);
      return Number.isInteger(enteredQuestionCount) && enteredQuestionCount >= 5 && enteredQuestionCount <= this.availableWordCount; //Dòng này trả về true khi cả 3 điều kiện đều đúng
    }
  },
  watch: { //selectedWords 1/3, ex: all= có 10 từ --> availableWordCount = 10 --> đổi sang fav = 3 từ --> availableWordCount = 3 --> 
    availableWordCount(newMax) { 
        this.customQuestionCount = newMax;
    }
  },
  // Khi mount: load words + categories, kiểm tra retake từ URL query
  async mounted() {
    try {
      this.words = await getWords();
      this.categories = await getCategories();

      // Đọc danh sách ID từ URL query (?retake=id1,id2,id3)
      const retakeParam = this.$route.query.retake;
      if (retakeParam) {
        const retakeWordIds = retakeParam.split(',');
        const retakeWords = this.words.filter(word => retakeWordIds.includes(word._id));
        if (retakeWords.length > 0) {
          this.testWords = retakeWords; //Đưa các từ đó vào bài test
          this.isSessionActive = true;
        }
      }
    } catch {
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
    // ── Fisher-Yates shuffle: xáo trộn mảng với độ ngẫu nhiên công bằng ─
    shuffleArray(array) {
      for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
      }
      return array;
    },

    // Khởi động quiz: chọn ngẫu nhiên số câu hỏi từ danh sách từ khả dụng
    startTest() {
      let questionLimit = this.availableWordCount;

      if (this.selectedWordSet !== 'category') {
        if (this.selectedQuestionCount === 'custom') { // 1 trong 2(else if)
          questionLimit = Number(this.customQuestionCount);
        } else if (this.selectedQuestionCount !== 'all') {
          questionLimit = Number(this.selectedQuestionCount);
        }
      }

      // Chặn trên không vượt quá số từ hiện có (đề phòng DevTools bypass nút disabled)
      questionLimit = Math.min(questionLimit, this.availableWordCount);

      const shuffledWords = this.shuffleArray([...this.selectedWords]); //gọi lại thuật toán
      this.testWords = shuffledWords.slice(0, questionLimit);
      this.isSessionActive = true;
    },
    // Làm lại quiz chỉ với các từ sai (nút Retake trong VocabTest)
    retakeWrongAnswers(wrongWordIds) {
      const retakeWords = this.words.filter(word => wrongWordIds.includes(word._id));
      if (retakeWords.length > 0) {
        this.testWords = retakeWords;
        this.sessionKey++;
      }
    },

    // Thoát quiz, quay về màn hình thiết lập
    exitTest() {
      this.isSessionActive = false;
      this.testWords = []; // Xóa danh sách từ của bài test cũ, tránh lần sau dùng lại dữ liệu cũ
      // Xoá query param retake khỏi URL sau khi thoát
      if (this.$route.query.retake) {
        this.$router.replace({ path: '/test' });
      }// Mục đích: khi thoát bài test, xóa danh sách ID từ sai khỏi URL để lần sau không tự mở lại bài Retake cũ. replace thay URL hiện tại, không thêm một trang mới vào lịch sử trình duyệt.
    }
  }
};
</script>
