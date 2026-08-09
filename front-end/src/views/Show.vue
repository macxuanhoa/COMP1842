<template>
  <div class="workspace-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="eye icon"></i> Vocabulary entry</div>
        <h1>Word Details</h1>
        <p>Review translations, category, and favourite status.</p>
      </div>
      <div class="workspace-header-actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Library
        </router-link>
      </div>
    </header>

    <section v-if="word" class="ui segment workspace-panel">
      <div class="word-detail-overview">
        <div>
          <span class="workspace-section-label">Assigned category</span>
          <div>
            <span class="ui basic label word-detail-category">
              <i class="tag icon"></i>
              {{ word.category ? word.category.name : 'Unassigned' }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="word-detail-favourite"
          :class="{ active: word.favourite }"
          title="Toggle favourite"
          @click="toggleFavourite"
        >
          <i :class="[word.favourite ? 'star icon' : 'star outline icon']"></i>
          <span>{{ word.favourite ? 'Favourite' : 'Add favourite' }}</span>
        </button>
      </div>

      <div class="ui form word-detail-languages">
        <div class="field">
          <label>German</label>
          <div class="ui action labeled input fluid">
            <div class="ui label">
              <i class="germany flag"></i> DE
            </div>
            <input type="text" readonly :value="word.german" />
            <button
              type="button"
              class="speak-btn"
              :class="{ playing: activeAudioLang === 'de-DE' }"
              @click="speakWord(word.german, 'de-DE')"
              title="Listen German pronunciation"
            >
              <i class="volume up icon speak-btn-icon"></i>
              <span class="speak-btn-text">{{ activeAudioLang === 'de-DE' ? 'Playing' : 'Listen' }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label>English</label>
          <div class="ui action labeled input fluid">
            <div class="ui label">
              <i class="united kingdom flag"></i> EN
            </div>
            <input type="text" readonly :value="word.english" />
            <button
              type="button"
              class="speak-btn"
              :class="{ playing: activeAudioLang === 'en-US' }"
              @click="speakWord(word.english, 'en-US')"
              title="Listen English pronunciation"
            >
              <i class="volume up icon speak-btn-icon"></i>
              <span class="speak-btn-text">{{ activeAudioLang === 'en-US' ? 'Playing' : 'Listen' }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label>French</label>
          <div class="ui action labeled input fluid">
            <div class="ui label">
              <i class="france flag"></i> FR
            </div>
            <input type="text" readonly :value="word.french" />
            <button
              type="button"
              class="speak-btn"
              :class="{ playing: activeAudioLang === 'fr-FR' }"
              @click="speakWord(word.french, 'fr-FR')"
              title="Listen French pronunciation"
            >
              <i class="volume up icon speak-btn-icon"></i>
              <span class="speak-btn-text">{{ activeAudioLang === 'fr-FR' ? 'Playing' : 'Listen' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="word-detail-actions">
        <div class="word-detail-actions-primary">
          <router-link :to="{ name: 'edit', params: { id: word._id } }" class="ui primary button icon labeled">
            <i class="edit icon"></i> Edit Word
          </router-link>
          <button type="button" class="ui basic negative button icon labeled" @click="triggerDeleteWord">
            <i class="trash icon"></i> Delete
          </button>
        </div>
      </div>
    </section>

    <!-- Hiển thị khi ID không hợp lệ hoặc từ vựng không tồn tại -->
    <section v-else-if="loadFailed" class="ui segment workspace-panel word-load-error">
      <div class="word-load-error-icon">
        <i class="search minus icon"></i>
      </div>
      <h2>Word not found</h2>
      <p>This vocabulary entry does not exist or the link is invalid.</p>
      <router-link to="/words" class="ui primary button icon labeled">
        <i class="arrow left icon"></i>
        Back to Library
      </router-link>
    </section>

    <!-- Custom Delete Confirmation Dialog -->
    <confirm-modal
      :is-open="isConfirmOpen"
      title="Delete Word"
      :message="deleteMessage"
      confirm-text="Delete Word"
      cancel-text="Cancel"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />
  </div>
</template>

<script>
// ── Trang chi tiết từ vựng ───────────────────────────────────────────
// Xem đầy đủ thông tin 1 word: 3 ngôn ngữ, category, favourite, phát âm
import { getWord, updateWord, deleteWord, speakWord } from '../helpers/helpers';
import ConfirmModal from '../components/ConfirmModal.vue';

export default {
  name: 'show',
  components: { ConfirmModal },
  data() {
    return {
      word: null,             // dữ liệu word load từ API
      loadFailed: false,      // Cờ đánh dấu load word thất bại (ID sai/không tồn tại)
      activeAudioLang: null,  // Ngôn ngữ đang phát âm thanh
      isConfirmOpen: false    // Cờ hiển thị dialog xóa
    };
  },
  computed: {
    deleteMessage() {
      if (!this.word) return '';
      return `Are you sure you want to delete "${this.word.english}" (${this.word.german})? This action cannot be undone.`;
    }
  },
  async mounted() {
    try {
      this.word = await getWord(this.$route.params.id);
    } catch {
      this.loadFailed = true;
      this.flash('Failed to load word details.', 'error');
    }
  },
  methods: {
    // Phát âm thanh bằng Web Speech API (helper dùng chung trong helpers.js)
    speakWord(text, languageCode) {
      const started = speakWord(text, languageCode, {
        onEnd: () => {
          this.activeAudioLang = null;
        }
      });
      if (started) this.activeAudioLang = languageCode;
    },
    // ── Bật/tắt yêu thích ──────────────────────────────────────────
    async toggleFavourite() {
      try {
        const updatedWord = await updateWord({
          _id: this.word._id,
          favourite: !this.word.favourite
        });

        this.word.favourite = updatedWord.favourite;

        this.flash(
          this.word.favourite
            ? 'Added to Favourites!'
            : 'Removed from Favourites',
          'success',
          { timeout: 1000 }
        );
      } catch {
        this.flash('Failed to update favourite status.', 'error');
      }
    },

    // ── Xóa từ với Dialog tinh tế ─────────────────────────────────
    triggerDeleteWord() {
      this.isConfirmOpen = true;
    },
    onCancelDelete() {
      this.isConfirmOpen = false;
    },
    async onConfirmDelete() {
      try {
        await deleteWord(this.word._id);
        this.flash('Word deleted successfully!', 'success');
        this.$router.push('/words');
      } catch {
        this.flash('Failed to delete the word.', 'error');
      } finally {
        this.isConfirmOpen = false;
      }
    }
  }
};
</script>

<style scoped>
.workspace-section-label {
  display: block;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.word-detail-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e9f0;
}
.word-detail-category {
  margin: 0 !important;
  color: #334155 !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}
.word-detail-favourite {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e5ed;
  border-radius: 6px;
  color: #64748b;
  background: #ffffff;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.15s ease;
}
.word-detail-favourite:hover {
  background: #f8fafc;
}
.word-detail-favourite .icon {
  display: inline-flex !important;
  width: 1em !important;
  height: 1em !important;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  color: #94a3b8;
  line-height: 1 !important;
}
.word-detail-favourite.active {
  border-color: #fcd34d;
  color: #92400e;
  background: #fffbeb;
}
.word-detail-favourite.active .icon {
  color: #f59e0b;
}
.word-detail-languages {
  display: grid;
  gap: 1rem;
}
.word-detail-languages .field {
  margin: 0 !important;
}
.word-detail-languages .field > label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  color: #475569;
}
.word-detail-languages input[readonly] {
  color: #0f172a !important;
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  font-weight: 500;
  border-radius: 4px !important;
  padding: 0.6rem 0.8rem !important;
  transition: border-color 0.15s ease !important;
}
.word-detail-languages input[readonly]:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* Speaker Button — tối giản, phẳng */
.speak-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 104px;
  padding: 0.55rem 1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0 6px 6px 0;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.speak-btn:hover {
  color: #2563eb;
  border-color: #93c5fd;
  background: #f8fafc;
}

.speak-btn:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.35);
  outline-offset: 2px;
}

.speak-btn-icon {
  margin: 0 !important;
  font-size: 0.9rem !important;
  line-height: 1 !important;
}

.speak-btn.playing {
  color: #059669;
  border-color: #6ee7b7;
  background: #ecfdf5;
}

.word-detail-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e9f0;
}
.word-detail-actions-primary {
  display: flex;
  gap: 0.5rem;
}
.word-detail-actions .ui.button {
  margin: 0;
  border-radius: 6px !important;
}

/* Panel lỗi khi không tìm thấy từ vựng */
.word-load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 3rem 1.5rem !important;
  text-align: center;
}
.word-load-error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
}
.word-load-error-icon .icon {
  margin: 0 !important;
}
.word-load-error h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 700;
}
.word-load-error p {
  margin: 0 0 0.6rem;
  color: #64748b;
  font-size: 0.9rem;
}
</style>
