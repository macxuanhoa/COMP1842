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
        <select class="ui fluid dropdown" v-model="word.category" :disabled="isAddingCategory">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
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
      <button class="ui primary button icon labeled" type="submit">
        <i class="save icon"></i> Save word
      </button>
    </div>
  </form>
</template>

<script>
import { getCategoryNames } from '../helpers/helpers';

export default {
  name: 'WordForm',
  props: {
    word: {
      type: Object,
      default: () => ({
        german: '',
        english: '',
        french: '',
        category: 'General',
        favourite: false
      })
    }
  },
  data() {
    return {
      categories: [],
      errorMessage: '',
      isAddingCategory: false,
      newCategoryName: ''
    };
  },
  async mounted() {
    try {
      this.categories = await getCategoryNames();
      const currentCategory = (this.word.category || 'General').trim() || 'General';
      if (!this.categories.includes(currentCategory)) {
        this.isAddingCategory = true;
        this.newCategoryName = currentCategory;
      }
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    toggleCategoryInput() {
      this.isAddingCategory = !this.isAddingCategory;
      this.errorMessage = '';

      if (!this.isAddingCategory) {
        this.newCategoryName = '';
      }
    },
    onSubmit() {
      if (!this.word.german || !this.word.english || !this.word.french) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      let category = this.word.category || 'General';

      if (this.isAddingCategory) {
        category = this.newCategoryName.trim();

        if (!category) {
          this.errorMessage = 'Please enter a category name.';
          return;
        }

        if (category.length < 2) {
          this.errorMessage = 'Category name must be at least 2 characters.';
          return;
        }

        if (category.length > 40) {
          this.errorMessage = 'Category name cannot exceed 40 characters.';
          return;
        }
      }

      this.errorMessage = '';
      this.$emit('createOrUpdate', { ...this.word, category });
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
