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

    <!-- Form thêm category -->
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
              <tr v-for="cat in categories" :key="cat._id">
                <!-- Cột tên -->
                <td>
                  <div v-if="editId === cat._id" class="ui input fluid">
                    <input
                      type="text"
                      v-model.trim="editName"
                      minlength="2"
                      maxlength="40"
                      @keyup.enter="onSaveEdit(cat._id)"
                      @keyup.esc="onCancelEdit"
                    />
                  </div>
                  <div v-else class="category-name-cell">
                    <strong>{{ cat.name }}</strong>
                    <span v-if="isGeneral(cat.name)" class="ui label basic tiny">
                      Protected default
                    </span>
                  </div>
                </td>

                <!-- Cột số từ đang dùng -->
                <td class="center aligned">
                  <span class="ui circular label category-count">{{ getWordCount(cat.name) }}</span>
                </td>

                <!-- Cột thao tác -->
                <td class="center aligned">
                  <!-- Đang sửa dòng này -->
                  <div v-if="editId === cat._id" class="category-row-actions">
                    <button class="ui positive tiny button" @click="onSaveEdit(cat._id)">
                      <i class="save icon"></i>
                      Save
                    </button>
                    <button class="ui basic tiny button" @click="onCancelEdit">Cancel</button>
                  </div>

                  <!-- Không ở chế độ sửa và không bị khóa -->
                  <div v-else-if="!isGeneral(cat.name)" class="category-row-actions">
                    <button class="ui basic primary tiny button icon labeled" @click="onStartEdit(cat)">
                      <i class="edit icon"></i> Edit
                    </button>
                    <button class="ui basic negative tiny button icon labeled" @click="onDelete(cat)">
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
      editId: '', // Id đang sửa.
      editName: '' // Tên đang sửa.
    };
  },
  async mounted() {
    // Khi mở trang, gọi `loadData()` để nạp cả category lẫn words vì màn này cần hai nguồn dữ liệu.
    await this.loadData();
  },
  methods: {
    isGeneral(name) {
      // Chuẩn hóa `name` rồi kiểm tra có phải `General` không để khóa sửa và xóa.
      return (name || '').trim().toLowerCase() === 'general';
    },
    async loadData() {
      try {
        // Gọi `getCategories()` để lấy category từ backend, sắp lại thứ tự rồi lưu vào `this.categories`.
        const categoryList = await getCategories();

        // Giữ `General` đứng đầu, các category còn lại sắp xếp alphabet để bảng dễ nhìn hơn.
        const general = categoryList.find(cat => this.isGeneral(cat.name));
        const others = categoryList
          .filter(cat => !this.isGeneral(cat.name))
          .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        this.categories = general ? [general, ...others] : others;

        // Gọi thêm `getWords()` để lấy danh sách từ và lưu vào `this.words`, vì cột "Words Linked" cần dữ liệu này để đếm.
        const wordData = await getWords();
        this.words = Array.isArray(wordData) ? wordData : [];
      } catch (e) {
        console.error('Failed to load categories data', e);
      }
    },
    getWordCount(catName) {
      // Dùng `this.words` để đếm xem một category đang được bao nhiêu từ sử dụng.
      return this.words.filter(
        word => (word.category || '').trim().toLowerCase() === (catName || '').trim().toLowerCase()
      ).length;
    },
    async onCreateCategory() {
      // Lấy tên từ `newCategoryName`, trim lại, kiểm tra hợp lệ rồi gửi qua `createCategory()` để lưu vào database.
      const name = this.newCategoryName.trim();
      if (!name) {
        this.flash('Category name is required.', 'error');
        return;
      }
      if (this.isGeneral(name)) {
        this.flash('General is a protected category.', 'error');
        return;
      }
      if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        this.flash('Category already exists.', 'error');
        return;
      }

      try {
        // Tạo xong thì xóa ô nhập `newCategoryName` và gọi lại `loadData()` để bảng lấy dữ liệu mới từ backend.
        await createCategory({ name });
        this.flash('Category created successfully!', 'success');
        this.newCategoryName = '';
        await this.loadData();
      } catch (e) {
        const message =
          e.response && e.response.data && e.response.data.message
            ? e.response.data.message
            : 'Failed to create category.';
        this.flash(message, 'error');
      }
    },
    onStartEdit(cat) {
      // Lưu `_id` vào `editId` và tên hiện tại vào `editName` để chuyển đúng dòng sang chế độ sửa.
      if (this.isGeneral(cat.name)) return;
      this.editId = cat._id;
      this.editName = cat.name;
    },
    onCancelEdit() {
      // Xóa `editId` và `editName` để thoát chế độ sửa, không lưu gì xuống backend.
      this.editId = '';
      this.editName = '';
    },
    async onSaveEdit(id) {
      // Lấy tên mới từ `editName`, kiểm tra hợp lệ rồi gửi qua `updateCategory()` để cập nhật trong database.
      const name = this.editName.trim();
      if (!name) {
        this.flash('Category name is required.', 'error');
        return;
      }
      if (this.isGeneral(name)) {
        this.flash('General is a protected category.', 'error');
        return;
      }
      if (this.categories.some(cat => cat._id !== id && cat.name.toLowerCase() === name.toLowerCase())) {
        this.flash('Category already exists.', 'error');
        return;
      }

      try {
        // Backend sẽ đổi tên category và đồng bộ tên mới xuống các word đang dùng category đó; sau đó gọi `loadData()` để nạp lại bảng.
        await updateCategory({ _id: id, name });
        this.flash('Category renamed successfully!', 'success');
        this.editId = '';
        this.editName = '';
        await this.loadData();
      } catch (e) {
        const message =
          e.response && e.response.data && e.response.data.message
            ? e.response.data.message
            : 'Failed to update category.';
        this.flash(message, 'error');
      }
    },
    async onDelete(cat) {
      // Chặn xóa nếu đây là `General` vì category mặc định này bị khóa.
      if (this.isGeneral(cat.name)) return;

      // Dùng `getWordCount()` để kiểm tra category còn đang được từ nào dùng không; còn dùng thì không cho xóa.
      const wordCount = this.getWordCount(cat.name);
      if (wordCount > 0) {
        this.flash('Cannot delete a category that has words assigned.', 'error');
        return;
      }

      // Hỏi lại user bằng `window.confirm()` trước khi gọi `deleteCategory()` xóa khỏi database.
      if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
        return;
      }
      try {
        await deleteCategory(cat._id);
        this.flash('Category deleted successfully.', 'success');

        // Xóa xong thì gọi `loadData()` để cập nhật lại danh sách category và số từ đang liên kết.
        await this.loadData();
      } catch (e) {
        const message =
          e.response && e.response.data && e.response.data.message
            ? e.response.data.message
            : 'Failed to delete category.';
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
