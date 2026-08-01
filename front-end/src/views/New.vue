<template>
  <div class="workspace-page workspace-page-narrow">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow"><i class="plus circle icon"></i> Build your vocabulary</div>
        <h1>Add New Word</h1>
        <p>Insert a new multilingual entry into your learning dictionary.</p>
      </div>
      <div class="workspace-header-actions">
        <router-link to="/words" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Library
        </router-link>
      </div>
    </header>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Word information</h2>
            <p>Add translations, a category, and favourite status.</p>
          </div>
        </div>
      </div>
      <word-form @createOrUpdate="createOrUpdate"></word-form>
    </section>
  </div>
</template>

<script>
// ── Trang thêm từ vựng mới ───────────────────────────────────────────
// Hiển thị WordForm trống, nhận dữ liệu và gọi API tạo word
import WordForm from '../components/WordForm.vue';
import { createWord } from '../helpers/helpers';

export default {
  name: 'new-word',
  components: { 'word-form': WordForm },
  methods: {
    // Nhận dữ liệu từ WordForm, gọi API tạo word mới
    async createOrUpdate(word) {
      try {
        await createWord(word);
        this.flash('Word created successfully!', 'success');
        this.$router.push('/words');
      } catch (error) {
        const message = error?.response?.data?.message || 'Failed to create word.';
        this.flash(message, 'error');
      }
    }
  }
};
</script>
