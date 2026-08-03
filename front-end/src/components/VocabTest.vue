<template>
  <div class="learning-session">
    <section class="ui segment workspace-panel session-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Vocabulary Quiz</h2>
            <p>Test your language translation skills.</p>
          </div>
        </div>
        <button type="button" class="ui basic mini button" @click="$emit('exitTest')">
          <i class="close icon"></i>
          Exit
        </button>
      </div>

      <div class="learning-progress-meta">
        <span>
          <strong>Question</strong>
          {{ answeredCount + 1 > totalQuestions ? totalQuestions : answeredCount + 1 }} of {{ totalQuestions }}
        </span>
        <span>
          <strong>Current Score</strong>
          <span class="ui green text">{{ score }}</span> / {{ totalQuestions }}
        </span>
      </div>
      <div class="ui tiny progress success learning-progress">
        <div class="bar" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <form v-if="!isTestOver" action="#" class="ui form quiz-form" @submit.prevent="submitAnswer">
        <div class="field">
          <label>Translate from {{ questionLanguageName }}</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i :class="questionLanguageFlag"></i> {{ questionLanguageCode }}
            </div>
            <input type="text" readonly :value="currentWord[questionLanguage]" />
          </div>
        </div>

        <div class="field">
          <label>Your translation in {{ answerLanguageName }}</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i :class="answerLanguageFlag"></i> {{ answerLanguageCode }}
            </div>
            <input
              type="text"
              placeholder="Enter translation..."
              v-model="userAnswer"
              autocomplete="off"
              ref="answerInput"
              :disabled="isWaitingNext"
              required
            />
          </div>
        </div>

        <div v-if="feedback" class="ui message quiz-feedback" :class="feedbackClass">
          <i :class="[feedbackIcon]"></i>
          <span v-if="feedback === 'correct'">Correct!</span>
          <span v-else>
            Incorrect — the correct answer is: <strong>{{ lastCorrectAnswer }}</strong>
          </span>
        </div>

        <button
          v-if="!isWaitingNext"
          class="ui primary fluid button icon labeled"
          type="submit"
        >
          <i class="check icon"></i>
          Submit Answer
        </button>
        <button
          v-else
          type="button"
          class="ui fluid button icon labeled quiz-next-btn"
          :class="feedback === 'correct' ? 'positive' : 'negative'"
          @click="nextQuestion"
        >
          <i class="arrow right icon"></i>
          Next Question
        </button>
      </form>

      <div v-else class="quiz-complete">
        <span class="quiz-complete-icon">
          <i class="trophy icon"></i>
        </span>
        <h3>Quiz Completed!</h3>
        <p>You scored {{ score }} out of {{ totalQuestions }} ({{ scorePercent }}%).</p>

        <div v-if="wrongAnswers.length > 0" class="quiz-review">
          <h4><i class="attention icon"></i> Needs review</h4>
          <div class="quiz-review-table">
            <table class="ui celled compact table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(wrongAnswer, index) in wrongAnswers" :key="index">
                  <td><strong>{{ wrongAnswer.word[questionLanguage] }}</strong></td>
                  <td><span class="quiz-review-guess">{{ wrongAnswer.guess || '(blank)' }}</span></td>
                  <td><span class="ui green text">{{ wrongAnswer.word[answerLanguage] }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="ui success message quiz-perfect">
          <i class="thumbs up outline icon"></i> Perfect score! Outstanding job!
        </div>

        <button class="ui primary button icon labeled" @click="$emit('exitTest')">
          <i class="arrow left icon"></i> Back to Setup
        </button>
      </div>
    </section>
  </div>
</template>

<script>
// ── Component quiz từ vựng ───────────────────────────────────────────
// Nhận danh sách words và 2 ngôn ngữ (hỏi/đáp), tổ chức quiz và chấm điểm
export default {
  name: 'vocab-test',
  props: {
    words: { type: Array, required: true },            // danh sách từ để test
    questionLanguage: { type: String, default: 'german' }, // ngôn ngữ câu hỏi
    answerLanguage: { type: String, default: 'english' }   // ngôn ngữ câu trả lời
  },
  data() {
    return {
      randomizedWords: this.shuffleArray([...this.words]), // Fisher-Yates xáo trộn
      wrongAnswers: [],     // danh sách câu trả lời sai (để review cuối)
      userAnswer: '',       // câu trả lời hiện tại của user
      score: 0,             // số câu đúng
      answeredCount: 0,     // số câu đã trả lời
      totalQuestions: this.words.length, // tổng số câu hỏi
      isTestOver: false,      // bài test đã kết thúc chưa
      feedback: null,       // 'correct' hoặc 'wrong' (null = chưa trả lời)
      lastCorrectAnswer: '',// đáp án đúng của câu vừa làm (hiển thị khi sai)
      isWaitingNext: false,   // đang chờ user nhấn "Next Question"
      languageDetails: {    // metadata cờ + tên cho 3 ngôn ngữ
        german:  { name: 'German',  code: 'DE', flag: 'germany flag' },
        english: { name: 'English', code: 'EN', flag: 'united kingdom flag' },
        french:  { name: 'French',  code: 'FR', flag: 'france flag' }
      }
    };
  },
  computed: {
    currentWord() {
      return this.randomizedWords.length ? this.randomizedWords[0] : null;
    },
    progressPercent() {
      return Math.round((this.answeredCount / this.totalQuestions) * 100) || 0;
    },
    scorePercent() {
      return Math.round((this.score / this.totalQuestions) * 100) || 0;
    },
    feedbackClass() {
      return this.feedback === 'correct' ? 'positive' : 'negative';
    },
    feedbackIcon() {
      return this.feedback === 'correct' ? 'check circle icon' : 'times circle icon';
    },
    // Lấy thông tin hiển thị cho ngôn ngữ câu hỏi và câu trả lời
    questionLanguageName() { return this.languageDetails[this.questionLanguage].name; },
    answerLanguageName()   { return this.languageDetails[this.answerLanguage].name; },
    questionLanguageCode() { return this.languageDetails[this.questionLanguage].code; },
    answerLanguageCode()   { return this.languageDetails[this.answerLanguage].code; },
    questionLanguageFlag() { return this.languageDetails[this.questionLanguage].flag; },
    answerLanguageFlag()   { return this.languageDetails[this.answerLanguage].flag; }
  },
  // Khi mount: tự động focus vào ô nhập câu trả lời
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.answerInput) {
        this.$refs.answerInput.focus();
      }
    });
  },
  methods: {
    // ── Fisher-Yates shuffle: xáo trộn mảng công bằng, không thiên vị ─
    shuffleArray(array) {
      for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
      }
      return array;
    },

    // Kiểm tra câu trả lời (so sánh không phân biệt hoa/thường, bỏ khoảng trắng)
    submitAnswer() {
      const correctValue = this.currentWord[this.answerLanguage].trim().toLowerCase();
      const userValue = this.userAnswer.trim().toLowerCase();
      const isCorrect = correctValue === userValue;
      this.lastCorrectAnswer = this.currentWord[this.answerLanguage];

      if (isCorrect) {
        this.feedback = 'correct';
        this.score += 1;
      } else {
        this.feedback = 'wrong';
        this.wrongAnswers.push({ word: this.currentWord, guess: this.userAnswer });
      }
      this.isWaitingNext = true;
    },
    // Lưu kết quả quiz vào localStorage (giữ tối đa 50 lần gần nhất)
    saveResult() {
      const history = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
      history.unshift({
        score: this.score,
        total: this.totalQuestions,
        timestamp: new Date().toISOString(),
        wordIds: this.words.map(word => word._id)
      });
      if (history.length > 50) {
        history.pop();
      }
      localStorage.setItem('coursework03_quiz_history', JSON.stringify(history));
    },
    // Chuyển sang câu hỏi tiếp theo (hoặc kết thúc nếu hết câu)
    nextQuestion() {
      this.answeredCount += 1;
      this.feedback = null;
      this.isWaitingNext = false;
      this.userAnswer = '';
      this.randomizedWords.shift();

      if (this.randomizedWords.length === 0) {
        this.isTestOver = true;
        this.saveResult();
      } else {
        this.$nextTick(() => {
          if (this.$refs.answerInput) {
            this.$refs.answerInput.focus();
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.session-panel {
  margin: 0 !important;
}
.learning-progress-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}
.learning-progress-meta > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}
.learning-progress-meta strong {
  color: #0f172a;
}
.learning-progress {
  height: 8px !important;
  margin: 0 0 1.5rem !important;
  border-radius: 999px;
  background: #e2e8f0 !important;
  overflow: hidden;
}
.learning-progress .bar {
  min-width: 0 !important;
  border-radius: inherit;
  background-color: #2185d0 !important;
  transition: width 0.3s ease !important;
}
.quiz-form {
  display: grid;
  gap: 1.25rem;
}
.quiz-form .field {
  margin: 0 !important;
}
.quiz-form input[readonly] {
  color: #0f172a !important;
  background: #f8fafc !important;
  font-weight: 700;
  font-size: 1.05rem;
}
.quiz-feedback {
  display: block !important;
  margin: 0 !important;
  padding: 0.9rem 1.1rem !important;
  border-radius: 8px !important;
  font-size: 0.92rem;
}
.quiz-feedback .icon {
  margin-right: 0.5rem;
}
.quiz-next-btn {
  min-height: 44px;
  margin: 0 !important;
  color: #fff !important;
  font-weight: 700;
}
.quiz-next-btn.positive {
  background-color: #10b981 !important;
}
.quiz-next-btn.negative {
  background-color: #ef4444 !important;
}
.quiz-complete {
  padding: 1.5rem 0 0.5rem;
  text-align: center;
}
.quiz-complete-icon {
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #10b981;
  background: #ecfdf5;
  border: 2px solid #a7f3d0;
  font-size: 1.5rem;
}
.quiz-complete h3 {
  margin: 1rem 0 0.35rem;
  color: #0f172a;
  font-size: 1.4rem;
  font-weight: 700;
}
.quiz-complete > p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}
.quiz-review {
  max-width: 620px;
  margin: 1.5rem auto;
  padding: 1.25rem;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  text-align: left;
}
.quiz-review h4 {
  margin: 0 0 0.8rem;
  color: #991b1b;
  font-weight: 700;
}
.quiz-review-table .ui.table {
  width: 100%;
  margin: 0;
  border-radius: 6px;
}
.quiz-review-guess {
  text-decoration: line-through;
  color: #ef4444;
}
.quiz-perfect {
  display: block;
  max-width: 500px;
  margin: 1.5rem auto !important;
}
</style>
