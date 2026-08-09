<template>
  <div class="workspace-page words-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="book open icon"></i> Vocabulary collection</div>
        <h1>Vocabulary Library</h1>
        <p>Browse, filter, and manage your multilingual dictionary.</p>
      </div>

      <div class="workspace-header-actions">
        <button
          type="button"
          class="ui basic primary button"
          @click="isImportExportOpen = true"
          title="Import or Export vocabulary"
        >
          <i class="exchange icon"></i>
          Import / Export
        </button>
        <router-link to="/words/new" class="ui primary button">
          <i class="plus icon"></i>
          Add New Word
        </router-link>
      </div>
    </header>

    <section class="ui segment library-filters">
      <div class="library-panel-heading">
        <div>
          <h2>Find vocabulary</h2>
          <p>Narrow the library without changing your saved words.</p>
        </div>

        <div class="library-panel-actions">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="ui basic compact button reset-filter-btn"
            @click="resetFilters"
            title="Reset all filters"
          >
            <i class="undo icon"></i> Reset Filters
          </button>
          <span class="workspace-panel-icon">
            <i class="filter icon"></i>
          </span>
        </div>
      </div>

      <div class="ui form">
        <div class="field">
          <label for="search-input" class="clickable-label" @click="focusField('searchInput')">
            <i class="search icon"></i> Search
          </label>

          <div class="ui icon input fluid search-input-wrapper">
            <input
              id="search-input"
              ref="searchInput"
              type="text"
              placeholder="Search words in English, German, or French..."
              v-model="searchText"
            />
            <i
              v-if="searchText"
              class="times icon clear-search-icon"
              title="Clear search"
              @click="clearSearch"
            ></i>
            <i v-else class="search icon"></i>
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
            {{ visibleItems.length }}
            {{ visibleItems.length === 1 ? 'word' : 'words' }} in this view
          </p>
        </div>

        <span class="workspace-panel-icon">
          <i class="table icon"></i>
        </span>
      </div>

      <div> <!-- // không có dữ liệu Read - gợi ý tạo mới-->
        <div v-if="visibleItems.length === 0" class="library-empty-state">
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

            <tbody> <!-- tr hiển thị sau khi tính xong visibleItems trên bảng Read -->
              <tr v-for="word in visibleItems" :key="word._id">
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
                    <span class="language-text" v-html="highlightMatch(word.english, searchText)"></span>

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
                    <span class="language-text" v-html="highlightMatch(word.german, searchText)"></span>

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
                    <span class="language-text" v-html="highlightMatch(word.french, searchText)"></span>

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
                      @click="triggerDeleteWord(word)"
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

    <!-- Custom Delete Confirmation Dialog -->
    <confirm-modal
      :is-open="isConfirmOpen"
      title="Delete Vocabulary Word"
      :message="deleteMessage"
      confirm-text="Delete Word"
      cancel-text="Cancel"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <!-- Import & Export Modal -->
    <import-export-modal
      :is-open="isImportExportOpen"
      :categories="categories"
      :words="words"
      :filtered-words="filteredWords"
      @close="isImportExportOpen = false"
      @imported="loadPageData"
    />
  </div>
</template>

<script>
// ── Trang thư viện từ vựng ───────────────────────────────────────────
// Hiển thị toàn bộ words dạng bảng, có tìm kiếm, lọc, sắp xếp, phân trang, tô sáng từ khóa & xuất/nhập từ vựng
import {
  getWords,
  updateWord,
  deleteWord,
  getCategories,
  speakWord
} from '../helpers/helpers';
import { paginationMixin, focusFieldMixin } from '../helpers/mixins';
import ConfirmModal from '../components/ConfirmModal.vue';
import ImportExportModal from '../components/ImportExportModal.vue';

export default {
  name: 'words',
  components: { ConfirmModal, ImportExportModal },
  mixins: [paginationMixin, focusFieldMixin],
  // Khởi tạo các trạng thái dữ liệu cho trang thư viện từ vựng
  data() {
    return {
      words: [],                   // tất cả words từ database
      categories: [],              // tất cả categories (cho dropdown lọc)
      searchText: '',              // ô tìm kiếm (lọc theo 3 ngôn ngữ)
      selectedCategoryId: '',        // category đang lọc ('' = tất cả)
      selectedFavouriteFilter: 'all', // 'all' | 'fav' | 'normal'
      selectedSortOrder: 'newest', // 'newest' | 'oldest'
      isConfirmOpen: false,        // Cờ hiển thị dialog xóa
      wordToDelete: null,          // Từ vựng chuẩn bị xóa
      isImportExportOpen: false    // Cờ hiển thị modal Import/Export
    };
  },
  watch: {
    // Khi thay đổi filter → reset về trang 1
    searchText: 'resetPage',
    selectedCategoryId: 'resetPage',
    selectedFavouriteFilter: 'resetPage',
    selectedSortOrder: 'resetPage',
    // Theo dõi route query để áp dụng lọc category nếu chuyển từ Category Manager
    '$route.query.category': {
      handler(newCategory) {
        if (newCategory !== undefined) {
          this.selectedCategoryId = newCategory || '';
        }
      },
      immediate: true
    }
  },
  computed: {
    hasActiveFilters() {
      return Boolean(
        this.searchText ||
        this.selectedCategoryId ||
        this.selectedFavouriteFilter !== 'all' ||
        this.selectedSortOrder !== 'newest'
      );
    },
    deleteMessage() {
      if (!this.wordToDelete) return '';
      return `Are you sure you want to delete "${this.wordToDelete.english}" (${this.wordToDelete.german})? This action cannot be undone.`;
    },
    // Computed property lọc và sắp xếp từ vựng
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
        result = result.filter(word => word.category && word.category._id === this.selectedCategoryId);
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
    // Nguồn dữ liệu & nhãn cho paginationMixin (logic phân trang dùng chung)
    paginationItems() {
      return this.filteredWords;
    },
    paginationLabel() {
      return 'words';
    }
  },
  // Lifecycle hook mounted
  mounted() {
    this.loadPageData();
  },
  methods: {
    // Tô sáng chữ khớp với từ khóa tìm kiếm (Mục số 1)
    highlightMatch(text, query) {
      if (!text) return '';
      const search = query ? query.trim() : '';
      if (!search) return text;
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    },

    // Clear ô tìm kiếm
    clearSearch() {
      this.searchText = '';
      this.focusField('searchInput');
    },
    // Reset tất cả bộ lọc
    resetFilters() {
      this.searchText = '';
      this.selectedCategoryId = '';
      this.selectedFavouriteFilter = 'all';
      this.selectedSortOrder = 'newest';
      this.currentPage = 1;
      if (this.$route.query.category) {
        this.$router.replace({ query: {} });
      }
    },

    // Phát âm thanh bằng Web Speech API (helper dùng chung trong helpers.js)
    speakWord,

    // Load words + categories từ API
    async loadPageData() {
      try {
        const [wordsData, categoriesData] = await Promise.all([getWords(), getCategories()]);
        this.words = wordsData;
        this.categories = categoriesData;
        if (this.$route.query.category) {
          this.selectedCategoryId = this.$route.query.category;
        }
      } catch {
        this.flash('Failed to load vocabulary data.', 'error');
      }
    },

    // ── Bật/tắt yêu thích ──────────────────────────────────────────
    async toggleFavourite(word) {
      try {
        const updatedWord = await updateWord({
          _id: word._id,
          favourite: !word.favourite
        });

        word.favourite = updatedWord.favourite;

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

    // ── Xóa từ với Dialog tinh tế ─────────────────────────────────
    triggerDeleteWord(word) {
      this.wordToDelete = word;
      this.isConfirmOpen = true;
    },
    onCancelDelete() {
      this.isConfirmOpen = false;
      this.wordToDelete = null;
    },
    async onConfirmDelete() {
      if (!this.wordToDelete) return;
      try {
        await deleteWord(this.wordToDelete._id);
        this.words = this.words.filter(w => w._id !== this.wordToDelete._id);
        this.flash('Word deleted successfully!', 'success');
      } catch {
        this.flash('Failed to delete the word.', 'error');
      } finally {
        this.isConfirmOpen = false;
        this.wordToDelete = null;
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
  padding: 1.25rem !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.library-panel {
  margin-top: 1.25rem !important;
}

.library-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.library-panel-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.library-panel-heading p {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}

.library-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-filter-btn {
  font-size: 0.8rem !important;
  padding: 0.4rem 0.75rem !important;
  border-radius: 4px !important;
  color: #64748b !important;
  border-color: #cbd5e1 !important;
  margin: 0 !important;
}
.reset-filter-btn:hover {
  color: #0f172a !important;
  background: #f8fafc !important;
}

.clickable-label {
  cursor: pointer;
  user-select: none;
}

.search-input-wrapper {
  position: relative;
}

.clear-search-icon {
  position: absolute !important;
  right: 10px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  left: auto !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  color: #94a3b8 !important;
  font-size: 1rem !important;
  transition: color 0.15s ease !important;
}

.clear-search-icon:hover {
  color: #ef4444 !important;
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
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.library-table {
  margin: 0 !important;
  border-radius: 6px !important;
  overflow: hidden !important;
}

.library-table .favourite-column {
  width: 46px;
}

.library-table .language-column {
  width: auto;
}

.library-table .category-column {
  width: 150px;
}

.library-table .actions-column {
  width: 128px;
}

.library-table th {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  color: #64748b !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

.library-table td {
  vertical-align: middle !important;
  padding: 0.7rem 0.75rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #334155;
  font-size: 0.875rem;
}

.library-table tbody tr:hover td {
  background: #f8fafc !important;
}

.library-table tbody tr:last-child td {
  border-bottom: none !important;
}

.favourite-cell {
  cursor: pointer;
}

.language-with-audio {
  display: flex;
  align-items: center;
  gap: 0.4rem;
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

/* Search Keyword Highlight */
::v-deep .search-highlight {
  background-color: #fef08a !important;
  color: #854d0e !important;
  padding: 0.05em 0.2em !important;
  border-radius: 3px !important;
  font-weight: 600 !important;
}

.language-audio-button {
  display: inline-flex;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.language-audio-button .icon {
  margin: 0 !important;
  font-size: 0.85rem;
  line-height: 1;
}

.language-audio-button:hover {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.language-audio-button:active {
  transform: scale(0.94);
}

.language-audio-button:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.35);
  outline-offset: 2px;
}

.category-label {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.3rem !important;
  padding: 0.25em 0.6em !important;
  color: #334155 !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
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
  gap: 0.25rem;
}

.library-row-actions .ui.button {
  margin: 0;
  padding: 0.4rem 0.5rem !important;
  border-radius: 4px !important;
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
  font-size: 0.8rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-btn:hover:not(:disabled) {
  color: #3b82f6;
  background: #f8fafc;
  border-color: #93c5fd;
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
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
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
  font-weight: 600;
}

.library-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.library-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.library-empty-icon .icon {
  margin: 0 !important;
  font-size: 2rem;
  line-height: 1;
}

.library-empty-text {
  max-width: 420px;
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
}

.library-empty-button {
  margin: 0.25rem 0 0 0 !important;
  padding: 0.6rem 1.25rem !important;
  border-radius: 6px !important;
  font-size: 0.9rem;
}
</style>
