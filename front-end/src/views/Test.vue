<template>
  <div class="workspace-page workspace-page--narrow">
    <div v-if="!sessionActive">
      <header class="workspace-header">
        <div>
          <div class="workspace-eyebrow">
            <i class="graduation cap icon"></i>
            Practice workspace
          </div>
          <h1>Vocabulary Test</h1>
          <p>Test your translation skills with your saved vocabulary.</p>
        </div>
        <div class="workspace-header__actions">
          <router-link to="/words" class="ui basic primary button">
            <i class="book open icon"></i>
            Open Library
          </router-link>
        </div>
      </header>

      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-heading__title">
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
            <select class="ui dropdown fluid" v-model="qLang" @change="onQLangChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>
          <div class="field">
            <label>Answer Language</label>
            <select class="ui dropdown fluid" v-model="aLang" @change="onALangChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>

          <div class="field">
            <label>Word set</label>
            <select class="ui dropdown fluid" v-model="wordSet">
              <option value="all">All words ({{ words.length }})</option>
              <option value="fav">Favourites only ({{ favCount }})</option>
              <option value="category">By category</option>
            </select>
          </div>

          <div v-if="wordSet === 'category'" class="field">
            <label>Category</label>
            <select class="ui dropdown fluid" v-model="selectedCategory">
              <option value="">Choose a category…</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }} ({{ words.filter(w => w.category === cat).length }} words)
              </option>
            </select>
          </div>

          <div v-if="wordSet !== 'category'" class="field">
            <label>Number of questions</label>
            <select class="ui dropdown fluid" v-model="questionCount">
              <option value="all">All ({{ availableWordCount }} words)</option>
              <option v-for="n in presetSizes" :key="n" :value="n">{{ n }} questions</option>
              <option value="custom">Custom…</option>
            </select>
          </div>

          <div v-if="questionCount === 'custom' && wordSet !== 'category'" class="field">
            <label>Custom amount</label>
            <input
              type="number"
              min="1"
              :max="availableWordCount"
              v-model.number="customCount"
              placeholder="Enter a number"
            />
          </div>

          <button
            class="ui primary fluid large button icon labeled"
            :disabled="availableWordCount < 5 || !isCountValid"
            @click="startSession"
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
        :words="sessionWords"
        :q-lang="qLang"
        :a-lang="aLang"
        @exitTest="exitSession"
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
      qLang: 'german', // Ngôn ngữ hỏi.
      aLang: 'english', // Ngôn ngữ đáp án.
      wordSet: 'all', // Kiểu chọn bộ từ.
      selectedCategory: '', // Category đang chọn.
      questionCount: 'all', // Số câu hỏi.
      customCount: 5, // Số câu tự nhập.
      sessionActive: false, // Trạng thái làm bài.
      sessionWords: [] // Bộ từ của phiên test.
    };
  },
  computed: {
    favCount() {
      // Dùng `this.words` để đếm nhanh số từ favourite và hiển thị cạnh option "Favourites only".
      return this.words.filter(w => w.favourite).length;
    },
    filteredWords() {
      // Dùng `wordSet` và `selectedCategory` để tạo ra đúng bộ từ sẽ đem đi test.
      if (this.wordSet === 'fav') return this.words.filter(w => w.favourite);  
      if (this.wordSet === 'category' && this.selectedCategory) {
        return this.words.filter(w => w.category === this.selectedCategory);
      }
      return this.words;
    },
    availableWordCount() {
      // Lấy độ dài của `filteredWords` để biết hiện tại có bao nhiêu từ khả dụng cho bài test.
      return this.filteredWords.length;
    },
    presetSizes() {
      // Lọc các mốc 5, 10, 20 theo `availableWordCount` để dropdown chỉ hiện option hợp lệ.
      return [5, 10, 20].filter(n => n <= this.availableWordCount);
    },
    isCountValid() {
      // Nếu không dùng custom thì xem như hợp lệ ngay.
      if (this.questionCount !== 'custom' || this.wordSet === 'category') return true;

      // Khi dùng custom, kiểm tra `customCount` có phải số hợp lệ, không nhỏ hơn 5 và không vượt quá số từ đang có.
      const n = Number(this.customCount);
      return Number.isFinite(n) && n >= 5 && n <= this.availableWordCount;
    }
  },
  watch: {
    availableWordCount(newMax) {
      // Khi bộ lọc đổi làm số từ giảm xuống, ép `customCount` về mức tối đa mới để tránh chọn quá số từ hiện có.
      if (Number(this.customCount) > newMax) this.customCount = newMax;
    },
    customCount(newVal) {
      // Nếu ô custom bị nhập sai kiểu dữ liệu, đưa giá trị về mức an toàn để form không bị lỗi.
      const n = Number(newVal);
      if (!Number.isFinite(n)) this.customCount = Math.min(5, this.availableWordCount || 5);
    }
  },
  async mounted() {
    try {
      // Gọi `getWords()` và `getCategoryNames()` để nạp dữ liệu từ backend vào `words` và `categories` cho màn setup.
      this.words = await getWords();
      this.categories = await getCategoryNames();
      this.categories.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      // Đọc `retake_word_ids` từ `sessionStorage`; nếu có thì lọc lại từ `this.words`, lưu vào `sessionWords` và mở luôn phiên test.
      const retakeIds = sessionStorage.getItem('retake_word_ids');
      if (retakeIds) {
        sessionStorage.removeItem('retake_word_ids');
        const ids = JSON.parse(retakeIds);
        const matched = this.words.filter(w => ids.includes(w._id));
        if (matched.length > 0) {
          this.sessionWords = matched;
          this.sessionActive = true;
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    onQLangChange() {
      // Nếu `qLang` trùng `aLang`, tự đổi `aLang` sang ngôn ngữ khác để câu hỏi và đáp án không bị trùng nhau.
      if (this.qLang === this.aLang) {
        this.aLang = this.qLang === 'german' ? 'english' : 'german';
      }
    },
    onALangChange() {
      // Xử lý ngược lại cho dropdown đáp án: nếu bị trùng thì đổi `qLang`.
      if (this.aLang === this.qLang) {
        this.qLang = this.aLang === 'german' ? 'english' : 'german';
      }
    },
    startSession() {
      // Bắt đầu từ `filteredWords`, tính ra số câu cần lấy, trộn ngẫu nhiên rồi lưu kết quả vào `sessionWords`.
      let size = this.availableWordCount;

      // Nếu không phải mode category thì đọc thêm `questionCount` hoặc `customCount` để chốt số câu.
      if (this.wordSet !== 'category') {
        if (this.questionCount === 'custom') {
          size = Number(this.customCount);
        } else if (this.questionCount !== 'all') {
          size = Number(this.questionCount);
        }
      }

      // Chuẩn hóa `size` để không âm, không NaN và không vượt quá số từ hiện có.
      if (!Number.isFinite(size) || size < 1) size = this.availableWordCount;
      size = Math.min(size, this.availableWordCount);

      const list = [...this.filteredWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, size);

      // Lưu bộ từ đã chốt vào `sessionWords` và bật `sessionActive` để render component `VocabTest`.
      this.sessionWords = list;
      this.sessionActive = true;
    },
    exitSession() {
      // Khi thoát bài test, tắt trạng thái làm bài và xóa `sessionWords` để quay về màn setup.
      this.sessionActive = false;
      this.sessionWords = [];
    }
  }
};
</script>
