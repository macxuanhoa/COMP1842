<template>
  <div class="workspace-page categories-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="tags icon"></i>
          Organise your library
        </div>
        <h1>Category Manager</h1>
        <p>Create, rename, and manage the topics used across your vocabulary collection.</p>
      </div>
      <div class="workspace-header__actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="book open icon"></i>
          Open Library
        </router-link>
      </div>
    </header>

    <!-- 1. Add Category Form -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="plus icon"></i>
          </span>
          <div>
            <h2>Add category</h2>
            <p>Create a clear topic for grouping related words.</p>
          </div>
        </div>
      </div>
      <form class="ui form" @submit.prevent="onCreateCategory">
        <div class="field">
          <label>Category name</label>
          <div class="ui action input fluid category-create-control">
            <input
              type="text"
              placeholder="Enter category name..."
              v-model.trim="newCategoryName"
              maxlength="40"
              required
            />
            <button class="ui primary button icon labeled" type="submit">
              <i class="plus icon"></i> Add
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- 2. Categories List -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon violet" aria-hidden="true">
            <i class="list ul icon"></i>
          </span>
          <div>
            <h2>Saved categories</h2>
            <p>{{ categories.length }} {{ categories.length === 1 ? 'category' : 'categories' }} available</p>
          </div>
        </div>
      </div>

      <div>
        <div class="category-table-wrapper">
          <table class="ui celled compact table category-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th class="center aligned" width="140">Words Linked</th>
                <th class="center aligned" width="220">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in paginatedCategories" :key="cat._id">
                <!-- Name Column -->
                <td>
                  <div v-if="editId === cat._id" class="ui input fluid">
                    <input
                      type="text"
                      v-model.trim="editName"
                      maxlength="40"
                      @keyup.enter="onSaveEdit(cat._id)"
                      @keyup.esc="onCancelEdit"
                    />
                  </div>
                  <div v-else class="category-name-cell">
                    <strong>{{ cat.name }}</strong>
                    <span v-if="isGeneralCategoryName(cat.name)" class="ui label basic tiny">
                      Protected default
                    </span>
                  </div>
                </td>

                <!-- Words Linked Column -->
                <td class="center aligned">
                  <span class="ui circular label category-count">{{ getWordCount(cat.name) }}</span>
                </td>

                <!-- Action buttons -->
                <td class="center aligned">
                  <!-- If editing this row -->
                  <div v-if="editId === cat._id" class="category-row-actions">
                    <button class="ui positive tiny button" @click="onSaveEdit(cat._id)">
                      <i class="save icon"></i>
                      Save
                    </button>
                    <button class="ui basic tiny button" @click="onCancelEdit">Cancel</button>
                  </div>

                  <!-- If not editing and not protected -->
                  <div v-else-if="!isGeneralCategoryName(cat.name)" class="category-row-actions">
                    <button class="ui basic primary tiny button icon labeled" @click="onStartEdit(cat)">
                      <i class="edit icon"></i> Edit
                    </button>
                    <button class="ui basic negative tiny button icon labeled" @click="onTriggerDelete(cat)">
                      <i class="trash icon"></i> Delete
                    </button>
                  </div>

                  <!-- If protected -->
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

        <!-- Pagination Footer -->
        <div v-if="totalPages > 1" class="ui grid middle aligned category-pagination">
          <div class="five wide column left aligned">
            <button class="ui button icon labeled mini" :disabled="currentPage === 1" @click="prevPage">
              <i class="left arrow icon"></i> Previous
            </button>
          </div>
          <div class="six wide column center aligned category-pagination__status">
            <strong>Page {{ currentPage }}</strong> of {{ totalPages }}
          </div>
          <div class="five wide column right aligned">
            <button class="ui button icon labeled mini" :disabled="currentPage === totalPages" @click="nextPage">
              <i class="right arrow icon"></i> Next
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Confirm Modal -->
  </div>
</template>

<script>
import { getWords, getCategories, createCategory, updateCategory, deleteCategory } from '../helpers/helpers';
import { normalizeCategoryName, getCategoryNameError, isGeneralCategoryName } from '../utils/categoryValidation';

export default {
  name: 'categories',
  data() {
    return {
      categories: [],
      words: [],
      newCategoryName: '',
      editId: '',
      editName: '',
      currentPage: 1,
      pageSize: 10
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.categories.length / this.pageSize) || 1;
    },
    paginatedCategories() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.categories.slice(start, end);
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    isGeneralCategoryName,
    async loadData() {
      try {
        const categoryList = await getCategories();
        const general = categoryList.find(category => isGeneralCategoryName(category.name));
        const others = categoryList.filter(category => !isGeneralCategoryName(category.name));
        others.sort((a, b) => normalizeCategoryName(a.name).toLowerCase().localeCompare(normalizeCategoryName(b.name).toLowerCase()));
        this.categories = general
          ? [general, ...others]
          : others;

        const wordData = await getWords();
        this.words = Array.isArray(wordData) ? wordData : [];

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      } catch (e) {
        console.error('Failed to load categories data', e);
      }
    },
    getWordCount(catName) {
      const normalizedCatName = normalizeCategoryName(catName).toLowerCase();
      return this.words.filter(word => normalizeCategoryName(word.category).toLowerCase() === normalizedCatName).length;
    },
    handleApiError(e, fallback) {
      if (e.response && e.response.data && e.response.data.message) {
        this.flash(e.response.data.message, 'error');
      } else {
        this.flash(fallback, 'error');
      }
    },
    validateCategoryName(value, currentId = '') {
      const name = normalizeCategoryName(value);
      const error = getCategoryNameError(name);

      if (error) {
        this.flash(error, 'error');
        return '';
      }

      if (isGeneralCategoryName(name)) {
        this.flash('General is a protected category.', 'error');
        return '';
      }

      const normalizedName = name.toLowerCase();
      const duplicate = this.categories.some(
        category => category._id !== currentId && normalizeCategoryName(category.name).toLowerCase() === normalizedName
      );

      if (duplicate) {
        this.flash('Category name already exists.', 'error');
        return '';
      }

      return name;
    },
    async onCreateCategory() {
      const name = this.validateCategoryName(this.newCategoryName);
      if (!name) return;

      try {
        await createCategory({ name });
        this.flash('Category created successfully!', 'success');
        this.newCategoryName = '';
        this.currentPage = 1;
        await this.loadData();
      } catch (e) {
        console.error(e);
        this.handleApiError(e, 'Failed to create category.');
      }
    },
    onStartEdit(cat) {
      if (isGeneralCategoryName(cat.name)) return;
      this.editId = cat._id;
      this.editName = cat.name;
    },
    onCancelEdit() {
      this.editId = '';
      this.editName = '';
    },
    async onSaveEdit(id) {
      const name = this.validateCategoryName(this.editName, id);
      if (!name) return;

      try {
        await updateCategory({ _id: id, name });
        this.flash('Category renamed successfully!', 'success');
        this.editId = '';
        this.editName = '';
        await this.loadData();
      } catch (e) {
        console.error(e);
        this.handleApiError(e, 'Failed to update category.');
      }
    },
    async onTriggerDelete(cat) {
      if (isGeneralCategoryName(cat.name)) return;
      const wordCount = this.getWordCount(cat.name);
      if (wordCount > 0) {
        this.flash('Cannot delete a category that has words assigned.', 'error');
        return;
      }
      if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
        return;
      }
      try {
        await deleteCategory(cat._id);
        this.flash('Category deleted successfully.', 'success');
        await this.loadData();
      } catch (e) {
        console.error(e);
        this.handleApiError(e, 'Failed to delete category.');
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage -= 1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage += 1;
    }
  }
};
</script>

<style scoped>
.category-create-control .ui.button {
  margin: 0;
}

.category-table-wrapper {
  width: 100%;
  overflow: visible;
}

.category-table {
  width: 100%;
  margin: 0 !important;
  table-layout: fixed;
}

.category-table th {
  padding-top: 0.8rem !important;
  padding-bottom: 0.8rem !important;
  color: #6d788a !important;
  background: #f7f9fb !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.04em;
  text-transform: uppercase !important;
}

.category-table td {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  vertical-align: middle;
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

.category-name-cell .ui.label {
  flex: 0 0 auto;
  margin: 0;
}

.category-count {
  min-width: 30px;
  color: #2185d0 !important;
  background: #eaf5fc !important;
}

.category-row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.category-row-actions .ui.button {
  margin: 0;
}

.category-locked {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #8b94a4;
  font-size: 0.78rem;
  font-weight: 700;
  vertical-align: middle;
}

.category-locked .icon {
  margin: 0 !important;
  vertical-align: middle;
  line-height: 1;
}

.category-pagination {
  margin: 1.5rem 0 0 !important;
}

.category-pagination__status {
  color: #687386;
  line-height: 28px;
}

.category-delete-lead {
  margin: 0 0 1rem;
  color: #4a5568;
  font-size: 0.95rem;
  text-align: center;
}

.category-delete-lead strong {
  color: #2d3748;
  font-weight: 600;
}

.category-delete-impact {
  padding: 0.75rem;
  border: 1px solid #e5e9f0;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 0.9rem;
  text-align: center;
}

.category-delete-impact p {
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
}
</style>
