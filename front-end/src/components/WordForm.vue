<template>
  <form action="#" class="ui form word-form" @submit.prevent="onSubmit">
    <div v-if="errorMessage" class="ui negative message">
      <p>{{ errorMessage }}</p>
    </div>

    <div class="word-form-languages">
      <div class="field">
        <label for="german-input" class="clickable-label" @click="focusField('germanInput')">German</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="germany flag"></i> DE</div>
          <input
            id="german-input"
            ref="germanInput"
            type="text"
            placeholder="Enter German word..."
            v-model.trim="word.german"
            maxlength="80"
            @input="clearError"
          />
        </div>
      </div>

      <div class="field">
        <label for="english-input" class="clickable-label" @click="focusField('englishInput')">English</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="united kingdom flag"></i> EN</div>
          <input
            id="english-input"
            ref="englishInput"
            type="text"
            placeholder="Enter English word..."
            v-model.trim="word.english"
            maxlength="80"
            @input="clearError"
          />
        </div>
      </div>

      <div class="field">
        <label for="french-input" class="clickable-label" @click="focusField('frenchInput')">French</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="france flag"></i> FR</div>
          <input
            id="french-input"
            ref="frenchInput"
            type="text"
            placeholder="Enter French word..."
            v-model.trim="word.french"
            maxlength="80"
            @input="clearError"
          />
        </div>
      </div>
    </div>

    <div class="field">
      <label>Category</label>
      <div class="word-form-category-row">
        <select
          class="ui fluid dropdown"
          v-model="selectedCategoryId"
          :disabled="isAddingCategory"
          @change="clearError"
        >
          <option value="" disabled>Select a category…</option>
          <option
            v-for="category in categories"
            :key="category._id"
            :value="category._id"
          >
            {{ category.name }}
          </option>
        </select>
        <button class="ui basic button word-form-category-button" type="button" @click="toggleCategoryInput">
          {{ isAddingCategory ? 'Use Existing' : 'New Category' }}
        </button>
      </div>
    </div>

    <div v-if="isAddingCategory" class="field">
      <label for="new-category-input" class="clickable-label" @click="focusField('newCategoryInput')">New Category</label>
      <input
        id="new-category-input"
        ref="newCategoryInput"
        type="text"
        placeholder="Enter category name..."
        v-model.trim="newCategoryName"
        @input="clearError"
      />
    </div>

    <div class="field word-form-favourite" :class="{ 'favourite-active': word.favourite }">
      <label for="favourite-check" class="favourite-label">
        <input
          type="checkbox"
          id="favourite-check"
          class="favourite-input"
          v-model="word.favourite"
        />
        <span class="favourite-row">
          <span class="favourite-box" aria-hidden="true"><i class="check icon"></i></span>
          <strong><i class="star outline icon"></i> Favourite Word</strong>
        </span>
        <span class="favourite-desc">Keep this word easy to find in your learning collection.</span>
      </label>
    </div>

    <div class="word-form-actions">
      <button class="ui primary button icon labeled" type="submit" :disabled="isSubmitting">
        <i class="save icon"></i> Save Word
      </button>
    </div>
  </form>
</template>

<script>
import { getCategories, createCategory, validateCategoryName } from '../helpers/helpers';
import { focusFieldMixin } from '../helpers/mixins';

export default {
  name: 'WordForm',
  mixins: [focusFieldMixin],
  props: {
    word: {
      type: Object,
      default: () => ({
        german: '',    // Từ tiếng Đức
        english: '',   // Từ tiếng Anh
        french: '',    // Từ tiếng Pháp
        category: '',  // ID danh mục
        favourite: false // Trạng thái yêu thích
      })
    }
  },
  data() {
    return {
      categories: [],          // Danh sách các danh mục khả dụng lấy từ API
      selectedCategoryId: '',  // ID của danh mục đang được chọn trong dropdown
      errorMessage: '',        // Chuỗi thông báo lỗi hiển thị trên đầu form nếu có
      isAddingCategory: false, // Cờ bật/tắt chế độ nhập tên danh mục mới thay vì chọn sẵn
      newCategoryName: '',     // Chuỗi tên danh mục mới khi người dùng đang ở chế độ tạo danh mục mới
      isSubmitting: false      // Cờ trạng thái đang gửi form
    };
  },
  watch: {
    word: {
      immediate: true,
      handler(newWord) {
        this.syncCategoryIdFromWord(newWord);
      }
    }
  },
  async mounted() {
    try {
      this.categories = await getCategories();

      if (this.word && this.word._id) {
        this.syncCategoryIdFromWord(this.word);
      } else {
        if (!this.selectedCategoryId) {
          if (this.categories.length > 0) {
            this.selectedCategoryId = this.categories[0]._id;
          } else {
            this.isAddingCategory = true;
          }
        }
      }
    } catch {
      this.flash('Failed to load categories.', 'error');
    }
  },
  methods: {
    // Người dùng bắt đầu nhập liệu → tắt thông báo lỗi đang hiển thị
    clearError() {
      if (this.errorMessage) this.errorMessage = '';
    },
    // Đồng bộ danh mục đang chọn từ dữ liệu word (dùng chung cho watch & mounted)
    syncCategoryIdFromWord(word) {
      if (word && word._id) {
        if (word.category && word.category._id) {
          this.selectedCategoryId = word.category._id;
        } else if (word.category) {
          this.selectedCategoryId = word.category;
        }
      }
    },
    toggleCategoryInput() {
      this.isAddingCategory = !this.isAddingCategory;
      this.errorMessage = '';
      if (!this.isAddingCategory) {
        this.newCategoryName = '';
        if (this.categories.length > 0 && !this.selectedCategoryId) {
          this.selectedCategoryId = this.categories[0]._id;
        }
      } else {
        this.focusField('newCategoryInput');
      }
    },
    async onSubmit() {
      const missing = [];
      if (!this.word.german || !this.word.german.trim()) missing.push('German');
      if (!this.word.english || !this.word.english.trim()) missing.push('English');
      if (!this.word.french || !this.word.french.trim()) missing.push('French');

      if (this.isAddingCategory && (!this.newCategoryName || !this.newCategoryName.trim())) {
        missing.push('New Category');
      }

      // 1. Validate missing fields
      const totalExpected = this.isAddingCategory ? 4 : 3;
      if (missing.length > 0) {
        if (missing.length === totalExpected) {
          this.errorMessage = 'Please fill in all required fields.';
        } else {
          if (missing.length === 1) {
            if (missing[0] === 'New Category') {
              this.errorMessage = 'Please enter New Category name.';
            } else {
              this.errorMessage = `Please enter ${missing[0]} word.`;
            }
          } else {
            const last = missing.pop();
            const joined = missing.join(', ');
            this.errorMessage = `Please enter ${joined} and ${last}.`;
          }
        }
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      let categoryId = this.selectedCategoryId;

      // 2. Validate & Create New Category if active
      if (this.isAddingCategory) {
        const name = this.newCategoryName.trim();

        // Validate dùng chung (đồng bộ rule với backend)
        const categoryError = validateCategoryName(name);
        if (categoryError) {
          this.errorMessage = categoryError;
          this.isSubmitting = false;
          return;
        }

        try {
          const newCategory = await createCategory({ name });
          this.categories.push(newCategory);
          categoryId = newCategory._id;
          this.isAddingCategory = false;
          this.newCategoryName = '';
        } catch (error) {
          this.errorMessage = error?.response?.data?.message || 'Failed to create category.';
          this.isSubmitting = false;
          return;
        }
      }

      if (!categoryId) {
        this.errorMessage = 'Please select or create a category.';
        this.isSubmitting = false;
        return;
      }

      const payload = {
        german: this.word.german.trim(),
        english: this.word.english.trim(),
        french: this.word.french.trim(),
        category: categoryId,
        favourite: Boolean(this.word.favourite)
      };
      if (this.word._id) {
        payload._id = this.word._id;
      }

      this.$emit('createOrUpdate', payload);
      this.isSubmitting = false;
    }
  }
};
</script>

<style scoped>
.clickable-label {
  cursor: pointer;
  user-select: none;
}

.word-form-languages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.word-form-languages > .field {
  min-width: 0;
  margin: 0 !important;
}
.word-form-languages .ui.labeled.input {
  border-radius: 6px !important;
  overflow: hidden;
}
.word-form-languages .ui.labeled.input > .ui.label {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
  padding: 0.6rem 0.8rem !important;
}
.word-form-languages .ui.labeled.input > input {
  border: none !important;
  background: #ffffff;
  padding: 0.6rem 0.8rem !important;
  border-radius: 0 6px 6px 0 !important;
  font-weight: 400;
  transition: border-color 0.15s ease !important;
}
.word-form-languages .ui.labeled.input > input:focus {
  border-color: #3b82f6 !important;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.word-form-category-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
}
.word-form-category-row select {
  border-radius: 4px !important;
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  padding: 0.6rem 0.8rem !important;
  transition: border-color 0.15s ease !important;
}
.word-form-category-row select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}
.word-form-category-button {
  margin: 0 !important;
  white-space: nowrap;
  border-radius: 4px !important;
  padding: 0.6rem 1rem !important;
  font-weight: 500 !important;
}
.word-form-category-button:hover {
  background: #f8fafc;
}

/* ── Favourite: checkbox tự vẽ để alignment tuyệt đối ─────────────── */
.word-form-favourite {
  margin-top: 1.25rem !important;
  padding: 1rem 1.15rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.favourite-label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  cursor: pointer;
}
.favourite-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
/* Hàng đầu: ô tick + icon sao + title căn giữa tuyệt đối với nhau */
.favourite-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.favourite-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.favourite-box .icon {
  margin: 0 !important;
  color: #ffffff;
  font-size: 0.7rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.favourite-input:checked ~ .favourite-row .favourite-box {
  background: #f59e0b;
  border-color: #f59e0b;
}
.favourite-input:checked ~ .favourite-row .favourite-box .icon {
  opacity: 1;
}
.favourite-row strong {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
}
.favourite-row strong .icon {
  display: block;
  margin: 0 !important;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1;
}
/* Mô tả lùi vào thẳng cột chữ, không nằm dưới ô tick */
.favourite-desc {
  padding-left: calc(18px + 0.55rem);
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.45;
}
/* Chỉ sáng lên khi người dùng tick chọn favourite */
.word-form-favourite.favourite-active {
  border-color: #fde68a;
  background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
}
.word-form-favourite.favourite-active .favourite-row strong {
  color: #92400e;
}
.word-form-favourite.favourite-active .favourite-row strong .icon {
  color: #f59e0b;
}
.word-form-favourite.favourite-active .favourite-desc {
  color: #b45309;
}

.word-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e9f0;
}
.word-form-actions .ui.button {
  min-width: 140px;
  margin: 0;
  border-radius: 6px !important;
  padding: 0.6rem 1.25rem !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
}
.word-form-actions .ui.button:hover {
  background: #1e293b !important;
}
.word-form-actions .ui.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
