<template>
  <div class="workspace-page">
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

    <section v-if="word" class="ui segment workspace-panel">
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
  </div>
</template>

<script>
// ── Trang chỉnh sửa từ vựng ──────────────────────────────────────────
// Load word theo ID từ URL, hiển thị WordForm với dữ liệu có sẵn
import WordForm from '../components/WordForm.vue';
import { getWord, updateWord } from '../helpers/helpers';

export default {
  name: 'edit',
  components: { 'word-form': WordForm },
  data() {
    return {
      word: null,
      loadFailed: false // Cờ đánh dấu load word thất bại (ID sai/không tồn tại)
    };
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

<style scoped>
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
