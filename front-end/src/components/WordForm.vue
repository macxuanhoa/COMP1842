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
        <select class="ui fluid dropdown" v-model="selectedCategoryId" :disabled="isAddingCategory">
          <option value="">General (default)</option>
          <option
            v-for="category in categories"
            :key="category._id"
            v-if="category.name !== 'General'"
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
      <button class="ui primary button icon labeled" type="submit" :disabled="submitting">
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
        german: '',   // từ tiếng Đức
        english: '',  // từ tiếng Anh
        french: '',   // từ tiếng Pháp
        category: '', // ID của category (rỗng = dùng mặc định)
        favourite: false // đánh dấu yêu thích
      })
    }
  },
  data() {
    return {
      categories: [],          // danh sách category từ database
      selectedCategoryId: '',  // ID category đang được chọn trong dropdown
      errorMessage: '',        // thông báo lỗi hiển thị trên form
      isAddingCategory: false, // đang ở chế độ tạo category mới
      newCategoryName: '',     // tên category mới khi đang tạo
      submitting: false        // đang gửi request (disable nút Save)
    };
  },
  // Khi component được mount: tải danh sách category và set category hiện tại
  async mounted() {
    try {
      this.categories = await getCategories();
      // Edit mode: word.category là object đã populate -> lấy _id
      if (this.word.category && typeof this.word.category === 'object') {
        this.selectedCategoryId = this.word.category._id || '';
      }
      // Create mode: selectedCategoryId = '' -> chọn "General (default)"
    } catch (error) { /* không tải được */ }
  },
  methods: {
    // Bật/tắt chế độ tạo category mới ngay trong form
    toggleCategoryInput() {
      this.isAddingCategory = !this.isAddingCategory;
      this.errorMessage = '';

      if (!this.isAddingCategory) {
        this.newCategoryName = '';
      }
    },
    // Xử lý khi người dùng nhấn Save: validate -> tạo category mới (nếu cần) -> emit dữ liệu
    async onSubmit() {
      // Validate: cả 3 ngôn ngữ phải được nhập
      if (!this.word.german || !this.word.english || !this.word.french) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      this.submitting = true;
      this.errorMessage = '';

      let categoryId = this.selectedCategoryId || '';

      // Nếu đang tạo category mới: gọi API tạo category trước
      if (this.isAddingCategory) {
        const name = this.newCategoryName.trim();

        if (!name) {
          this.errorMessage = 'Please enter a category name.';
          this.submitting = false;
          return;
        }

        try {
          const newCategory = await createCategory({ name });
          this.categories.push(newCategory);        // thêm category mới vào dropdown
          categoryId = newCategory._id;              // dùng ID mới cho word
          this.isAddingCategory = false;        // tắt chế độ tạo mới
          this.newCategoryName = '';
        } catch (error) {
          this.errorMessage = error?.response?.data?.message || 'Failed to create category.';
          this.submitting = false;
          return;
        }
      }

      // Gửi dữ liệu word lên component cha (New.vue hoặc Edit.vue)
      this.$emit('createOrUpdate', {
        german: this.word.german,
        english: this.word.english,
        french: this.word.french,
        category: categoryId,
        favourite: this.word.favourite,
        _id: this.word._id
      });
      this.submitting = false;
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
