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
      <div class="workspace-header-actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="book open icon"></i>
          Open Library
        </router-link>
      </div>
    </header>

    <!-- Form thêm category -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="plus icon"></i>
          </span>
          <div>
            <h2>Add category</h2>
            <p>Create a clear topic for grouping related words.</p>
          </div>
        </div>
      </div>
      <form class="ui form" @submit.prevent="createNewCategory">
        <div class="field">
          <label>Category name</label>
          <div class="ui action input fluid category-create-control">
            <input
              type="text"
              placeholder="Enter category name..."
              v-model.trim="newCategoryName"
              minlength="2"
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

    <!-- Danh sách category -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
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
              <tr v-for="category in categories" :key="category._id">
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
                    />
                  </div>
                  <div v-else class="category-name-cell">
                    <strong>{{ category.name }}</strong>
                    <span v-if="isGeneral(category.name)" class="ui label basic tiny">
                      Protected default
                    </span>
                  </div>
                </td>

                <!-- Cột số từ đang dùng -->
                <td class="center aligned">
                  <span class="ui circular label category-count">{{ getWordsUsingCategory(category.name) }}</span>
                </td>

                <!-- Cột thao tác -->
                <td class="center aligned">
                  <!-- Đang sửa dòng này -->
                  <div v-if="editingCategoryId === category._id" class="category-row-actions">
                    <button class="ui positive tiny button" @click="saveCategoryEdit(category._id)">
                      <i class="save icon"></i>
                      Save
                    </button>
                    <button class="ui basic tiny button" @click="cancelCategoryEdit">Cancel</button>
                  </div>

                  <!-- Không ở chế độ sửa và không bị khóa -->
                  <div v-else-if="!isGeneral(category.name)" class="category-row-actions">
                    <button class="ui basic primary tiny button icon labeled" @click="startCategoryEdit(category)">
                      <i class="edit icon"></i> Edit
                    </button>
                    <button class="ui basic negative tiny button icon labeled" @click="deleteCategoryItem(category)">
                      <i class="trash icon"></i> Delete
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
      </div>
    </section>
  </div>
</template>

<script>
import { getWords, getCategories, createCategory, updateCategory, deleteCategory } from '../helpers/helpers';

export default {
  name: 'categories',
  data() {
    return {
      categories: [], // Danh sách category.
      words: [], // Danh sách từ.
      newCategoryName: '', // Tên category mới.
      editingCategoryId: '', // Id đang sửa.
      editingCategoryName: '' // Tên đang sửa.
    };
  },
  async mounted() {
    // Khi mở trang, gọi `loadPageData()` để nạp cả category lẫn words vì màn này cần hai nguồn dữ liệu.
    await this.loadPageData();
  },
  methods: {
    isGeneral(name) {
      // Chuẩn hóa `name` rồi kiểm tra có phải `General` không để khóa sửa và xóa.
      return (name || '').trim().toLowerCase() === 'general';
    },
    async loadPageData() {
      try {
        this.categories = await getCategories();
        const wordData = await getWords();
        this.words = Array.isArray(wordData) ? wordData : [];
      } catch (error) {
        console.error('Failed to load categories data', error);
      }
    },
    getWordsUsingCategory(categoryName) {
      // Dùng `this.words` để đếm xem một category đang được bao nhiêu từ sử dụng.
      return this.words.filter(
        word => (word.category || '').trim().toLowerCase() === (categoryName || '').trim().toLowerCase()
      ).length;
    },
    async createNewCategory() {
      // Lấy tên từ `newCategoryName`, trim lại, kiểm tra hợp lệ rồi gửi qua `createCategory()` để lưu vào database.
      const categoryName = this.newCategoryName.trim();
      if (!categoryName) {
        this.flash('Category name is required.', 'error');
        return;
      }
      if (categoryName.length < 2) {
        this.flash('Category name must be at least 2 characters.', 'error');
        return;
      }
      if (categoryName.length > 40) {
        this.flash('Category name cannot exceed 40 characters.', 'error');
        return;
      }
      if (this.isGeneral(categoryName)) {
        this.flash('General is a protected category.', 'error');
        return;
      }
      if (this.categories.some(category => category.name.toLowerCase() === categoryName.toLowerCase())) {
        this.flash('Category already exists.', 'error');
        return;
      }

      try {
        // Tạo xong thì xóa ô nhập `newCategoryName` và gọi lại `loadPageData()` để bảng lấy dữ liệu mới từ backend.
        await createCategory({ name: categoryName });
        this.flash('Category created successfully!', 'success');
        this.newCategoryName = '';
        await this.loadPageData();
      } catch (error) {
        const message = error?.response?.data?.message || 'Failed to create category.';
        this.flash(message, 'error');
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
      if (!categoryName) {
        this.flash('Category name is required.', 'error');
        return;
      }
      if (categoryName.length < 2) {
        this.flash('Category name must be at least 2 characters.', 'error');
        return;
      }
      if (categoryName.length > 40) {
        this.flash('Category name cannot exceed 40 characters.', 'error');
        return;
      }
      if (this.isGeneral(categoryName)) {
        this.flash('General is a protected category.', 'error');
        return;
      }
      if (this.categories.some(category => category._id !== categoryId && category.name.toLowerCase() === categoryName.toLowerCase())) {
        this.flash('Category already exists.', 'error');
        return;
      }

      try {
        await updateCategory({ _id: categoryId, name: categoryName });
        this.flash('Category renamed successfully!', 'success');
        this.editingCategoryId = '';
        this.editingCategoryName = '';
        await this.loadPageData();
      } catch (error) {
        const message = error?.response?.data?.message || 'Failed to update category.';
        this.flash(message, 'error');
      }
    },
    async deleteCategoryItem(category) {
      if (this.isGeneral(category.name)) return;

      const usedWordCount = this.getWordsUsingCategory(category.name);
      if (usedWordCount > 0) {
        this.flash('Cannot delete a category that has words assigned.', 'error');
        return;
      }

      if (!window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
        return;
      }
      try {
        await deleteCategory(category._id);
        this.flash('Category deleted successfully.', 'success');
        await this.loadPageData();
      } catch (error) {
        const message = error?.response?.data?.message || 'Failed to delete category.';
        this.flash(message, 'error');
      }
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
</style>
