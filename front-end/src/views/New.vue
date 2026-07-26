<template>
  <div class="workspace-page workspace-page--narrow">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="plus circle icon"></i>
          Build your vocabulary
        </div>
        <h1>Add New Word</h1>
        <p>Insert a new multilingual entry into your learning dictionary.</p>
      </div>
      <div class="workspace-header__actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Library
        </router-link>
      </div>
    </header>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="language icon"></i>
          </span>
          <div>
            <h2>Word information</h2>
            <p>Add translations, a category, and favourite status.</p>
          </div>
        </div>
      </div>
      <word-form :api-error="apiError" @createOrUpdate="createOrUpdate"></word-form>
    </section>
  </div>
</template>

<script>
import WordForm from '../components/WordForm.vue';
import { createWord } from '../helpers/helpers';

export default {
  name: 'new-word',
  components: {
    'word-form': WordForm
  },
  data() {
    return {
      apiError: ''
    };
  },
  methods: {
    async createOrUpdate(word) {
      this.apiError = '';
      try {
        await createWord(word);
        this.flash('Word created successfully!', 'success');
        this.$router.push('/words');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          this.apiError = err.response.data.message;
        } else {
          this.apiError = 'An error occurred while saving the word.';
        }
      }
    }
  }
};
</script>
