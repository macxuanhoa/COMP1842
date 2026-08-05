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
  // Tên của component
  name: 'WordForm',
  // Các props nhận từ component cha (New.vue hoặc Edit.vue)
  props: {
    // Đối tượng dữ liệu từ vựng truyền từ ngoài vào để thêm mới hoặc chỉnh sửa
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
  // Khởi tạo các biến trạng thái dữ liệu cho form nhập từ vựng
  data() {
    return {
      categories: [],          // Danh sách các danh mục khả dụng lấy từ API
      selectedCategoryId: '',  // ID của danh mục đang được chọn trong dropdown
      errorMessage: '',        // Chuỗi thông báo lỗi hiển thị trên đầu form nếu có
      isAddingCategory: false, // Cờ bật/tắt chế độ nhập tên danh mục mới thay vì chọn sẵn
      newCategoryName: '',     // Chuỗi tên danh mục mới khi người dùng đang ở chế độ tạo danh mục mới
      isSubmitting: false      // Cờ trạng thái đang gửi form (dùng để vô hiệu hóa nút submit tránh spam)
    };
  },
  // Hook lifecycle mounted: Tải danh sách danh mục từ API và thiết lập danh mục mặc định ban đầu
  async mounted() {
    try {
      // Tải danh sách danh mục từ backend
      this.categories = await getCategories();

      if (this.word._id) {
        // Chế độ Edit: lấy _id từ object category đã được populate hoặc dạng string ID
        if (this.word.category && this.word.category._id) {
          this.selectedCategoryId = this.word.category._id;
        } else if (this.word.category) {
          this.selectedCategoryId = this.word.category;
        }
      } else {
        // Chế độ Create: Tự chọn danh mục đầu tiên trong danh sách, hoặc bật chế độ tạo mới nếu danh sách rỗng
        if (this.categories.length > 0) {
          this.selectedCategoryId = this.categories[0]._id;
        } else {
          this.isAddingCategory = true;
        }
      }
    } catch (error) {
      // Hiển thị thông báo lỗi nếu tải danh mục thất bại
      this.flash('Failed to load categories.', 'error');
    }
  },
  methods: {
    // Bật/tắt chuyển đổi giữa chế độ chọn danh mục sẵn có và tạo danh mục mới
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
    // Xử lý nộp form: Kiểm tra dữ liệu hợp lệ → tự động tạo danh mục mới (nếu có) → phát sự kiện createOrUpdate cho component cha
    async onSubmit() {
      // Kiểm tra xem đã điền đủ cả 3 ngôn ngữ chưa
      if (!this.word.german || !this.word.english || !this.word.french) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      let categoryId = this.selectedCategoryId;

      // Nếu người dùng đang ở chế độ tạo danh mục mới
      if (this.isAddingCategory) {
        const name = this.newCategoryName.trim();

        // Kiểm tra tên danh mục không được để trống
        if (!name) {
          this.errorMessage = 'Category name is required.';
          this.isSubmitting = false;
          return;
        }

        // Kiểm tra độ dài tối thiểu 2 ký tự
        if (name.length < 2) {
          this.errorMessage = 'Category name must be at least 2 characters.';
          this.isSubmitting = false;
          return;
        }

        // Kiểm tra độ dài tối đa 40 ký tự
        if (name.length > 40) {
          this.errorMessage = 'Category name cannot exceed 40 characters.';
          this.isSubmitting = false;
          return;
        }

        try {
          // Gọi API tạo danh mục mới và thêm vào danh sách local
          const newCategory = await createCategory({ name });
          this.categories.push(newCategory);
          categoryId = newCategory._id;
          this.isAddingCategory = false;
          this.newCategoryName = '';
        } catch (error) {
          // Xử lý nếu gặp lỗi tạo danh mục
          this.errorMessage = error?.response?.data?.message || 'Failed to create category.';
          this.isSubmitting = false;
          return;
        }
      }

      // Kiểm tra phải chọn hoặc tạo ít nhất một danh mục hợp lệ
      if (!categoryId) {
        this.errorMessage = 'Please select or create a category.';
        this.isSubmitting = false;
        return;
      }

      // Tạo object dữ liệu sạch chuẩn bị gửi lên cho component cha
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

      // Emit event ra ngoài cho component cha xử lý lưu dữ liệu
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
