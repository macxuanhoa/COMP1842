<template>
  <form action="#" class="ui form word-form" @submit.prevent="onSubmit">
    <div v-if="apiError" class="ui negative message">
      <p>{{ apiError }}</p>
    </div>

    <div class="word-form__languages">
      <div class="field" :class="{ error: errors.german }">
        <label>German</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="germany flag"></i> DE</div>
          <input type="text" placeholder="Enter German word..." v-model.trim="word.german" maxlength="80" />
        </div>
        <div v-if="errors.german" class="ui pointing red basic label word-form__field-error">{{ errors.german }}</div>
      </div>

      <div class="field" :class="{ error: errors.english }">
        <label>English</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="united kingdom flag"></i> EN</div>
          <input type="text" placeholder="Enter English word..." v-model.trim="word.english" maxlength="80" />
        </div>
        <div v-if="errors.english" class="ui pointing red basic label word-form__field-error">{{ errors.english }}</div>
      </div>

      <div class="field" :class="{ error: errors.french }">
        <label>French</label>
        <div class="ui labeled input fluid">
          <div class="ui label"><i class="france flag"></i> FR</div>
          <input type="text" placeholder="Enter French word..." v-model.trim="word.french" maxlength="80" />
        </div>
        <div v-if="errors.french" class="ui pointing red basic label word-form__field-error">{{ errors.french }}</div>
      </div>
    </div>

    <div class="field" :class="{ error: errors.category }">
      <label>Category</label>
      <div v-if="!isCustomMode" class="fields inline word-form__category-row">
        <div class="field word-form__category-control">
          <select class="ui fluid dropdown" v-model="selectedCategory">
            <option value="">Select category...</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="field word-form__category-action">
          <button type="button" class="ui mini basic primary button" @click="isCustomMode = true">
            <i class="plus icon"></i> Custom
          </button>
        </div>
      </div>
      <div v-else class="fields inline word-form__category-row">
        <div class="field word-form__category-control">
          <input type="text" placeholder="New category..." v-model.trim="customCategory" maxlength="40" />
        </div>
        <div class="field word-form__category-action">
          <button type="button" class="ui mini basic button" @click="isCustomMode = false; customCategory = ''; selectedCategory = 'General'">
            Existing
          </button>
        </div>
      </div>
      <div v-if="errors.category" class="ui pointing red basic label word-form__field-error">{{ errors.category }}</div>
    </div>

    <div class="field word-form__favourite">
      <div class="ui checkbox">
        <input type="checkbox" id="favourite-check" v-model="word.favourite" />
        <label for="favourite-check">
          <strong><i class="star outline icon"></i> Favourite word</strong>
          <span>Keep this word easy to find in your learning collection.</span>
        </label>
      </div>
    </div>

    <div class="word-form__actions">
      <button class="ui primary button icon labeled" type="submit">
        <i class="save icon"></i> Save word
      </button>
    </div>
  </form>
</template>

<script>
import { getCategoryNames } from '../helpers/helpers';
import { normalizeCategoryName, getCategoryNameError } from '../utils/categoryValidation';

export default {
  name: 'WordForm',
  props: {
    word: {
      type: Object,
      required: false,
      default: () => ({
        german: '',
        english: '',
        french: '',
        category: 'General',
        favourite: false
      })
    },
    apiError: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      categories: ['General'],
      selectedCategory: 'General',
      customCategory: '',
      isCustomMode: false,
      errors: {
        german: '',
        english: '',
        french: '',
        category: ''
      }
    };
  },
  computed: {
    normalizedCategory() {
      return this.isCustomMode
        ? normalizeCategoryName(this.customCategory)
        : normalizeCategoryName(this.selectedCategory);
    },
    normalizedWordData() {
      return {
        german: (this.word.german || '').trim(),
        english: (this.word.english || '').trim(),
        french: (this.word.french || '').trim(),
        category: this.normalizedCategory,
        favourite: Boolean(this.word.favourite)
      };
    }
  },
  async mounted() {
    try {
      const names = await getCategoryNames();
      this.categories = names.sort((a, b) => a.localeCompare(b));

      const currentCategory = normalizeCategoryName(this.word.category) || 'General';
      const match = this.categories.find(c => c.toLowerCase() === currentCategory.toLowerCase());

      if (match) {
        this.selectedCategory = match;
      } else if (currentCategory !== 'General') {
        this.selectedCategory = '';
        this.customCategory = currentCategory;
        this.isCustomMode = true;
      }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    validateForm() {
      this.errors.german = '';
      this.errors.english = '';
      this.errors.french = '';
      this.errors.category = '';

      const word = this.normalizedWordData;

      if (!word.german) {
        this.errors.german = 'German is required.';
      } else if (word.german.length > 80) {
        this.errors.german = 'German must not exceed 80 characters.';
      }

      if (!word.english) {
        this.errors.english = 'English is required.';
      } else if (word.english.length > 80) {
        this.errors.english = 'English must not exceed 80 characters.';
      }

      if (!word.french) {
        this.errors.french = 'French is required.';
      } else if (word.french.length > 80) {
        this.errors.french = 'French must not exceed 80 characters.';
      }

      this.errors.category = getCategoryNameError(word.category);

      return (
        !this.errors.german &&
        !this.errors.english &&
        !this.errors.french &&
        !this.errors.category
      );
    },
    onSubmit() {
      if (!this.validateForm()) {
        return;
      }

      const payload = {
        ...this.normalizedWordData
      };

      if (this.word._id) {
        payload._id = this.word._id;
      }

      this.$emit('createOrUpdate', payload);
    }
  }
};
</script>

<style scoped>
.word-form__field-error {
  margin-top: 0.5rem !important;
}
.word-form__languages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.word-form__languages > .field {
  min-width: 0;
  margin: 0 !important;
}
.word-form__category-row {
  display: flex !important;
  align-items: flex-end;
  margin: 0 0 0.5rem !important;
}
.word-form__category-control {
  min-width: 0;
  flex: 1 1 auto !important;
  padding-left: 0 !important;
}
.word-form__category-action {
  flex: 0 0 auto !important;
  padding-right: 0 !important;
}
.word-form__category-action .ui.button {
  margin: 0;
  white-space: nowrap;
}
.word-form__favourite {
  margin-top: 1.25rem !important;
  padding: 1rem;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #fafbfc;
}
.word-form__favourite label {
  display: flex !important;
  flex-direction: column;
  gap: 0.25rem;
  color: #687386 !important;
}
.word-form__favourite label strong {
  color: #30394a;
}
.word-form__favourite label .icon {
  color: #f2c037;
}
.word-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e9f0;
}
.word-form__actions .ui.button {
  min-width: 150px;
  margin: 0;
}
</style>
