<template>
  <div class="learning-session">
    <section class="ui segment workspace-panel learning-session__panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="graduation cap icon"></i>
          </span>
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
          <strong>Score</strong>
          <span class="ui green text">{{ score }}</span> / {{ totalQuestions }}
        </span>
      </div>
      <div class="ui tiny progress success learning-progress">
        <div class="bar" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <form v-if="!testOver" action="#" class="ui form quiz-form" @submit.prevent="onSubmit">
        <div class="field">
          <label>Translate from {{ qLangName }}</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i :class="qLangFlag"></i> {{ qLangCode }}
            </div>
            <input type="text" readonly :value="currWord[qLang]" />
          </div>
        </div>

        <div class="field">
          <label>Your translation in {{ aLangName }}</label>
          <div class="ui labeled input fluid">
            <div class="ui label">
              <i :class="aLangFlag"></i> {{ aLangCode }}
            </div>
            <input
              type="text"
              placeholder="Enter translation..."
              v-model="userAnswer"
              autocomplete="off"
              ref="answerInput"
              :disabled="waitingNext"
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
          v-if="!waitingNext"
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
        <span class="quiz-complete__icon">
          <i class="trophy icon"></i>
        </span>
        <h3>Quiz Completed!</h3>
        <p>You scored {{ score }} out of {{ totalQuestions }} ({{ scorePercent }}%).</p>

        <div v-if="wrongAnswers.length > 0" class="quiz-review">
          <h4><i class="attention icon"></i> Needs review</h4>
          <div class="quiz-review__table">
            <table class="ui celled compact table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in wrongAnswers" :key="idx">
                  <td><strong>{{ item.word[qLang] }}</strong></td>
                  <td><span class="quiz-review__guess">{{ item.guess || '(blank)' }}</span></td>
                  <td><span class="ui green text">{{ item.word[aLang] }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="ui success message quiz-perfect">
          <i class="thumbs up outline icon"></i> Perfect score! Outstanding job!
        </div>

        <button class="ui primary button" @click="$emit('exitTest')">Back to Setup</button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'vocab-test',
  props: {
    words: {
      type: Array,
      required: true
    },
    qLang: {
      type: String,
      default: 'german'
    },
    aLang: {
      type: String,
      default: 'english'
    }
  },
  data() {
    return {
      randWords: [...this.words].sort(() => 0.5 - Math.random()), // Danh sách câu hỏi.
      wrongAnswers: [], // Danh sách câu sai.
      userAnswer: '', // Câu trả lời hiện tại.
      score: 0, // Điểm hiện tại.
      answeredCount: 0, // Số câu đã làm.
      totalQuestions: this.words.length, // Tổng số câu.
      testOver: false, // Trạng thái kết thúc.
      feedback: null, // Kết quả câu vừa nộp.
      lastCorrectAnswer: '', // Đáp án đúng gần nhất.
      waitingNext: false, // Trạng thái chờ sang câu.
      langInfo: {
        german:  { name: 'German',  code: 'DE', flag: 'germany flag' },
        english: { name: 'English', code: 'EN', flag: 'united kingdom flag' },
        french:  { name: 'French',  code: 'FR', flag: 'france flag' }
      }
    };
  },
  computed: {
    currWord() {
      // Lấy phần tử đầu của `randWords` làm câu hỏi hiện tại.
      return this.randWords.length ? this.randWords[0] : null;
    },
    progressPercent() {
      // Dùng `answeredCount` và `totalQuestions` để tính phần trăm tiến độ cho thanh progress.
      return Math.round((this.answeredCount / this.totalQuestions) * 100) || 0;
    },
    scorePercent() {
      // Dùng `score` và `totalQuestions` để tính phần trăm điểm cuối bài.
      return Math.round((this.score / this.totalQuestions) * 100) || 0;
    },
    feedbackClass() {
      // Đổi class Semantic UI theo `feedback` để message hiện đúng màu.
      return this.feedback === 'correct' ? 'positive' : 'negative';
    },
    feedbackIcon() {
      return this.feedback === 'correct' ? 'check circle icon' : 'times circle icon';
    },
    qLangName() { return this.langInfo[this.qLang].name; },
    aLangName() { return this.langInfo[this.aLang].name; },
    qLangCode() { return this.langInfo[this.qLang].code; },
    aLangCode() { return this.langInfo[this.aLang].code; },
    qLangFlag() { return this.langInfo[this.qLang].flag; },
    aLangFlag() { return this.langInfo[this.aLang].flag; }
  },
  mounted() {
    this.$nextTick(() => {
      // Sau khi render xong, focus vào ô trả lời để user gõ ngay.
      if (this.$refs.answerInput) {
        this.$refs.answerInput.focus();
      }
    });
  },
  methods: {
    onSubmit() {
      // Lấy đáp án đúng từ `currWord[aLang]`, chuẩn hóa cùng `userAnswer`, rồi so sánh để chấm câu hiện tại.
      const correctVal = this.currWord[this.aLang].trim().toLowerCase();
      const userVal = this.userAnswer.trim().toLowerCase();

      const isCorrect = correctVal === userVal;
      this.lastCorrectAnswer = this.currWord[this.aLang];

      if (isCorrect) {
        // Nếu đúng thì tăng `score` và lưu `feedback` để UI hiện trạng thái đúng.
        this.feedback = 'correct';
        this.score += 1;
      } else {
        // Nếu sai thì đẩy dữ liệu vào `wrongAnswers` để cuối bài render bảng cần ôn lại.
        this.feedback = 'wrong';
        this.wrongAnswers.push({
          word: this.currWord,
          guess: this.userAnswer
        });
      }

      // Bật `waitingNext` để khóa ô nhập và chuyển nút sang "Next Question".
      this.waitingNext = true;
    },
    saveResult() {
      // Đọc lịch sử cũ từ `localStorage`, thêm kết quả mới vào đầu mảng rồi lưu lại vào key `coursework03_quiz_history`.
      const history = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
      history.unshift({
        score: this.score,
        total: this.totalQuestions,
        timestamp: new Date().toISOString(),
        wordIds: this.words.map(w => w._id)
      });
      // Chỉ giữ tối đa 50 lần để `localStorage` không phình quá lớn.
      if (history.length > 50) history.pop();
      localStorage.setItem('coursework03_quiz_history', JSON.stringify(history));
    },
    nextQuestion() {
      // Tăng số câu đã làm, xóa trạng thái tạm của câu cũ và bỏ phần tử đầu trong `randWords` để sang câu tiếp theo.
      this.answeredCount += 1;
      this.feedback = null;
      this.waitingNext = false;
      this.userAnswer = '';
      this.randWords.shift();

      if (this.randWords.length === 0) {
        // Nếu hết câu thì bật `testOver` và gọi `saveResult()` để lưu kết quả vào `localStorage`.
        this.testOver = true;
        this.saveResult();
      } else {
        this.$nextTick(() => {
          // Nếu còn câu tiếp theo thì focus lại ô nhập.
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
.learning-session__panel {
  margin: 0 !important;
}
.workspace-panel-heading .ui.button {
  flex: 0 0 auto;
  margin: 0;
}
.learning-progress-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  color: #687386;
  font-size: 0.95rem;
}
.learning-progress-meta > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #fafbfc;
}
.learning-progress-meta strong {
  color: #30394a;
}
.learning-progress {
  height: 7px !important;
  margin: 0 0 1.25rem !important;
  border-radius: 999px;
  background: #edf0f5 !important;
}
.learning-progress .bar {
  min-width: 0 !important;
  border-radius: inherit;
}
.quiz-form {
  display: grid;
  gap: 1.25rem;
}
.quiz-form .field {
  margin: 0 !important;
}
.quiz-form .field > label {
  margin-bottom: 0.6rem;
  color: #30394a;
}
.quiz-form input[readonly] {
  color: #172033 !important;
  background: #fafbfc !important;
  font-weight: 700;
}
.quiz-form input:disabled {
  opacity: 0.7;
}
.quiz-feedback {
  display: block !important;
  margin: 0 !important;
  padding: 0.85rem 1rem !important;
  border-radius: 8px !important;
  font-size: 0.95rem;
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
  background-color: #21ba45 !important;
}
.quiz-next-btn.negative {
  background-color: #db2828 !important;
}
.quiz-complete {
  padding: 1rem 0 0;
  text-align: center;
}
.quiz-complete__icon {
  display: inline-flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #21ba45;
  background: #edf9f0;
  font-size: 1.4rem;
}
.quiz-complete h3 {
  margin: 0.9rem 0 0.35rem;
  color: #172033;
  font-size: 1.35rem;
}
.quiz-complete > p {
  margin: 0;
  color: #687386;
}
.quiz-complete > .ui.button {
  margin-top: 1.25rem;
}
.quiz-review {
  max-width: 620px;
  margin: 1.5rem auto;
  padding: 1rem;
  border: 1px solid #f1c9c7;
  border-radius: 9px;
  background: #fff8f7;
  text-align: left;
}
.quiz-review h4 {
  margin: 0 0 0.8rem;
  color: #9f3a38;
}
.quiz-review__table {
  width: 100%;
  overflow: visible;
}
.quiz-review__table .ui.table {
  width: 100%;
  margin: 0;
}
.quiz-review__guess {
  text-decoration: line-through;
}
.quiz-perfect {
  display: block;
  max-width: 500px;
  margin: 1.5rem auto !important;
}
</style>
