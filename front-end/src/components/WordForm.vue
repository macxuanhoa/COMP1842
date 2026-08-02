<template>
  <form action="#" class="ui form word-form" @submit.prevent="onSubmit">
    <div v-if="errorMessage" class="ui negative message">
      <p>{{ errorMessage }}</p>
    </div>

    <div class="word-form-languages">
      <div class="field">
        <label>German</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="germany flag"></i> DE</div>
          <input type="text" placeholder="Enter German word..." v-model.trim="word.german" maxlength="80" />
        </div>
      </div>

      <div class="field">
        <label>English</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="united kingdom flag"></i> EN</div>
          <input type="text" placeholder="Enter English word..." v-model.trim="word.english" maxlength="80" />
        </div>
      </div>

      <div class="field">
        <label>French</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="france flag"></i> FR</div>
          <input type="text" placeholder="Enter French word..." v-model.trim="word.french" maxlength="80" />
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
      <label>New Category</label>
      <input
        type="text"
        placeholder="Enter category name..."
        v-model.trim="newCategoryName"
        maxlength="40"
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
    // Dữ liệu word được truyền từ component cha (New.vue hoặc Edit.vue)
    word: {
      type: Object,
      default: () => ({
        german: '',
        english: '',
        french: '',
        category: '',
        favourite: false
      })
    }
  },
  data() {
    return {
      categories: [],
      selectedCategoryId: '',
      errorMessage: '',
      isAddingCategory: false,
      newCategoryName: '',
      isSubmitting: false
    };
  },
  // Khi component mount: tải danh sách category và đặt category hiện tại
  async mounted() {
    try {
      this.categories = await getCategories();

      if (this.word._id) {
        // Edit mode: lấy _id từ object category đã populate
        if (this.word.category && this.word.category._id) {
          this.selectedCategoryId = this.word.category._id;
        } else if (this.word.category) {
          this.selectedCategoryId = this.word.category;
        }
      } else {
        // Create mode: chọn category đầu tiên, hoặc bật chế độ tạo mới nếu chưa có
        if (this.categories.length > 0) {
          this.selectedCategoryId = this.categories[0]._id;
        } else {
          this.isAddingCategory = true;
        }
      }
    } catch (error) {
      this.flash('Failed to load categories.', 'error');
    }
  },
  methods: {
    // Bật/tắt chế độ tạo category mới ngay trong form
    toggleCategoryInput() {
      this.isAddingCategory = !this.isAddingCategory;
      this.errorMessage = '';
      if (!this.isAddingCategory) {
        this.newCategoryName = '';
        if (this.categories.length > 0 && !this.selectedCategoryId) {
          this.selectedCategoryId = this.categories[0]._id;
        }
      }
    },
    // Xử lý khi nhấn Save: validate → tạo category (nếu cần) → emit payload
    async onSubmit() {
      // Validate 3 ngôn ngữ
      if (!this.word.german || !this.word.english || !this.word.french) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      let categoryId = this.selectedCategoryId;

      // Nếu đang tạo category mới: gọi API tạo category trước
      if (this.isAddingCategory) {
        const name = this.newCategoryName.trim();
        if (!name) {
          this.errorMessage = 'Please enter a category name.';
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

      // Validate phải có category
      if (!categoryId) {
        this.errorMessage = 'Please select or create a category.';
        this.isSubmitting = false;
        return;
      }

      // Tạo payload sạch
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
