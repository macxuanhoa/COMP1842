<template>
  <div class="workspace-page workspace-page-narrow">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="edit icon"></i> Update vocabulary</div>
        <h1>Edit Word</h1>
        <p>Update translations, category, and favourite status.</p>
      </div>
      <div class="workspace-header-actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Library
        </router-link>
      </div>
    </header>

    <div v-if="!word" class="ui error message workspace-loader">
      <div class="header">Word unavailable</div>
      <p>Could not load word details. It may have been deleted.</p>
    </div>

    <section v-else class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Word information</h2>
            <p>Review the current values before saving your changes.</p>
          </div>
        </div>
      </div>
      <word-form :word="word" @createOrUpdate="createOrUpdate"></word-form>
    </section>
  </div>
</template>

<script>
import WordForm from '../components/WordForm.vue';
import { getWord, updateWord } from '../helpers/helpers';

export default {
  name: 'edit',
  components: {
    'word-form': WordForm
  },
  data() {
    return {
      word: null
    };
  },
  async mounted() {
    try {
      this.word = await getWord(this.$route.params.id);
    } catch (error) {
      console.error(error);
      this.flash('Failed to load word details.', 'error');
    }
  },
  methods: {
    async createOrUpdate(updatedWord) {
      try {
        await updateWord(updatedWord);
        this.flash('Word updated successfully!', 'success');
        this.$router.push('/words');
      } catch (error) {
        const message = error?.response?.data?.message || 'Failed to update word.';
        this.flash(message, 'error');
      }
    }
  }
};
</script>
