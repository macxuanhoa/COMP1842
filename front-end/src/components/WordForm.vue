<template>
  <form action="#" class="ui form word-form" @submit.prevent="onSubmit">
    <div v-if="errorMessage" class="ui negative message">
      <p>{{ errorMessage }}</p>
    </div>

    <div class="word-form__languages">
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
      <select class="ui fluid dropdown" v-model="word.category">
        <option value="General">General</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
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
      errorMessage: ''
    };
  },
  async mounted() {
    try {
      const names = await getCategoryNames();
      this.categories = names
        .filter(name => name.toLowerCase() !== 'general')
        .sort((a, b) => a.localeCompare(b));
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    onSubmit() {
      if (
        !this.word.german ||
        !this.word.english ||
        !this.word.french
      ) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      this.errorMessage = '';
      this.$emit('createOrUpdate', { ...this.word });
    }
  }
};
</script>

<style scoped>
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
