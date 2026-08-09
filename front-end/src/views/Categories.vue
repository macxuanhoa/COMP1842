<template>
  <div class="workspace-page categories-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="tags icon"></i> Organise your library</div>
        <h1>Category Manager</h1>
        <p>Create, rename, and manage the topics used across your vocabulary collection.</p>
      </div>
      <div class="workspace-header-actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="book open icon"></i>
          Open Library
        </router-link>
      </div>
    </header>

    <!-- Panel 1: Add Category -->
    <section class="ui segment workspace-panel category-create-panel">
      <div class="workspace-panel-heading">
        <div>
          <h2>Add category</h2>
          <p>Create a clear topic for grouping related words.</p>
        </div>
      </div>

      <form class="ui form" @submit.prevent="createNewCategory">
        <div v-if="errorMessage" class="ui negative message">
          <p>{{ errorMessage }}</p>
        </div>

        <div class="field">
          <label for="new-category-name"><i class="tag icon"></i> Category Name</label>
          <div class="ui action input fluid category-create-control">
            <input
              id="new-category-name"
              ref="newCategoryInput"
              type="text"
              placeholder="Enter new category name (e.g. Travel, Business, Food)..."
              v-model.trim="newCategoryName"
              @input="errorMessage = ''"
            />
            <button class="ui primary button" type="submit">
              Add Category
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- Panel 2: Saved Categories Table -->
    <section class="ui segment workspace-panel category-list-panel">
      <div class="workspace-panel-heading">
        <div>
          <h2>Saved categories</h2>
          <p>{{ categories.length }} total {{ categories.length === 1 ? 'category' : 'categories' }} in your collection</p>
        </div>
        <span class="workspace-panel-icon">
          <i class="table icon"></i>
        </span>
      </div>

      <div>
        <!-- Ô tìm kiếm category theo tên -->
        <div class="category-search">
          <div class="ui icon input fluid category-search-input">
            <input
              type="text"
              placeholder="Search categories by name..."
              v-model="searchText"
            />
            <i
              v-if="searchText"
              class="times icon category-search-clear"
              title="Clear search"
              @click="clearCategorySearch"
            ></i>
            <i v-else class="search icon"></i>
          </div>
        </div>

        <div v-if="visibleItems.length === 0" class="category-empty-state">
          <div class="category-empty-icon">
            <i class="tags icon"></i>
          </div>
          <div class="category-empty-text">
            {{ searchText ? 'No categories match your search.' : 'No saved categories are available yet.' }}
          </div>
          <button
            v-if="!searchText"
            type="button"
            class="ui positive button category-empty-button"
            @click="focusField('newCategoryInput')"
          >
            Add Category
          </button>
        </div>

        <div v-else class="category-table-wrapper">
          <table class="ui celled compact table category-table">
            <thead>
              <tr>
                <th><i class="tag icon"></i> Category Name</th>
                <th class="center aligned" width="180"><i class="layer group icon"></i> Words Linked</th>
                <th class="center aligned" width="160"><i class="cog icon"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="category in visibleItems">
                <tr :key="category._id" :class="{ 'category-row-expanded': expandedCategoryId === category._id }">
                <!-- Cột tên -->
                <td>
                  <div v-if="editingCategoryId === category._id" class="ui input fluid">
                    <input
                      type="text"
                      ref="editingCategoryInput"
                      v-model.trim="editingCategoryName"
                      placeholder="Enter category name..."
                      @keyup.enter="saveCategoryEdit(category._id)"
                      @keyup.esc="cancelCategoryEdit"
                    />
                  </div>
                  <div v-else class="category-name-cell">
                    <strong>{{ category.name }}</strong>
                  </div>
                </td>

                <!-- Cột số từ đang dùng -->
                <td class="center aligned">
                  <span class="ui label mini basic category-count">
                    <i class="layer group icon"></i>
                    {{ getWordsInCategory(category._id).length }} {{ getWordsInCategory(category._id).length === 1 ? 'word' : 'words' }}
                  </span>
                </td>

                <!-- Cột thao tác -->
                <td class="center aligned">
                  <!-- Đang sửa dòng này -->
                  <div v-if="editingCategoryId === category._id" class="library-row-actions">
                    <button
                      type="button"
                      class="ui mini positive button icon labeled"
                      title="Save category name"
                      @click="saveCategoryEdit(category._id)"
                    >
                      <i class="check icon"></i> Save
                    </button>
                    <button
                      type="button"
                      class="ui mini basic button icon labeled"
                      title="Cancel"
                      @click="cancelCategoryEdit"
                    >
                      <i class="times icon"></i> Cancel
                    </button>
                  </div>

                  <!-- Không ở chế độ sửa -->
                  <div v-else class="library-row-actions">
                    <button
                      type="button"
                      class="ui icon mini basic button"
                      :class="{ active: expandedCategoryId === category._id }"
                      :title="expandedCategoryId === category._id ? 'Hide words in this category' : 'View words in this category'"
                      @click="toggleCategoryWords(category._id)"
                    >
                      <i class="eye icon"></i>
                    </button>

                    <button
                      type="button"
                      class="ui icon mini basic primary button"
                      title="Edit category"
                      @click="startCategoryEdit(category)"
                    >
                      <i class="edit icon"></i>
                    </button>

                    <button
                      type="button"
                      class="ui icon mini basic negative button"
                      title="Delete category"
                      @click="triggerDeleteCategory(category)"
                    >
                      <i class="trash icon"></i>
                    </button>
                  </div>
                </td>
              </tr>

                <!-- Hàng mở rộng: danh sách từ vựng của category tại chỗ -->
                <tr v-if="expandedCategoryId === category._id" :key="category._id + '-words'" class="category-words-row">
                  <td colspan="3">
                    <div class="category-words-inline">
                      <div class="category-words-inline-title">
                        <i class="book open icon"></i>
                        Words in “{{ category.name }}”
                        <span class="category-words-count">{{ getWordsInCategory(category._id).length }}</span>
                      </div>
                      <div v-if="getWordsInCategory(category._id).length === 0" class="category-words-empty">
                        No words in this category yet.
                      </div>
                      <div v-else class="category-words-list">
                        <div v-for="word in getWordsInCategory(category._id)" :key="word._id" class="category-word-item">
                          <i :class="[word.favourite ? 'star icon yellow' : 'star outline icon grey']" class="category-word-star"></i>
                          <span class="category-word-lang"><strong>EN</strong> {{ word.english }}</span>
                          <span class="category-word-lang"><strong>DE</strong> {{ word.german }}</span>
                          <span class="category-word-lang"><strong>FR</strong> {{ word.french }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination controls -->
        <div v-if="categories.length > 0" class="category-pagination">
          <span class="pagination-summary">
            {{ paginationSummary }}
          </span>

          <div class="pagination-controls" v-if="totalPages > 1">
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
      title="Delete Category"
      :message="deleteMessage"
      confirm-text="Delete Category"
      cancel-text="Cancel"
      @confirm="onConfirmDeleteCategory"
      @cancel="onCancelDeleteCategory"
    />
  </div>
</template>

<script>
// ── Trang quản lý Category ───────────────────────────────────────────
// Tạo, sửa, xóa category. Có phân trang. Mọi category được đối xử như nhau.
import {
  getWords,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategoryName
} from '../helpers/helpers';
import { paginationMixin, focusFieldMixin } from '../helpers/mixins';
import ConfirmModal from '../components/ConfirmModal.vue';

export default {
  name: 'categories',
  components: { ConfirmModal },
  mixins: [paginationMixin, focusFieldMixin],
  data() {
    return {
      categories: [],          // danh sách tất cả category
      words: [],               // danh sách tất cả words (để đếm số từ/category)
      newCategoryName: '',     // tên category mới trong ô input
      searchText: '',          // từ khóa tìm kiếm category theo tên
      editingCategoryId: '',   // ID category đang được chỉnh sửa inline
      editingCategoryName: '', // tên mới khi đang sửa inline
      errorMessage: '',        // Thông báo lỗi validate thủ công
      expandedCategoryId: '',  // ID category đang mở rộng xem từ vựng tại chỗ
      isConfirmOpen: false,    // Cờ bật/tắt modal xóa
      categoryToDelete: null   // Category chuẩn bị xóa
    };
  },
  watch: {
    // Thay đổi từ khóa tìm kiếm → quay về trang 1
    searchText: 'resetPage'
  },
  computed: {
    deleteMessage() {
      if (!this.categoryToDelete) return '';
      return `Are you sure you want to delete "${this.categoryToDelete.name}"? This action cannot be undone.`;
    },
    // Lọc category theo từ khóa tìm kiếm (không phân biệt hoa thường)
    filteredCategories() {
      const query = this.searchText.trim().toLowerCase();
      if (!query) return this.categories;
      return this.categories.filter(category =>
        category.name.toLowerCase().includes(query)
      );
    },
    // Nguồn dữ liệu & nhãn cho paginationMixin (logic phân trang dùng chung)
    paginationItems() {
      return this.filteredCategories;
    },
    paginationLabel() {
      return 'categories';
    }
  },
  mounted() {
    this.loadPageData();
  },
  methods: {
    clearCategorySearch() {
      this.searchText = '';
    },
    getWordsInCategory(categoryId) {
      return this.words.filter(
        word => word.category && word.category._id === categoryId
      );
    },
    // Mở/đóng danh sách từ vựng của category ngay tại chỗ (không reload, dùng dữ liệu đã tải)
    toggleCategoryWords(categoryId) {
      this.expandedCategoryId = this.expandedCategoryId === categoryId ? '' : categoryId;
    },
    async loadPageData() {
      try {
        const [categoriesData, wordsData] = await Promise.all([getCategories(), getWords()]);
        this.categories = categoriesData;
        this.words = wordsData;
      } catch {
        this.flash('Failed to load page data.', 'error');
      }
    },

    // ── CRUD Category ────────────────────────────────────────────────
    async createNewCategory() {
      const name = this.newCategoryName.trim();

      // Validate dùng chung (đồng bộ rule với backend)
      const error = validateCategoryName(name);
      if (error) {
        this.errorMessage = error;
        return;
      }

      this.errorMessage = '';

      try {
        await createCategory({ name });
        this.flash('Category created!', 'success');
        this.newCategoryName = '';
        await this.loadPageData();

        const categoryIndex = this.filteredCategories.findIndex(
          category => category.name.toLowerCase() === name.toLowerCase()
        );
        if (categoryIndex !== -1) {
          this.currentPage = Math.floor(categoryIndex / this.pageSize) + 1;
        }
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'Failed to create category.';
      }
    },

    startCategoryEdit(category) {
      this.editingCategoryId = category._id;
      this.editingCategoryName = category.name;
      // Tự focus vào ô nhập khi bắt đầu sửa (ref trong v-for trả về mảng)
      this.$nextTick(() => {
        const ref = this.$refs.editingCategoryInput;
        const input = Array.isArray(ref) ? ref[0] : ref;
        if (input) input.focus();
      });
    },

    cancelCategoryEdit() {
      this.editingCategoryId = '';
      this.editingCategoryName = '';
    },

    async saveCategoryEdit(categoryId) {
      const name = this.editingCategoryName.trim();
      const error = validateCategoryName(name);
      if (error) return this.flash(error, 'error');

      try {
        await updateCategory({ _id: categoryId, name });
        this.flash('Category renamed!', 'success');
        this.cancelCategoryEdit();
        await this.loadPageData();
      } catch (error) {
        this.flash(error?.response?.data?.message || 'Failed to rename.', 'error');
      }
    },

    // ── Xóa category với ConfirmModal ─────────────────────────────
    triggerDeleteCategory(category) {
      const wordsCount = this.getWordsInCategory(category._id).length;
      if (wordsCount > 0) {
        return this.flash('Cannot delete a category with linked words.', 'error');
      }
      this.categoryToDelete = category;
      this.isConfirmOpen = true;
    },

    onCancelDeleteCategory() {
      this.isConfirmOpen = false;
      this.categoryToDelete = null;
    },

    async onConfirmDeleteCategory() {
      if (!this.categoryToDelete) return;

      try {
        await deleteCategory(this.categoryToDelete._id);
        this.flash('Category deleted.', 'success');
        await this.loadPageData();
      } catch {
        this.flash('Failed to delete category.', 'error');
      } finally {
        this.isConfirmOpen = false;
        this.categoryToDelete = null;
      }
    }
  }
};
</script>

<style scoped>
.categories-page {
  padding-bottom: 2rem;
}

/* Ô tìm kiếm category */
.category-search {
  max-width: 340px;
  margin-bottom: 1rem;
}
.category-search-input input {
  padding: 0.6rem 2.4rem 0.6rem 0.9rem !important;
  border-color: #cbd5e1 !important;
  border-radius: 8px !important;
  font-size: 0.85rem;
}
.category-search-input > i.icon {
  color: #94a3b8;
}
.category-search-clear {
  cursor: pointer !important;
  pointer-events: auto !important;
  transition: color 0.15s ease;
}
.category-search-clear:hover {
  color: #ef4444 !important;
}

/* Hàng mở rộng: từ vựng của category tại chỗ */
.category-row-expanded > td {
  background: #f8fafc !important;
}
.category-words-row > td {
  padding: 0.9rem 1rem !important;
  background: #f8fafc !important;
}
.category-words-inline-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.6rem;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.category-words-inline-title .icon {
  display: block;
  margin: 0 !important;
  font-size: 0.8rem;
  line-height: 1;
}
.category-words-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 0.4rem;
  background: #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0;
}
.category-words-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-width: 900px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 0.25rem;
}
.category-words-list::-webkit-scrollbar {
  width: 6px;
}
.category-words-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.category-word-item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  padding: 0.5rem 0.85rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  font-size: 0.82rem;
}
.category-word-star {
  display: block;
  margin: 0 !important;
  line-height: 1;
}
.category-word-lang {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.category-word-lang strong {
  margin-right: 0.45rem;
  color: #94a3b8;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.category-words-empty {
  padding: 0.25rem 0;
  color: #94a3b8;
  font-size: 0.82rem;
}
.library-row-actions .ui.button.active {
  color: #2563eb;
  background: #eff6ff;
}

.category-create-panel {
  margin-bottom: 1.25rem !important;
}

.category-create-control {
  display: flex !important;
  width: 100% !important;
  border-radius: 6px !important;
  overflow: hidden;
}
.category-create-control input {
  flex: 1 1 auto !important;
  width: 100% !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-radius: 6px 0 0 6px !important;
}
.category-create-control .ui.button {
  flex: 0 0 auto !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-radius: 0 6px 6px 0 !important;
  margin: 0 !important;
}

.category-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.category-table {
  width: 100%;
  margin: 0 !important;
  border-radius: 6px !important;
  overflow: hidden !important;
}

.category-table th {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  color: #64748b !important;
  background: #f8fafc !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.category-table td {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  vertical-align: middle !important;
  color: #334155;
  border-bottom: 1px solid #f1f5f9 !important;
  font-size: 0.875rem;
}

.category-table tbody tr:hover td {
  background: #f8fafc !important;
}

.category-table tbody tr:last-child td {
  border-bottom: none !important;
}

.category-name-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.category-name-cell strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #0f172a;
}

.category-count {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.3rem !important;
  background: #f1f5f9 !important;
  color: #334155 !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 4px !important;
  padding: 0.25em 0.6em !important;
  font-weight: 500 !important;
}

.library-row-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}
.library-row-actions .ui.button {
  margin: 0;
  padding: 0.4rem 0.5rem !important;
  border-radius: 4px !important;
}

.category-empty-state {
  padding: 2.5rem 1.5rem;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #64748b;
  background: #f8fafc;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.category-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.category-empty-icon .icon {
  margin: 0 !important;
  font-size: 2rem;
  line-height: 1;
}
.category-empty-text {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.category-empty-button {
  padding: 0.6rem 1.25rem !important;
  border-radius: 6px !important;
  font-size: 0.9rem;
}

/* Pagination */
.category-pagination {
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
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-num {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #334155;
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
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  font-weight: 600;
}
</style>
