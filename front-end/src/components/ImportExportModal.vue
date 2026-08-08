<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="custom-modal-backdrop" @click.self="onClose">
      <div class="custom-modal-card import-export-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">
            <i class="exchange icon text-blue"></i>
            <span>Import & Export Vocabulary</span>
          </div>
          <button type="button" class="close-btn" @click="onClose">
            <i class="times icon"></i>
          </button>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="ui two item secondary pointing menu tab-menu">
          <a
            class="item"
            :class="{ active: activeTab === 'export' }"
            @click="activeTab = 'export'"
          >
            <i class="download icon"></i> Export Words
          </a>
          <a
            class="item"
            :class="{ active: activeTab === 'import' }"
            @click="activeTab = 'import'"
          >
            <i class="upload icon"></i> Import Words
          </a>
        </div>

        <!-- TAB 1: EXPORT -->
        <div v-if="activeTab === 'export'" class="tab-content">
          <div class="ui form">
            <div class="field">
              <label>Select Export Scope</label>
              <div class="scope-options">
                <label class="scope-radio" :class="{ selected: exportScope === 'all' }">
                  <input type="radio" value="all" v-model="exportScope" />
                  <div>
                    <strong>All Words</strong>
                    <span>{{ words.length }} words total</span>
                  </div>
                </label>

                <label class="scope-radio" :class="{ selected: exportScope === 'fav' }">
                  <input type="radio" value="fav" v-model="exportScope" />
                  <div>
                    <strong>Favourites Only</strong>
                    <span>{{ favCount }} starred words</span>
                  </div>
                </label>

                <label class="scope-radio" :class="{ selected: exportScope === 'category' }">
                  <input type="radio" value="category" v-model="exportScope" />
                  <div>
                    <strong>By Category</strong>
                    <span>Select a specific category</span>
                  </div>
                </label>

                <label class="scope-radio" :class="{ selected: exportScope === 'filtered' }">
                  <input type="radio" value="filtered" v-model="exportScope" />
                  <div>
                    <strong>Current Filtered View</strong>
                    <span>{{ filteredWords.length }} words currently visible</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Category Selector if scope is 'category' -->
            <div v-if="exportScope === 'category'" class="field sub-field">
              <label>Choose Category</label>
              <select class="ui dropdown fluid" v-model="exportCategoryId">
                <option value="" disabled>Select category…</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ cat.name }} ({{ words.filter(w => w.category && w.category._id === cat._id).length }} words)
                </option>
              </select>
            </div>

            <div class="field">
              <label>File Format</label>
              <div class="format-options">
                <label class="format-btn" :class="{ active: exportFormat === 'csv' }">
                  <input type="radio" value="csv" v-model="exportFormat" />
                  <i class="file excel outline icon"></i> CSV (.csv)
                </label>
                <label class="format-btn" :class="{ active: exportFormat === 'json' }">
                  <input type="radio" value="json" v-model="exportFormat" />
                  <i class="file code outline icon"></i> JSON (.json)
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="export-summary">
              Ready to export: <strong>{{ exportTargetWords.length }} words</strong>
            </div>
            <button
              type="button"
              class="ui primary button icon labeled"
              :disabled="exportTargetWords.length === 0"
              @click="handleExport"
            >
              <i class="download icon"></i> Download File
            </button>
          </div>
        </div>

        <!-- TAB 2: IMPORT -->
        <div v-if="activeTab === 'import'" class="tab-content">
          <div class="file-drop-area" @click="triggerFileInput">
            <input
              type="file"
              ref="fileInput"
              accept=".csv,.json"
              style="display: none"
              @change="onFileSelected"
            />
            <div class="drop-icon">
              <i class="cloud upload icon"></i>
            </div>
            <div class="drop-text" v-if="!selectedFile">
              <strong>Click to upload CSV or JSON file</strong>
              <span>Supports .csv and .json files with English, German, French translations</span>
            </div>
            <div class="drop-text" v-else>
              <strong class="text-blue">{{ selectedFile.name }}</strong>
              <span>{{ (selectedFile.size / 1024).toFixed(1) }} KB &bull; {{ parsedPreviewWords.length }} words detected</span>
            </div>
          </div>

          <div v-if="importErrorMessage" class="ui negative message margin-top-sm">
            <p>{{ importErrorMessage }}</p>
          </div>

          <div v-if="parsedPreviewWords.length > 0" class="import-preview">
            <div class="preview-header">
              <span>Previewing {{ parsedPreviewWords.length }} items to import</span>
            </div>
            <div class="preview-list">
              <div v-for="(item, idx) in parsedPreviewWords.slice(0, 5)" :key="idx" class="preview-item">
                <span class="preview-word">🇬🇧 {{ item.english }}</span>
                <span class="preview-word">🇩🇪 {{ item.german }}</span>
                <span class="preview-word">🇫🇷 {{ item.french }}</span>
                <span class="ui label mini basic">{{ item.categoryName || 'General' }}</span>
              </div>
              <div v-if="parsedPreviewWords.length > 5" class="preview-more">
                ...and {{ parsedPreviewWords.length - 5 }} more items
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="ui basic button" @click="onClose">
              Cancel
            </button>
            <button
              type="button"
              class="ui primary button icon labeled"
              :disabled="parsedPreviewWords.length === 0 || isImporting"
              @click="handleImport"
            >
              <i class="upload icon"></i>
              {{ isImporting ? 'Importing...' : 'Import Vocabulary' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { createWord, createCategory } from '../helpers/helpers';

export default {
  name: 'ImportExportModal',
  props: {
    isOpen: { type: Boolean, default: false },
    categories: { type: Array, default: () => [] },
    words: { type: Array, default: () => [] },
    filteredWords: { type: Array, default: () => [] }
  },
  data() {
    return {
      activeTab: 'export',       // 'export' | 'import'
      exportScope: 'all',        // 'all' | 'fav' | 'category' | 'filtered'
      exportCategoryId: '',      // ID nếu chọn export theo category
      exportFormat: 'csv',       // 'csv' | 'json'
      selectedFile: null,        // File import được chọn
      parsedPreviewWords: [],    // Các từ đã đọc được từ file
      importErrorMessage: '',   // Thông báo lỗi import
      isImporting: false         // Cờ đang import
    };
  },
  computed: {
    favCount() {
      return this.words.filter(w => w.favourite).length;
    },
    exportTargetWords() {
      if (this.exportScope === 'all') return this.words;
      if (this.exportScope === 'fav') return this.words.filter(w => w.favourite);
      if (this.exportScope === 'filtered') return this.filteredWords;
      if (this.exportScope === 'category') {
        if (!this.exportCategoryId) return [];
        return this.words.filter(w => w.category && w.category._id === this.exportCategoryId);
      }
      return [];
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.activeTab = 'export';
      this.exportScope = 'all';
      this.exportCategoryId = this.categories.length ? this.categories[0]._id : '';
      this.exportFormat = 'csv';
      this.selectedFile = null;
      this.parsedPreviewWords = [];
      this.importErrorMessage = '';
      this.isImporting = false;
    },
    onClose() {
      this.$emit('close');
    },

    // ── EXPORT LOGIC ─────────────────────────────────────────────────
    handleExport() {
      const wordsToExport = this.exportTargetWords;
      if (wordsToExport.length === 0) return;

      let filename = `vocabulary_export_${this.exportScope}_${new Date().toISOString().slice(0, 10)}`;

      if (this.exportFormat === 'json') {
        const jsonData = wordsToExport.map(w => ({
          english: w.english,
          german: w.german,
          french: w.french,
          category: w.category ? w.category.name : 'General',
          favourite: Boolean(w.favourite)
        }));
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `${filename}.json`);
      } else {
        const headers = ['English', 'German', 'French', 'Category', 'Favourite'];
        const rows = wordsToExport.map(w => [
          `"${(w.english || '').replace(/"/g, '""')}"`,
          `"${(w.german || '').replace(/"/g, '""')}"`,
          `"${(w.french || '').replace(/"/g, '""')}"`,
          `"${(w.category?.name || 'General').replace(/"/g, '""')}"`,
          w.favourite ? 'Yes' : 'No'
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, `${filename}.csv`);
      }

      this.flash(`Exported ${wordsToExport.length} words (${this.exportFormat.toUpperCase()})!`, 'success');
      this.onClose();
    },

    downloadFile(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // ── IMPORT LOGIC ─────────────────────────────────────────────────
    triggerFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },

    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedFile = file;
      this.importErrorMessage = '';
      this.parsedPreviewWords = [];

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        try {
          if (file.name.endsWith('.json')) {
            this.parseJSON(content);
          } else {
            this.parseCSV(content);
          }
        } catch {
          this.importErrorMessage = 'Failed to parse file. Please make sure it is a valid CSV or JSON file.';
        }
      };
      reader.readAsText(file);
    },

    parseJSON(content) {
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        throw new Error('JSON data must be an array of words.');
      }
      this.parsedPreviewWords = data.map(item => ({
        english: String(item.english || '').trim(),
        german: String(item.german || '').trim(),
        french: String(item.french || '').trim(),
        categoryName: String(item.category || item.categoryName || 'General').trim(),
        favourite: Boolean(item.favourite)
      })).filter(item => item.english && item.german && item.french);

      if (this.parsedPreviewWords.length === 0) {
        this.importErrorMessage = 'No valid vocabulary entries found in JSON file.';
      }
    },

    parseCSV(content) {
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        throw new Error('CSV file must have a header line and at least one data row.');
      }

      // Check header
      const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      const enIdx = headers.findIndex(h => h.includes('english') || h === 'en');
      const deIdx = headers.findIndex(h => h.includes('german') || h === 'de');
      const frIdx = headers.findIndex(h => h.includes('french') || h === 'fr');
      const catIdx = headers.findIndex(h => h.includes('category') || h === 'cat');
      const favIdx = headers.findIndex(h => h.includes('favourite') || h.includes('favorite') || h === 'fav');

      if (enIdx === -1 || deIdx === -1 || frIdx === -1) {
        throw new Error('CSV must contain English, German, and French column headers.');
      }

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple regex CSV line split handling quotes
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const cleanCols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());

        const english = cleanCols[enIdx] || '';
        const german = cleanCols[deIdx] || '';
        const french = cleanCols[frIdx] || '';
        const categoryName = catIdx !== -1 ? (cleanCols[catIdx] || 'General') : 'General';
        const favourite = favIdx !== -1 ? (cleanCols[favIdx]?.toLowerCase() === 'yes' || cleanCols[favIdx] === 'true') : false;

        if (english && german && french) {
          results.push({ english, german, french, categoryName, favourite });
        }
      }

      this.parsedPreviewWords = results;
      if (this.parsedPreviewWords.length === 0) {
        this.importErrorMessage = 'No valid vocabulary rows found in CSV file.';
      }
    },

    async handleImport() {
      if (this.parsedPreviewWords.length === 0) return;
      this.isImporting = true;
      this.importErrorMessage = '';

      let createdCount = 0;
      let skippedCount = 0;

      try {
        // Map category names to IDs, creating new categories if needed
        const catMap = {};
        for (const cat of this.categories) {
          catMap[cat.name.toLowerCase()] = cat._id;
        }

        for (const item of this.parsedPreviewWords) {
          const lowerCatName = item.categoryName.toLowerCase();
          let categoryId = catMap[lowerCatName];

          // Create category if it doesn't exist
          if (!categoryId) {
            try {
              const newCat = await createCategory({ name: item.categoryName });
              catMap[lowerCatName] = newCat._id;
              categoryId = newCat._id;
            } catch {
              // Fallback to first existing category
              categoryId = this.categories.length ? this.categories[0]._id : null;
            }
          }

          if (!categoryId) continue;

          // Check if word already exists in current words list
          const isDuplicate = this.words.some(w =>
            w.english.toLowerCase() === item.english.toLowerCase() &&
            w.german.toLowerCase() === item.german.toLowerCase() &&
            w.french.toLowerCase() === item.french.toLowerCase()
          );

          if (isDuplicate) {
            skippedCount++;
            continue;
          }

          // Create word
          await createWord({
            english: item.english,
            german: item.german,
            french: item.french,
            category: categoryId,
            favourite: item.favourite
          });

          createdCount++;
        }

        this.flash(`Import complete: ${createdCount} words added! (${skippedCount} duplicates skipped)`, 'success');
        this.$emit('imported');
        this.onClose();
      } catch (error) {
        this.importErrorMessage = error?.response?.data?.message || 'Error occurred during import.';
      } finally {
        this.isImporting = false;
      }
    }
  }
};
</script>

<style scoped>
.custom-modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
}

.import-export-card {
  width: 100%;
  max-width: 540px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15);
  padding: 1.5rem;
  animation: cardPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardPop {
  from { opacity: 0; transform: scale(0.94) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-title .icon {
  margin: 0 !important;
  color: #0284c7;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1.1rem;
  cursor: pointer;
}
.close-btn:hover { color: #0f172a; }

.tab-menu {
  margin-bottom: 1.25rem !important;
}

.tab-menu .item {
  cursor: pointer !important;
  font-weight: 600 !important;
}

.scope-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.scope-radio {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.15s ease;
}

.scope-radio.selected {
  border-color: #0284c7;
  background: #f0f9ff;
}

.scope-radio strong {
  display: block;
  font-size: 0.86rem;
  color: #0f172a;
}

.scope-radio span {
  display: block;
  font-size: 0.76rem;
  color: #64748b;
}

.sub-field {
  margin-top: 0.85rem !important;
}

.format-options {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.format-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  background: #ffffff;
}

.format-btn.active {
  border-color: #0f172a;
  background: #0f172a;
  color: #ffffff;
}

.format-btn input { display: none; }

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.export-summary {
  font-size: 0.85rem;
  color: #64748b;
}

.file-drop-area {
  padding: 2rem 1.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.file-drop-area:hover {
  border-color: #0284c7;
  background: #f0f9ff;
}

.drop-icon {
  font-size: 2.2rem;
  color: #0284c7;
  margin-bottom: 0.5rem;
}

.drop-text strong {
  display: block;
  font-size: 0.92rem;
  color: #0f172a;
}

.drop-text span {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.import-preview {
  margin-top: 1rem;
  padding: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-header {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 140px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
}

.preview-word {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-more {
  font-size: 0.78rem;
  color: #64748b;
  text-align: center;
  margin-top: 0.35rem;
}

.margin-top-sm {
  margin-top: 0.75rem !important;
}

.text-blue { color: #0284c7 !important; }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter, .modal-fade-leave-to { opacity: 0; }
</style>
