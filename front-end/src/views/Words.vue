<template>
  <div class="workspace-page words-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="book open icon"></i> Vocabulary collection</div>
        <h1>Vocabulary Library</h1>
        <p>Browse, filter, and manage your multilingual dictionary.</p>
      </div>

      <div class="workspace-header-actions">
        <router-link to="/words/new" class="ui primary button">
          <i class="plus icon"></i>
          Add new word
        </router-link>
      </div>
    </header>

    <section class="ui segment library-filters">
      <div class="library-panel-heading">
        <div>
          <h2>Find vocabulary</h2>
          <p>Narrow the library without changing your saved words.</p>
        </div>

        <span class="workspace-panel-icon">
          <i class="filter icon"></i>
        </span>
      </div>

      <div class="ui form">
        <div class="field">
          <label><i class="search icon"></i> Search</label>

          <div class="ui icon input fluid">
            <input
              type="text"
              placeholder="Search words in English, German, or French..."
              v-model="searchText"
            />
            <i class="search icon"></i>
          </div>
        </div>

        <div class="library-filter-grid">
          <div class="field">
            <label><i class="tag icon"></i> Category</label>

            <select class="ui dropdown fluid" v-model="selectedCategoryId">
              <option value="">All Categories</option>

              <option
                v-for="category in categories"
                :key="category._id"
                :value="category._id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label><i class="star outline icon"></i> Favourite Status</label>

            <select class="ui dropdown fluid" v-model="selectedFavouriteFilter">
              <option value="all">All Words</option>
              <option value="fav">Favourites Only</option>
              <option value="normal">Non-favourites</option>
            </select>
          </div>

          <div class="field">
            <label><i class="sort amount down icon"></i> Sort By</label>

            <select class="ui dropdown fluid" v-model="selectedSortOrder">
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="ui segment library-panel">
      <div class="library-panel-heading">
        <div>
          <h2>Vocabulary entries</h2>

          <p>
            {{ visibleWords.length }}
            {{ visibleWords.length === 1 ? 'word' : 'words' }} in this view
          </p>
        </div>

        <span class="workspace-panel-icon">
          <i class="table icon"></i>
        </span>
      </div>

      <div> <!-- // không có dữ liệu Read - gợi ý tạo mới-->
        <div v-if="visibleWords.length === 0" class="library-empty-state">
          <div class="library-empty-icon">
            <i class="search icon"></i>
          </div>

          <div class="library-empty-text">
            No vocabulary entries match your criteria.
          </div>

          <router-link
            to="/words/new"
            class="ui positive button icon labeled library-empty-button"
          >
            <i class="plus icon"></i>
            Add New Word
          </router-link>
        </div>

        <div v-else class="library-table-wrapper"> <!-- // có dữ liệu Read - hiển thị bảng -->
          <table class="ui celled compact table library-table">
            <colgroup>
              <col class="favourite-column" />
              <col class="language-column" />
              <col class="language-column" />
              <col class="language-column" />
              <col class="category-column" />
              <col class="actions-column" />
            </colgroup>

            <thead>
              <tr>
                <th class="center aligned" title="Favourite">
                  <i class="star icon yellow"></i>
                </th>

                <th><i class="united kingdom flag"></i> English (EN)</th>
                <th><i class="germany flag"></i> German (DE)</th>
                <th><i class="france flag"></i> French (FR)</th>
                <th><i class="tag icon"></i> Category</th>

                <th class="center aligned">
                  <i class="cog icon"></i> Actions
                </th>
              </tr>
            </thead>

            <tbody> <!-- tr hiển thị sau khi tính xong visibleWords trên bảng Read -->
              <tr v-for="word in visibleWords" :key="word._id">
                <td
                  class="center aligned favourite-cell"
                  title="Toggle favourite"
                  @click="toggleFavourite(word)"
                >
                  <i :class="[word.favourite ? 'star icon yellow' : 'star outline icon grey']"></i>
                </td>

                <!-- English -->
                <td>
                  <div class="language-with-audio">
                    <span class="language-text">
                      {{ word.english }}
                    </span>

                    <button
                      type="button"
                      class="language-audio-button"
                      title="Listen English pronunciation"
                      @click.stop="speakWord(word.english, 'en-US')"
                    >
                      <i class="volume up icon"></i>
                    </button>
                  </div>
                </td>

                <!-- German -->
                <td>
                  <div class="language-with-audio">
                    <span class="language-text">
                      {{ word.german }}
                    </span>

                    <button
                      type="button"
                      class="language-audio-button"
                      title="Listen German pronunciation"
                      @click.stop="speakWord(word.german, 'de-DE')"
                    >
                      <i class="volume up icon"></i>
                    </button>
                  </div>
                </td>

                <!-- French -->
                <td>
                  <div class="language-with-audio">
                    <span class="language-text">
                      {{ word.french }}
                    </span>

                    <button
                      type="button"
                      class="language-audio-button"
                      title="Listen French pronunciation"
                      @click.stop="speakWord(word.french, 'fr-FR')"
                    >
                      <i class="volume up icon"></i>
                    </button>
                  </div>
                </td>

                <td>
                  <span class="ui label mini basic category-label">
                    <i class="tag icon"></i>
                    <span>{{ word.category?.name }}</span>
                  </span>
                </td>

                <td class="center aligned"> <!-- Actions điều hướng-->
                  <div class="library-row-actions">
                    <router-link
                      :to="{ name: 'show', params: { id: word._id } }"
                      class="ui icon mini basic button"
                      title="View word"
                    >
                      <i class="eye icon"></i>
                    </router-link>

                    <router-link
                      :to="{ name: 'edit', params: { id: word._id } }"
                      class="ui icon mini basic primary button"
                      title="Edit word"
                    >
                      <i class="edit icon"></i>
                    </router-link>

                    <button
                      type="button"
                      class="ui icon mini basic negative button"
                      title="Delete word"
                      @click="deleteWordItem(word)"
                    >
                      <i class="trash icon"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredWords.length > 0" class="library-pagination">
          <span class="pagination-summary">
            {{ paginationSummary }}
          </span>

          <div v-if="totalPages > 1" class="pagination-controls">
            <button
              type="button"
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              <i class="chevron left icon"></i> Prev
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              class="pagination-num"
              :class="{ active: currentPage === page }" 
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next <i class="chevron right icon"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// ── Trang thư viện từ vựng ───────────────────────────────────────────
// Hiển thị toàn bộ words dạng bảng, có tìm kiếm, lọc, sắp xếp, phân trang
import {
  getWords,
  updateWord,
  deleteWord,
  getCategories
} from '../helpers/helpers';

export default {
  name: 'words',
  data() {
    return {
      words: [],                   // tất cả words từ database
      categories: [],              // tất cả categories (cho dropdown lọc)
      searchText: '',              // ô tìm kiếm (lọc theo 3 ngôn ngữ)
      selectedCategoryId: '',        // category đang lọc ('' = tất cả)
      selectedFavouriteFilter: 'all', // 'all' | 'fav' | 'normal'
      selectedSortOrder: 'newest', // 'newest' | 'oldest'
      currentPage: 1,              // trang hiện tại
      pageSize: 8                  // số từ mỗi trang
    };
  },
  watch: {
    // Khi thay đổi filter → reset về trang 1
    searchText: 'resetPage',
    selectedCategoryId: 'resetPage',
    selectedFavouriteFilter: 'resetPage',
    selectedSortOrder: 'resetPage',
    // Sau khi lọc dữ liệu tại trang 4, lọc xong còn 2 trang → lùi về trang cuối để tránh lỗi hiển thị
    filteredWords() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  },
  computed: {
    // filteredWords = bản sao dữ liệu + (lọc + sắp xếp) --> sau đó return dữ liệu cuối cùng
    filteredWords() {
      const searchValue = this.searchText.trim().toLowerCase();
      let result = [...this.words];

      if (searchValue) { //tìm kiếm
        result = result.filter(word =>
          word.german.toLowerCase().includes(searchValue) ||
          word.english.toLowerCase().includes(searchValue) ||
          word.french.toLowerCase().includes(searchValue)
        );
      }

      if (this.selectedCategoryId) { //lọc theo category
        result = result.filter(word => word.category._id === this.selectedCategoryId);
      }

      if (this.selectedFavouriteFilter === 'fav') { //lọc theo favourite
        result = result.filter(word => word.favourite);
      }
      if (this.selectedFavouriteFilter === 'normal') {
        result = result.filter(word => !word.favourite);
      }

      result.sort((a, b) => {
        if (this.selectedSortOrder === 'newest') {
          return new Date(b.created_date) - new Date(a.created_date);
        }
        return new Date(a.created_date) - new Date(b.created_date);
      });

      return result;
    },
    // ── Phân trang ───────────────────────────────────────────────────
    totalPages() { //tính xem cần bao nhiêu trang (quy định 8 từ/trang)
      return Math.ceil(this.filteredWords.length / this.pageSize) || 1;
    },
    visibleWords() {  //khi đang ở trang nào thì lấy đúng nhóm từ của trang đó (0-8, 8-16, 16-24,...)
      const start = (this.currentPage - 1) * this.pageSize; //start từ kết quả ví dụ 8, 16, 24,25,26... (tùy trang)
      return this.filteredWords.slice(start, start + this.pageSize); 
    },
    paginationSummary() {
      const total = this.filteredWords.length;
      if (total === 0) return '0 words';

      // Vị trí từ đầu tiên ví dụ 1, 9, 17,...
      const start = (this.currentPage - 1) * this.pageSize + 1;
      // Vị trí từ cuối cùng của trang đang đứng
      const end = Math.min(start + this.pageSize - 1, total);

      return `Showing ${start}–${end} of ${total} words`;
    }
  },
  mounted() {
    this.loadPageData();
  },
  methods: {
    // Reset về trang 1 (gọi khi filter thay đổi)
    resetPage() {
      this.currentPage = 1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
      this.currentPage = page; // tính lại currentPage ở visib
    },

    // Phát âm thanh bằng Web Speech API của trình duyệt
    speakWord(text, languageCode) {
      if (!text || !window.speechSynthesis) return; //Nếu không có từ hoặc trình duyệt không hỗ trợ đọc giọng nói thì dừng hàm.
      window.speechSynthesis.cancel(); //Dừng âm thanh đang đọc trước đó, tránh nhiều giọng đọc chồng lên nhau.
      const utterance = new SpeechSynthesisUtterance(text); //Tạo một đối tượng chứa nội dung cần đọc.
      utterance.lang = languageCode; //Gán ngôn ngữ phát âm cho nội dung utterance
      window.speechSynthesis.speak(utterance);
    },

    // Load words + categories từ API
    async loadPageData() {
      try {
        const [wordsData, categoriesData] = await Promise.all([getWords(), getCategories()]);
        this.words = wordsData;
        this.categories = categoriesData;
      } catch {
        this.flash('Failed to load vocabulary data.', 'error');
      }
    },

    // ── Bật/tắt yêu thích ──────────────────────────────────────────
    async toggleFavourite(word) {
      try {
        // Gửi trạng thái ngược lại lên server
        const updatedWord = await updateWord({
          _id: word._id,
          favourite: !word.favourite
        });

        // Chỉ cập nhật đúng trường favourite — không đụng đến các trường khác
        word.favourite = updatedWord.favourite;

        // Hiển thị thông báo
        this.flash(
          word.favourite
            ? 'Added to Favourites!'
            : 'Removed from Favourites',
          'success',
          { timeout: 1000 }
        );
      } catch {
        this.flash('Failed to update favourite status.', 'error');
      }
    },

    // ── Xóa từ sau khi xác nhận ────────────────────────────────────
    async deleteWordItem(wordToDelete) {
      // 1. Hỏi xác nhận
      const confirmed = window.confirm('Are you sure you want to delete this word?');
      if (!confirmed) return;

      try {
        // 2. Gửi lên server để xóa
        await deleteWord(wordToDelete._id);

        // 3. Loại bỏ từ khỏi mảng (giữ lại những từ khác id)
        this.words = this.words.filter(eachWord => eachWord._id !== wordToDelete._id);

        // 4. Hiển thị thông báo
        this.flash('Word deleted successfully!', 'success');
      } catch {
        this.flash('Failed to delete the word.', 'error');
      }
    }
  }
};
</script>

<style scoped>
.words-page {
  padding-bottom: 2rem;
}

.library-filters,
.library-panel {
  margin: 0 !important;
  padding: 1.6rem !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.04),
    0 6px 16px rgba(15, 23, 42, 0.02) !important;
}

.library-panel {
  margin-top: 1.5rem !important;
}

.library-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.library-panel-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.library-panel-heading p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
}

.library-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.library-filter-grid .field {
  margin: 0 !important;
}

.library-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.library-table {
  margin: 0 !important;
}

.library-table .favourite-column {
  width: 50px;
}

.library-table .language-column {
  width: auto;
}

.library-table .category-column {
  width: 140px;
}

.library-table .actions-column {
  width: 130px;
}

.library-table th {
  padding-top: 0.85rem !important;
  padding-bottom: 0.85rem !important;
  color: #0f172a !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #cbd5e1 !important;
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

.library-table td {
  vertical-align: middle !important;
}

.favourite-cell {
  cursor: pointer;
}

.language-with-audio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-text {
  display: block;
  flex: 1;
  min-width: 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language-audio-button {
  display: inline-flex;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.language-audio-button .icon {
  margin: 0 !important;
  font-size: 0.82rem;
  line-height: 1;
}

.language-audio-button:hover {
  color: #0284c7;
  background: #f0f9ff;
  border-color: #bae6fd;
}

.language-audio-button:active {
  background: #e0f2fe;
}

.language-audio-button:focus-visible {
  outline: 2px solid rgba(2, 132, 199, 0.18);
  outline-offset: 2px;
}

.category-label {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.3rem !important;
  padding: 0.3em 0.65em !important;
  color: #30394a !important;
  background: #f7f9fb !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
}

.category-label > span {
  display: inline-block;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.library-row-actions {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.library-row-actions .ui.button {
  margin: 0;
  padding: 0.55rem 0.6rem !important;
}

.library-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.pagination-summary {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-btn:hover:not(:disabled) {
  color: #0284c7;
  background: #f8fafc;
  border-color: #0284c7;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-num {
  display: inline-flex;
  min-width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  color: #334155;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-num:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-num.active {
  color: #ffffff;
  background: #0f172a;
  border-color: #0f172a;
  font-weight: 700;
}

.library-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3rem 1.75rem;
  color: #687386;
  background: #fafbfc;
  border: 1px dashed #d9dee7;
  border-radius: 12px;
  text-align: center;
}

.library-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa3b3;
}

.library-empty-icon .icon {
  margin: 0 !important;
  font-size: 2.75rem;
  line-height: 1;
}

.library-empty-text {
  max-width: 420px;
  color: #3c4557;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.5;
}

.library-empty-button {
  margin: 0.25rem 0 0 0 !important;
  padding: 0.85rem 1.6rem !important;
  border-radius: 8px !important;
  font-size: 0.95rem;
}
</style>
