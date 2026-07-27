<template>
  <div class="workspace-page workspace-page--narrow">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="eye icon"></i>
          Vocabulary entry
        </div>
        <h1>Word Details</h1>
        <p>Review translations, category, and favourite status.</p>
      </div>
      <div class="workspace-header__actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Library
        </router-link>
      </div>
    </header>

    <div v-if="!word" class="ui error message word-detail-error">
      <div class="header">Word unavailable</div>
      <p>Could not find the word details. It might have been deleted.</p>
    </div>

    <section v-else class="ui segment workspace-panel">
      <div class="word-detail-overview">
        <div>
          <span class="workspace-section-label">Assigned category</span>
          <div>
            <span class="ui basic label word-detail-category">
              <i class="tag icon"></i>
              {{ word.category || 'General' }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="word-detail-favourite"
          :class="{ active: word.favourite }"
          :aria-label="word.favourite ? 'Remove from favourites' : 'Add to favourites'"
          title="Toggle favourite"
          @click="onToggleFavourite"
        >
          <i :class="[word.favourite ? 'star icon' : 'star outline icon']"></i>
          <span>{{ word.favourite ? 'Favourite' : 'Add favourite' }}</span>
        </button>
      </div>

      <div class="ui form word-detail-languages">
        <div class="field">
          <label>German</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i class="germany flag"></i> DE
            </div>
            <input type="text" readonly :value="word.german" />
          </div>
        </div>

        <div class="field">
          <label>English</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i class="united kingdom flag"></i> EN
            </div>
            <input type="text" readonly :value="word.english" />
          </div>
        </div>

        <div class="field">
          <label>French</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i class="france flag"></i> FR
            </div>
            <input type="text" readonly :value="word.french" />
          </div>
        </div>
      </div>

      <div class="word-detail-actions">
        <div class="word-detail-actions__primary">
          <router-link :to="{ name: 'edit', params: { id: word._id } }" class="ui primary button icon labeled">
            <i class="edit icon"></i> Edit Word
          </router-link>
          <button type="button" class="ui basic negative button icon labeled" @click="onDelete">
            <i class="trash icon"></i> Delete
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getWord, updateWord, deleteWord } from '../helpers/helpers';

export default {
  name: 'show',
  data() {
    return {
      word: null
    };
  },
  async mounted() {
    try {
      this.word = await getWord(this.$route.params.id);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async onToggleFavourite() {
      if (!this.word) return;
      const newFav = !this.word.favourite;
      try {
        const updatedWord = await updateWord({ ...this.word, favourite: newFav });
        this.word = updatedWord;
        this.flash(newFav ? 'Added to Favourites!' : 'Removed from Favourites', 'success', { timeout: 1000 });
      } catch (e) {
        console.error(e);
      }
    },
    async onDelete() {
      if (!window.confirm('Are you sure you want to delete this word?')) {
        return;
      }
      try {
        await deleteWord(this.word._id);
        this.flash('Word deleted successfully!', 'success');
        this.$router.push('/words');
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style scoped>
.word-detail-error {
  display: block;
}
.word-detail-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e5e9f0;
}
.word-detail-category {
  margin: 0 !important;
  color: #30394a !important;
  background: #f7f9fb !important;
}
.word-detail-favourite {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e0e5ed;
  border-radius: 8px;
  color: #687386;
  background: #fff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
}
.word-detail-favourite .icon {
  display: inline-flex !important;
  width: 1em !important;
  height: 1em !important;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  color: #a5adba;
  line-height: 1 !important;
}
.word-detail-favourite.active {
  border-color: #f2d777;
  color: #8a6d00;
  background: #fffbeb;
}
.word-detail-favourite.active .icon {
  color: #f2c037;
}
.word-detail-languages {
  display: grid;
  gap: 1rem;
}
.word-detail-languages .field {
  margin: 0 !important;
}
.word-detail-languages input[readonly] {
  color: #172033 !important;
  background: #fafbfc !important;
}
.word-detail-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e9f0;
}
.word-detail-actions__primary {
  display: flex;
  gap: 0.65rem;
}
.word-detail-actions .ui.button {
  margin: 0;
}
</style>
