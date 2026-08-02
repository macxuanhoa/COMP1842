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

    <section class="ui segment workspace-panel">
      <div class="word-detail-overview">
        <div>
          <span class="workspace-section-label">Assigned category</span>
          <div>
            <span class="ui basic label word-detail-category">
              <i class="tag icon"></i>
              {{ word.category.name }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="word-detail-favourite"
          :class="{ active: word.favourite }"
          :aria-label="word.favourite ? 'Remove from favourites' : 'Add to favourites'"
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
              class="ui basic button listen-action-btn"
              @click="speakWord(word.german, 'de-DE')"
              title="Listen German pronunciation"
            >
              <i class="volume up icon"></i> Listen
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
              class="ui basic button listen-action-btn"
              @click="speakWord(word.english, 'en-US')"
              title="Listen English pronunciation"
            >
              <i class="volume up icon"></i> Listen
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
              class="ui basic button listen-action-btn"
              @click="speakWord(word.french, 'fr-FR')"
              title="Listen French pronunciation"
            >
              <i class="volume up icon"></i> Listen
            </button>
          </div>
        </div>
      </div>

      <div class="word-detail-actions">
        <div class="word-detail-actions-primary">
          <router-link :to="{ name: 'edit', params: { id: word._id } }" class="ui primary button icon labeled">
            <i class="edit icon"></i> Edit Word
          </router-link>
          <button type="button" class="ui basic negative button icon labeled" @click="deleteWordItem">
            <i class="trash icon"></i> Delete
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// ── Trang chi tiết từ vựng ───────────────────────────────────────────
// Xem đầy đủ thông tin 1 word: 3 ngôn ngữ, category, favourite, phát âm
import { getWord, updateWord, deleteWord } from '../helpers/helpers';

export default {
  name: 'show',
  data() {
    return {
      word: null // dữ liệu word load từ API
    };
  },
  async mounted() {
    try {
      this.word = await getWord(this.$route.params.id);
    } catch {
      this.flash('Failed to load word details.', 'error');
    }
  },
  methods: {
    // Phát âm thanh bằng Web Speech API của trình duyệt
    speakWord(text, languageCode) {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      window.speechSynthesis.speak(utterance);
    },
    // ── Bật/tắt yêu thích ──────────────────────────────────────────
    async toggleFavourite() {
      try {
        const updatedWord = await updateWord({
          _id: this.word._id,
          favourite: !this.word.favourite
        });

        // Chỉ cập nhật đúng trường favourite
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

    // ── Xóa từ sau khi xác nhận ────────────────────────────────────
    async deleteWordItem() {
      const confirmed = window.confirm('Are you sure you want to delete this word?');
      if (!confirmed) return;

      try {
        await deleteWord(this.word._id);
        this.flash('Word deleted successfully!', 'success');
        this.$router.push('/words');
      } catch {
        this.flash('Failed to delete the word.', 'error');
      }
    }
  }
};
</script>

<style scoped>
.workspace-section-label {
  display: block;
  color: #687386;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
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
.word-detail-languages .field > label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.word-detail-languages input[readonly] {
  color: #0f172a !important;
  background: #ffffff !important;
}
.listen-action-btn {
  flex: 0 0 auto !important;
  background: #f8fafc !important;
  color: #0284c7 !important;
  border-color: #cbd5e1 !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  font-weight: 600 !important;
  padding: 0.6rem 0.95rem !important;
  transition: all 0.15s ease !important;
}
.listen-action-btn:hover {
  background: #0284c7 !important;
  color: #ffffff !important;
  border-color: #0284c7 !important;
}
.listen-action-btn .icon {
  margin: 0 0.3rem 0 0 !important;
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
.word-detail-actions-primary {
  display: flex;
  gap: 0.65rem;
}
.word-detail-actions .ui.button {
  margin: 0;
}
</style>
