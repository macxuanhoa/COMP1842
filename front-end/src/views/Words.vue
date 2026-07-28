<template>
  <div class="words-page">
    <header class="library-header">
      <div>
        <div class="library-eyebrow">
          <i class="book open icon"></i>
          Vocabulary collection
        </div>
        <h1>Vocabulary Library</h1>
        <p>Browse, filter, and manage your multilingual dictionary.</p>
      </div>
      <router-link to="/words/new" class="ui primary button">
        <i class="plus icon"></i>
        Add new word
      </router-link>
    </header>

    <section class="ui segment library-filters">
      <div class="library-panel-heading">
        <div>
          <h2>Find vocabulary</h2>
          <p>Narrow the library without changing your saved words.</p>
        </div>
        <span class="library-panel-icon" aria-hidden="true">
          <i class="filter icon"></i>
        </span>
      </div>

      <div class="ui form">
        <div class="field">
          <label>Search</label>
          <div class="ui icon input fluid">
            <input
              type="text"
              placeholder="Search words in English, German, or French..."
              v-model="search"
            />
            <i class="search icon"></i>
          </div>
        </div>

        <div class="library-filter-grid">
          <div class="field">
            <label>Category</label>
            <select class="ui dropdown fluid" v-model="categoryFilter">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="field">
            <label>Favourite Status</label>
            <select class="ui dropdown fluid" v-model="favouriteFilter">
              <option value="all">All Words</option>
              <option value="fav">Favourites Only</option>
              <option value="normal">Non-favourites</option>
            </select>
          </div>
          <div class="field">
            <label>Sort By</label>
            <select class="ui dropdown fluid" v-model="sortBy">
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="ui segment library-panel">
      <div class="library-panel-heading library-panel-heading--table">
        <div>
          <h2>Vocabulary entries</h2>
          <p>
            {{ filteredWords.length }}
            {{ filteredWords.length === 1 ? 'word' : 'words' }} in this view
          </p>
        </div>
        <span class="library-panel-icon library-panel-icon--blue" aria-hidden="true">
          <i class="list ul icon"></i>
        </span>
      </div>

      <div>
        <div v-if="filteredWords.length === 0" class="library-empty-state">
          <div class="library-empty-state__icon">
            <i class="search icon"></i>
          </div>
          <div class="library-empty-state__text">
            No vocabulary entries match your criteria.
          </div>
          <router-link to="/words/new" class="ui positive button icon labeled library-empty-state__button">
            <i class="plus icon"></i>
            Add New Word
          </router-link>
        </div>

        <div v-else class="library-table-wrapper">
          <table class="ui celled compact table library-table">
            <colgroup>
              <col class="favourite-column" />
              <col class="language-column" />
              <col class="language-column" />
              <col class="language-column" />
              <col class="category-column" />
              <col class="actions-column" />
            </colgroup>
            <thead>
              <tr>
                <th class="center aligned"><i class="star outline icon"></i></th>
                <th>English</th>
                <th>German</th>
                <th>French</th>
                <th>Category</th>
                <th class="center aligned">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="word in filteredWords" :key="word._id">
                <td
                  class="center aligned favourite-cell"
                  title="Toggle favourite"
                  @click="onToggleFavourite(word)"
                >
                  <i :class="[word.favourite ? 'star icon yellow' : 'star outline icon grey']"></i>
                </td>

                <td>
                  <span class="language-text" :title="word.english">{{ word.english || '—' }}</span>
                </td>
                <td>
                  <span class="language-text" :title="word.german">{{ word.german || '—' }}</span>
                </td>
                <td>
                  <span class="language-text" :title="word.french">{{ word.french || '—' }}</span>
                </td>

                <td>
                  <span class="ui label mini basic category-label" :title="word.category || 'General'">
                    <i class="tag icon"></i>
                    <span>{{ word.category || 'General' }}</span>
                  </span>
                </td>

                <td class="center aligned">
                  <div class="library-row-actions">
                    <router-link
                      :to="{ name: 'show', params: { id: word._id } }"
                      class="ui icon mini basic button"
                      aria-label="View word"
                      title="View word"
                    >
                      <i class="eye icon"></i>
                    </router-link>
                    <router-link
                      :to="{ name: 'edit', params: { id: word._id } }"
                      class="ui icon mini basic primary button"
                      aria-label="Edit word"
                      title="Edit word"
                    >
                      <i class="edit icon"></i>
                    </router-link>
                    <button
                      type="button"
                      class="ui icon mini basic negative button"
                      aria-label="Delete word"
                      title="Delete word"
                      @click="onDelete(word)"
                    >
                      <i class="trash icon"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getWords, updateWord, deleteWord, getCategoryNames } from '../helpers/helpers';

export default {
  name: 'words',
  data() {
    return {
      words: [],
      categories: ['General'],
      search: '',
      categoryFilter: '',
      favouriteFilter: 'all',
      sortBy: 'newest'
    };
  },
  computed: {
    filteredWords() {
      let result = [...this.words];

      const lowerSearch = this.search.trim().toLowerCase();
      if (lowerSearch) {
        result = result.filter(word =>
          word.german.toLowerCase().includes(lowerSearch) ||
          word.english.toLowerCase().includes(lowerSearch) ||
          word.french.toLowerCase().includes(lowerSearch)
        );
      }

      if (this.categoryFilter) {
        result = result.filter(word => word.category === this.categoryFilter);
      }

      if (this.favouriteFilter === 'fav') {
        result = result.filter(word => word.favourite);
      } else if (this.favouriteFilter === 'normal') {
        result = result.filter(word => !word.favourite);
      }

      if (this.sortBy === 'newest') {
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      } else {
        result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      }

      return result;
    }
  },
  async mounted() {
    await this.loadWords();
    await this.loadCategories();
  },
  methods: {
    async loadWords() {
      try {
        this.words = await getWords();
      } catch (e) {
        console.error(e);
      }
    },
    async loadCategories() {
      try {
        const categoryNames = await getCategoryNames();
        this.categories = categoryNames.sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
      } catch (e) {
        console.error(e);
      }
    },
    async onToggleFavourite(word) {
      const newFav = !word.favourite;
      try {
        const updatedWord = await updateWord({ ...word, favourite: newFav });
        const index = this.words.findIndex(w => w._id === word._id);
        if (index !== -1) {
          this.words.splice(index, 1, updatedWord);
        }
        this.flash(newFav ? 'Added to Favourites!' : 'Removed from Favourites', 'success', { timeout: 1000 });
      } catch (e) {
        console.error(e);
        this.flash('Failed to update favourite status.', 'error');
      }
    },
    async onDelete(word) {
      if (!window.confirm('Are you sure you want to delete this word?')) {
        return;
      }
      try {
        await deleteWord(word._id);
        this.flash('Word deleted successfully!', 'success');
        this.words = this.words.filter(w => w._id !== word._id);
      } catch (e) {
        console.error(e);
        this.flash('Failed to delete the word.', 'error');
      }
    }
  } 
};
</script>

<style scoped>
.words-page {
  padding-bottom: 2rem;
}
.library-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.library-header h1 {
  margin: 0.3rem 0 0.45rem;
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}
.library-header p {
  margin: 0;
  color: #687386;
}
.library-header .ui.button {
  margin: 0;
  flex: 0 0 auto;
}
.library-eyebrow {
  color: #2185d0;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.library-eyebrow .icon {
  margin-right: 0.45rem;
}
.library-filters, .library-panel {
  margin: 0 !important;
  padding: 1.5rem !important;
  border: 1px solid #e5e9f0 !important;
  box-shadow: 0 8px 28px rgba(33, 48, 76, 0.06) !important;
}
.library-panel {
  margin-top: 1.25rem !important;
}
.library-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid #e5e9f0;
}
.library-panel-heading h2 {
  margin: 0;
  font-size: 1.05rem;
}
.library-panel-heading p {
  margin: 0.25rem 0 0;
  color: #687386;
  font-size: 0.8rem;
}
.library-panel-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: #2185d0;
  background: #eaf5fc;
  box-sizing: border-box;
  padding: 0;
}
.library-panel-icon .icon {
  margin: 0 !important;
  display: block;
  line-height: 1;
}
.library-panel-icon--blue {
  color: #2185d0;
  background: #eaf5fc;
}
.library-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.library-filter-grid .field {
  margin: 0 !important;
}
.library-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.library-table {
  margin: 0 !important;
}
.library-table .favourite-column { width: 50px; }
.library-table .language-column { width: auto; }
.library-table .category-column { width: 140px; }
.library-table .actions-column { width: 130px; }
.library-table th {
  background: #f9fafb !important;
  color: #687386 !important;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.library-table td {
  vertical-align: middle !important;
}
.favourite-cell {
  cursor: pointer;
}
.language-text {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.library-row-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
}
.library-row-actions .ui.button {
  margin: 0;
  padding: 0.55rem 0.6rem !important;
}
.library-empty-state {
  padding: 3rem 1.75rem;
  border: 1px dashed #d9dee7;
  border-radius: 12px;
  color: #687386;
  background: #fafbfc;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.library-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa3b3;
}
.library-empty-state__icon .icon {
  margin: 0 !important;
  font-size: 2.75rem;
  line-height: 1;
}
.library-empty-state__text {
  font-size: 1.05rem;
  font-weight: 600;
  color: #3c4557;
  max-width: 420px;
  line-height: 1.5;
}
.library-empty-state__button {
  margin: 0.25rem 0 0 0 !important;
  padding: 0.85rem 1.6rem !important;
  font-size: 0.95rem;
  border-radius: 8px !important;
}
.category-label {
  color: #30394a !important;
  background: #f7f9fb !important;
}
.category-label > span {
  max-width: 110px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
