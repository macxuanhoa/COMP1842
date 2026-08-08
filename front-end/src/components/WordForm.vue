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
      />
    </div>

    <div class="field word-form-favourite">
      <div class="ui checkbox">
        <input type="checkbox" id="favourite-check" v-model="word.favourite" />
        <label for="favourite-check">
          <strong><i class="star outline icon"></i> Favourite word</strong>
          <span>Keep this word easy to find in your learning collection.</span>
        </label>
      </div>
    </div>

    <div class="word-form-actions">
      <button class="ui primary button icon labeled" type="submit" :disabled="isSubmitting">
        <i class="save icon"></i> Save word
      </button>
    </div>
  </form>
</template>

<script>
import { getCategories, createCategory } from '../helpers/helpers';

export default {
  name: 'WordForm',
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
        if (newWord && newWord._id) {
          if (newWord.category && newWord.category._id) {
            this.selectedCategoryId = newWord.category._id;
          } else if (newWord.category) {
            this.selectedCategoryId = newWord.category;
          }
        }
      }
    }
  },
  async mounted() {
    try {
      this.categories = await getCategories();

      if (this.word && this.word._id) {
        if (this.word.category && this.word.category._id) {
          this.selectedCategoryId = this.word.category._id;
        } else if (this.word.category) {
          this.selectedCategoryId = this.word.category;
        }
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
    focusField(refName) {
      this.$nextTick(() => {
        if (this.$refs[refName]) {
          this.$refs[refName].focus();
        }
      });
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

        if (name.length < 2) {
          this.errorMessage = 'Category name must be at least 2 characters.';
          this.isSubmitting = false;
          return;
        }

        if (name.length > 40) {
          this.errorMessage = 'Category name cannot exceed 40 characters.';
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
  transition: color 0.15s ease;
}
.clickable-label:hover {
  color: #0284c7 !important;
}

.word-form-languages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.word-form-languages > .field {
  min-width: 0;
  margin: 0 !important;
}
.word-form-category-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
}
.word-form-category-button {
  margin: 0 !important;
  white-space: nowrap;
}
.word-form-favourite {
  margin-top: 1.25rem !important;
  padding: 1rem;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #fafbfc;
}
.word-form-favourite label {
  display: flex !important;
  flex-direction: column;
  gap: 0.25rem;
  color: #687386 !important;
}
.word-form-favourite label strong {
  color: #30394a;
}
.word-form-favourite label .icon {
  color: #f2c037;
}
.word-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e9f0;
}
.word-form-actions .ui.button {
  min-width: 150px;
  margin: 0;
}
@media (max-width: 640px) {
  .word-form-category-row {
    grid-template-columns: 1fr;
  }
}
</style>
