<template>
  <div class="workspace-page workspace-page--narrow">
    <div v-if="!sessionActive">
      <header class="workspace-header">
        <div>
          <div class="workspace-eyebrow">
            <i class="graduation cap icon"></i>
            Practice workspace
          </div>
          <h1>Vocabulary Test</h1>
          <p>Test your translation skills with your saved vocabulary.</p>
        </div>
        <div class="workspace-header__actions">
          <router-link to="/words" class="ui basic primary button">
            <i class="book open icon"></i>
            Open Library
          </router-link>
        </div>
      </header>

      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-heading__title">
            <span class="workspace-panel-icon green" aria-hidden="true">
              <i class="sliders horizontal icon"></i>
            </span>
            <div>
              <h2>Session setup</h2>
              <p>Choose language, word set, and number of questions.</p>
            </div>
          </div>
        </div>

        <div class="ui form">
          <div class="field">
            <label>Question Language</label>
            <select class="ui dropdown fluid" v-model="qLang" @change="onQLangChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>
          <div class="field">
            <label>Answer Language</label>
            <select class="ui dropdown fluid" v-model="aLang" @change="onALangChange">
              <option value="german">German (DE)</option>
              <option value="english">English (EN)</option>
              <option value="french">French (FR)</option>
            </select>
          </div>

          <div class="field">
            <label>Word set</label>
            <select class="ui dropdown fluid" v-model="sourceFilter">
              <option value="all">All words ({{ words.length }})</option>
              <option value="fav">Favourites only ({{ favCount }})</option>
              <option value="category">By category</option>
            </select>
          </div>

          <div v-if="sourceFilter === 'category'" class="field">
            <label>Category</label>
            <select class="ui dropdown fluid" v-model="selectedCategory">
              <option value="">Choose a category…</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }} ({{ words.filter(w => w.category === cat).length }} words)
              </option>
            </select>
          </div>

          <div v-if="sourceFilter !== 'category'" class="field">
            <label>Number of questions</label>
            <select class="ui dropdown fluid" v-model="questionCount">
              <option value="all">All ({{ availableWordCount }} words)</option>
              <option v-for="n in presetSizes" :key="n" :value="n">{{ n }} questions</option>
              <option value="custom">Custom…</option>
            </select>
          </div>

          <div v-if="questionCount === 'custom' && sourceFilter !== 'category'" class="field">
            <label>Custom amount</label>
            <input
              type="number"
              min="1"
              :max="availableWordCount"
              v-model.number="customCount"
              placeholder="Enter a number"
            />
          </div>

          <button
            class="ui primary fluid large button icon labeled"
            :disabled="availableWordCount < 5"
            @click="startSession"
          >
            <i class="play icon"></i> Start Test
          </button>

          <div v-if="availableWordCount === 0" class="ui warning message">
            <i class="attention icon"></i>
            No words available in this selection. Add some words first.
          </div>
          <div v-else-if="availableWordCount < 5" class="ui warning message">
            <i class="attention icon"></i>
            You need at least 5 words. Currently only {{ availableWordCount }} available.
          </div>
        </div>
      </section>
    </div>

    <div v-else>
      <vocab-test
        :words="sessionWords"
        :q-lang="qLang"
        :a-lang="aLang"
        @exitTest="exitSession"
      ></vocab-test>
    </div>
  </div>
</template>

<script>
import { getWords, getCategoryNames } from '../helpers/helpers';
import VocabTest from '../components/VocabTest.vue';

export default {
  name: 'test',
  components: {
    'vocab-test': VocabTest
  },
  data() {
    return {
      words: [],
      categories: [],
      qLang: 'german',
      aLang: 'english',
      sourceFilter: 'all',
      selectedCategory: '',
      questionCount: 'all',
      customCount: 5,
      sessionActive: false,
      sessionWords: []
    };
  },
  computed: {
    favCount() {
      return this.words.filter(w => w.favourite).length;
    },
    filteredWords() {
      if (this.sourceFilter === 'fav') return this.words.filter(w => w.favourite);
      if (this.sourceFilter === 'category' && this.selectedCategory) {
        return this.words.filter(w => w.category === this.selectedCategory);
      }
      return this.words;
    },
    availableWordCount() {
      return this.filteredWords.length;
    },
    presetSizes() {
      return [5, 10, 20].filter(n => n <= this.availableWordCount);
    }
  },
  async mounted() {
    try {
      this.words = await getWords();
      this.categories = await getCategoryNames();
      this.categories.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      const retakeIds = sessionStorage.getItem('retake_word_ids');
      if (retakeIds) {
        sessionStorage.removeItem('retake_word_ids');
        const ids = JSON.parse(retakeIds);
        const matched = this.words.filter(w => ids.includes(w._id));
        if (matched.length > 0) {
          this.sessionWords = matched;
          this.sessionActive = true;
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    onQLangChange() {
      if (this.qLang === this.aLang) {
        this.aLang = this.qLang === 'german' ? 'english' : 'german';
      }
    },
    onALangChange() {
      if (this.aLang === this.qLang) {
        this.qLang = this.aLang === 'german' ? 'english' : 'german';
      }
    },
    startSession() {
      let size = this.availableWordCount;
      if (this.sourceFilter !== 'category') {
        if (this.questionCount === 'custom') {
          size = this.customCount;
        } else if (this.questionCount !== 'all') {
          size = Number(this.questionCount);
        }
      }
      size = Math.min(size, this.availableWordCount);

      const list = [...this.filteredWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, size);
      this.sessionWords = list;
      this.sessionActive = true;
    },
    exitSession() {
      this.sessionActive = false;
      this.sessionWords = [];
    }
  }
};
</script>
