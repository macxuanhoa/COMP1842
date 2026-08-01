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
        <div class="field">
          <label for="new-category-name"><i class="tag icon"></i> Category Name</label>
          <div class="ui action input fluid category-create-control">
            <input
              id="new-category-name"
              ref="newCategoryInput"
              type="text"
              placeholder="Enter new category name (e.g. Travel, Business, Food)..."
              v-model.trim="newCategoryName"
              minlength="2"
              maxlength="40"
              required
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
        <span class="workspace-panel-icon" aria-hidden="true">
          <i class="table icon"></i>
        </span>
      </div>

      <div>
        <div v-if="visibleCategories.length === 0" class="category-empty-state">
          <div class="category-empty-icon">
            <i class="tags icon"></i>
          </div>
          <div class="category-empty-text">
            No saved categories are available yet.
          </div>
          <button
            type="button"
            class="ui positive button category-empty-button"
            @click="focusNewCategoryInput"
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
                <th class="center aligned" width="140"><i class="cog icon"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in visibleCategories" :key="category._id">
                <!-- Cột tên -->
                <td>
                  <div v-if="editingCategoryId === category._id" class="ui input fluid">
                    <input
                      type="text"
                      v-model.trim="editingCategoryName"
                      minlength="2"
                      maxlength="40"
                      @keyup.enter="saveCategoryEdit(category._id)"
                      @keyup.esc="cancelCategoryEdit"
                      placeholder="Enter category name..."
                    />
                  </div>
                  <div v-else class="category-name-cell">
                    <strong>{{ category.name }}</strong>
                    <span
                      v-if="isGeneral(category.name)"
                      class="ui label mini basic category-default-label"
                      title="Protected default category"
                    >
                      Default
                    </span>
                  </div>
                </td>

                <!-- Cột số từ đang dùng -->
                <td class="center aligned">
                  <span class="ui label mini basic category-count">
                    <i class="layer group icon"></i>
                    {{ getWordsUsingCategory(category.name) }} {{ getWordsUsingCategory(category.name) === 1 ? 'word' : 'words' }}
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

                  <!-- Không ở chế độ sửa và không bị khóa -->
                  <div v-else-if="!isGeneral(category.name)" class="library-row-actions">
                    <button
                      type="button"
                      class="ui icon mini basic primary button"
                      aria-label="Edit category"
                      title="Edit category"
                      @click="startCategoryEdit(category)"
                    >
                      <i class="edit icon"></i>
                    </button>
                    <button
                      type="button"
                      class="ui icon mini basic negative button"
                      aria-label="Delete category"
                      title="Delete category"
                      @click="deleteCategoryItem(category)"
                    >
                      <i class="trash icon"></i>
                    </button>
                  </div>

                  <!-- Category bị khóa -->
                  <div v-else>
                    <span class="category-locked">
                      <i class="lock icon"></i>
                      Locked
                    </span>
                  </div>
                </td>
              </tr>
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
  </div>
</template>

<script>
import {
  getWords,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../helpers/helpers';

export default {
  name: 'categories',

  data() {
    return {
      categories: [],
      words: [],
      newCategoryName: '',
      editingCategoryId: '',
      editingCategoryName: '',
      currentPage: 1,
      pageSize: 8
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.categories.length / this.pageSize) || 1;
    },

    visibleCategories() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.categories.slice(start, start + this.pageSize);
    },

    paginationSummary() {
      const total = this.categories.length;

      if (total === 0) return '0 categories';

      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(this.currentPage * this.pageSize, total);

      return `Showing ${start}–${end} of ${total} categories`;
    }
  },

  watch: {
    categories() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  },

  mounted() {
    this.loadPageData();
  },

  methods: {
    normalizeName(name) {
      return (name || '').trim().toLowerCase();
    },

    isGeneral(name) {
      return this.normalizeName(name) === 'general';
    },

    focusNewCategoryInput() {
      this.$refs.newCategoryInput?.focus();
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    goToPage(page) {
      this.currentPage = page;
    },

    getWordsUsingCategory(categoryName) {
      const normalizedCategory = this.normalizeName(categoryName);

      return this.words.filter(
        word => this.normalizeName(word.category) === normalizedCategory
      ).length;
    },

    getCategoryNameError(categoryName, ignoredCategoryId = '') {
      if (!categoryName) {
        return 'Category name is required.';
      }

      if (categoryName.length < 2) {
        return 'Category name must be at least 2 characters.';
      }

      if (categoryName.length > 40) {
        return 'Category name cannot exceed 40 characters.';
      }

      if (this.isGeneral(categoryName)) {
        return 'General is a protected category.';
      }

      const categoryExists = this.categories.some(category => {
        return (
          category._id !== ignoredCategoryId &&
          this.normalizeName(category.name) === this.normalizeName(categoryName)
        );
      });

      if (categoryExists) {
        return 'Category already exists.';
      }

      return '';
    },

    getApiError(error, defaultMessage) {
      return error?.response?.data?.message || defaultMessage;
    },

    async loadPageData() {
      try {
        const [categories, words] = await Promise.all([
          getCategories(),
          getWords()
        ]);

        this.categories = Array.isArray(categories) ? categories : [];
        this.words = Array.isArray(words) ? words : [];
      } catch (error) {
        console.error('Failed to load categories data', error);
      }
    },

    async createNewCategory() {
      const categoryName = this.newCategoryName.trim();
      const errorMessage = this.getCategoryNameError(categoryName);

      if (errorMessage) {
        this.flash(errorMessage, 'error');
        return;
      }

      try {
        await createCategory({ name: categoryName });

        this.flash('Category created successfully!', 'success');
        this.newCategoryName = '';

        await this.loadPageData();

        const createdCategoryIndex = this.categories.findIndex(
          category =>
            this.normalizeName(category.name) ===
            this.normalizeName(categoryName)
        );

        if (createdCategoryIndex !== -1) {
          this.currentPage =
            Math.floor(createdCategoryIndex / this.pageSize) + 1;
        }
      } catch (error) {
        this.flash(
          this.getApiError(error, 'Failed to create category.'),
          'error'
        );
      }
    },

    startCategoryEdit(category) {
      if (this.isGeneral(category.name)) return;

      this.editingCategoryId = category._id;
      this.editingCategoryName = category.name;
    },

    cancelCategoryEdit() {
      this.editingCategoryId = '';
      this.editingCategoryName = '';
    },

    async saveCategoryEdit(categoryId) {
      const categoryName = this.editingCategoryName.trim();

      const errorMessage = this.getCategoryNameError(
        categoryName,
        categoryId
      );

      if (errorMessage) {
        this.flash(errorMessage, 'error');
        return;
      }

      try {
        await updateCategory({
          _id: categoryId,
          name: categoryName
        });

        this.flash('Category renamed successfully!', 'success');
        this.cancelCategoryEdit();

        await this.loadPageData();
      } catch (error) {
        this.flash(
          this.getApiError(error, 'Failed to update category.'),
          'error'
        );
      }
    },

    async deleteCategoryItem(category) {
      if (this.isGeneral(category.name)) return;

      if (this.getWordsUsingCategory(category.name) > 0) {
        this.flash(
          'Cannot delete a category that has words assigned.',
          'error'
        );
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      );

      if (!confirmed) return;

      try {
        await deleteCategory(category._id);

        this.flash('Category deleted successfully.', 'success');
        await this.loadPageData();
      } catch (error) {
        this.flash(
          this.getApiError(error, 'Failed to delete category.'),
          'error'
        );
      }
    }
  }
};
</script>

<style scoped>
.categories-page {
  padding-bottom: 2rem;
}

.category-create-panel {
  margin-bottom: 1.5rem !important;
}

.category-create-control {
  display: flex !important;
  width: 100% !important;
}
.category-create-control input {
  flex: 1 1 auto !important;
  width: 100% !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
.category-create-control .ui.button {
  flex: 0 0 auto !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin: 0 !important;
}

.category-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.category-table {
  width: 100%;
  margin: 0 !important;
}

.category-table th {
  padding-top: 0.85rem !important;
  padding-bottom: 0.85rem !important;
  color: #0f172a !important;
  background: #f8fafc !important;
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid #cbd5e1 !important;
}

.category-table td {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  vertical-align: middle !important;
  color: #1e293b;
}

.category-name-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
}

.category-name-cell strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-default-label {
  margin: 0 !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-color: #cbd5e1 !important;
  font-weight: 600 !important;
}

.category-count {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.3rem !important;
  background: #f1f5f9 !important;
  color: #334155 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  padding: 0.3em 0.65em !important;
  font-weight: 600 !important;
}

.library-row-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
}
.library-row-actions .ui.button {
  margin: 0;
  padding: 0.55rem 0.6rem !important;
}

.category-locked {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 700;
  vertical-align: middle;
}
.category-locked .icon {
  margin: 0 !important;
  vertical-align: middle;
  line-height: 1;
}

.category-empty-state {
  padding: 3rem 1.75rem;
  border: 1px dashed #d9dee7;
  border-radius: 12px;
  color: #687386;
  background: #fafbfc;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.category-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa3b8;
}
.category-empty-icon .icon {
  margin: 0 !important;
  font-size: 2.75rem;
  line-height: 1;
}
.category-empty-text {
  font-size: 0.9rem;
  color: #64748b;
}

/* Swiss Editorial Pagination */
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
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #0284c7;
  color: #0284c7;
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
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  font-weight: 700;
}
</style>
