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
  // Tên của component
  name: 'test',
  // Khai báo các component con được sử dụng trong template
  components: { 'vocab-test': VocabTest },
  // Khởi tạo các biến dữ liệu cho trang thiết lập bài kiểm tra
  data() {
    return {
      words: [],                  // Danh sách tất cả các từ vựng lấy từ cơ sở dữ liệu
      categories: [],             // Danh sách tất cả các danh mục bài học lấy từ cơ sở dữ liệu
      questionLanguage: 'german', // Ngôn ngữ hiển thị câu hỏi (mặc định: 'german' - tiếng Đức)
      answerLanguage: 'english',  // Ngôn ngữ yêu cầu người dùng trả lời (mặc định: 'english' - tiếng Anh)
      selectedWordSet: 'all',     // Phạm vi bộ từ được chọn: 'all' (tất cả), 'fav' (yêu thích), 'category' (theo danh mục)
      selectedCategoryId: '',     // ID danh mục được chọn khi selectedWordSet = 'category'
      selectedQuestionCount: 'all', // Số lượng câu hỏi được chọn: 'all', 5, 10, 20 hoặc 'custom'
      customQuestionCount: 5,     // Số lượng câu hỏi tự nhập do người dùng tùy chỉnh
      isSessionActive: false,     // Trạng thái phiên làm bài test: true = đang trong quiz, false = ở màn hình cài đặt
      testWords: [],              // Danh sách các từ vựng ngẫu nhiên được chọn để đưa vào bài test hiện tại
      sessionKey: 0               // Khóa duy nhất (key) dùng để ép re-mount lại VocabTest khi thực hiện retake
    };
  },
  computed: {
    // Tính tổng số lượng từ vựng được đánh dấu yêu thích (favourite)
    favouriteWordCount() { 
      return this.words.filter(word => word.favourite).length;
    },
    // Lọc danh sách từ dựa trên bộ từ đã chọn (Tất cả, Yêu thích, hoặc Theo danh mục cụ thể)
    selectedWords() {
      if (this.selectedWordSet === 'all') return this.words; // Nếu chọn tất cả từ vựng
      if (this.selectedWordSet === 'fav') return this.words.filter(word => word.favourite); // Nếu chọn danh sách yêu thích
      if (!this.selectedCategoryId) return []; // Nếu chọn theo danh mục nhưng chưa chọn danh mục cụ thể thì trả về mảng rỗng
      return this.words.filter(word => word.category._id === this.selectedCategoryId); // Lọc các từ vựng thuộc danh mục đã chọn
    },
    // Tổng số lượng từ khả dụng trong bộ từ đã lọc hiện tại
    availableWordCount() {
      return this.selectedWords.length;
    },
    // Các tùy chọn số câu hỏi preset (5, 10, 20) thỏa mãn điều kiện nhỏ hơn hoặc bằng số từ khả dụng
    questionSizeOptions() {
      return [5, 10, 20].filter(count => count <= this.availableWordCount);
    },
    // Kiểm tra tính hợp lệ của số câu hỏi tùy chỉnh do người dùng nhập vào
    hasValidQuestionCount() { 
      if (this.selectedQuestionCount !== 'custom' || this.selectedWordSet === 'category') return true; // Không dùng custom count thì luôn hợp lệ
      const enteredQuestionCount = Number(this.customQuestionCount);
      return Number.isInteger(enteredQuestionCount) && enteredQuestionCount >= 5 && enteredQuestionCount <= this.availableWordCount; // Kiểm tra số nguyên, từ 5 trở lên và không vượt quá số từ khả dụng
    }
  },
  watch: {
    // Theo dõi sự thay đổi của số từ khả dụng để tự động cập nhật lại số câu hỏi custom mặc định
    availableWordCount(newMax) { 
        this.customQuestionCount = newMax;
    }
  },
  // Hook lifecycle mounted: Tải dữ liệu từ vựng & danh mục, đồng thời kiểm tra tham số retake từ URL query
  async mounted() {
    try {
      // Gọi helper lấy danh sách từ vựng và danh mục từ API backend
      this.words = await getWords();
      this.categories = await getCategories();

      // Đọc danh sách ID từ vựng cần làm lại từ URL query (?retake=id1,id2,id3)
      const retakeParam = this.$route.query.retake;
      if (retakeParam) {
        const retakeWordIds = retakeParam.split(',');
        const retakeWords = this.words.filter(word => retakeWordIds.includes(word._id));
        if (retakeWords.length > 0) {
          this.testWords = retakeWords; // Đưa danh sách từ sai vào bài test
          this.isSessionActive = true;  // Bắt đầu phiên test ngay lập tức
        }
      }
    } catch {
      // Hiển thị thông báo lỗi nếu tải dữ liệu thất bại
      this.flash('Failed to load test data.', 'error');
    }
  },
  methods: {
    // Xử lý sự kiện khi thay đổi ngôn ngữ câu hỏi: Đảm bảo ngôn ngữ câu hỏi và câu trả lời không bị trùng nhau
    onQuestionLanguageChange() {
      if (this.questionLanguage === this.answerLanguage) {
        this.answerLanguage = this.questionLanguage === 'german' ? 'english' : 'german';
      }
    },
    // Xử lý sự kiện khi thay đổi ngôn ngữ câu trả lời: Đảm bảo ngôn ngữ câu trả lời và câu hỏi không bị trùng nhau
    onAnswerLanguageChange() {
      if (this.answerLanguage === this.questionLanguage) {
        this.questionLanguage = this.answerLanguage === 'german' ? 'english' : 'german';
      }
    },
    // Thuật toán xáo trộn Fisher-Yates: Xáo trộn vị trí ngẫu nhiên các phần tử trong mảng
    shuffleArray(array) {
      for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
      }
      return array;
    },

    // Bắt đầu bài test: Chọn ngẫu nhiên số lượng câu hỏi từ danh sách từ vựng khả dụng và kích hoạt phiên test
    startTest() {
      let questionLimit = this.availableWordCount;

      if (this.selectedWordSet !== 'category') {
        if (this.selectedQuestionCount === 'custom') { // Lấy số câu hỏi custom
          questionLimit = Number(this.customQuestionCount);
        } else if (this.selectedQuestionCount !== 'all') { // Lấy số câu hỏi từ option được chọn
          questionLimit = Number(this.selectedQuestionCount);
        }
      }

      // Giới hạn số lượng câu hỏi không vượt quá tổng số từ khả dụng hiện có
      questionLimit = Math.min(questionLimit, this.availableWordCount);

      // Xáo trộn mảng từ vựng đã chọn và lấy số lượng câu hỏi theo giới hạn
      const shuffledWords = this.shuffleArray([...this.selectedWords]);
      this.testWords = shuffledWords.slice(0, questionLimit);
      this.isSessionActive = true;
    },
    // Làm lại bài test chỉ dành cho các câu trả lời sai (khi nhận event retakeWrong từ component VocabTest)
    retakeWrongAnswers(wrongWordIds) {
      const retakeWords = this.words.filter(word => wrongWordIds.includes(word._id));
      if (retakeWords.length > 0) {
        this.testWords = retakeWords;
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
