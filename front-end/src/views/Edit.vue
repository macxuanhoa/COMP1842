<template>
  <div class="workspace-page workspace-page--narrow">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="edit icon"></i>
          Update vocabulary
        </div>
        <h1>Edit Word</h1>
        <p>Update translations, category, and favourite status.</p>
      </div>
      <div class="workspace-header__actions">
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
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon orange" aria-hidden="true">
            <i class="language icon"></i>
          </span>
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
      word: null // Từ đang sửa.
    };
  },
  async mounted() {
    try {
      // Đọc `id` từ route, gọi `getWord()` và lưu kết quả vào `this.word` để đổ sẵn lên form.
      this.word = await getWord(this.$route.params.id);
    } catch (err) {
      console.error(err);
      this.flash('Failed to load word details.', 'error');
    }
  },
  methods: {
    async createOrUpdate(updatedWord) {
      try {
        // Nhận dữ liệu đã sửa từ `WordForm`, gọi `updateWord()` để cập nhật lại trong database.
        await updateWord(updatedWord);
        this.flash('Word updated successfully!', 'success');
        // Cập nhật xong thì quay về trang danh sách.
        this.$router.push('/words');
      } catch (err) {
        // Nếu backend có message cụ thể thì dùng luôn message đó để báo lỗi.
        const message =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Failed to update word.';
        this.flash(message, 'error');
      }
    }
  }
};
</script>
