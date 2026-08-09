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
      
      <div v-if="!isTestOver" class="learning-progress-meta">
        <span>
          <strong>Question</strong> 
          {{ answeredCount + 1 > totalQuestions ? totalQuestions : answeredCount + 1 }} of {{ totalQuestions }}   
        </span>
        <span>
          <strong>Current Score</strong>
          <span class="ui green text">{{ score }} / {{ totalQuestions }}</span> 
        </span>
      </div>
      <div v-if="!isTestOver" class="ui tiny progress success learning-progress">
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
          :disabled="!userAnswer.trim()"
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
        <div class="quiz-result-header">
          <span class="quiz-result-icon">
            <i class="trophy icon"></i>
          </span>
          <div>
            <h3>Quiz Completed!</h3>
            <p>You scored <strong>{{ score }}</strong> out of <strong>{{ totalQuestions }}</strong> ({{ scorePercent }}%).</p>
          </div>
        </div>

        <div v-if="wrongAnswers.length > 0" class="quiz-review">
          <h4><i class="attention icon"></i> Needs Review</h4>
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

        <div class="quiz-complete-actions">
          <button
            v-if="wrongAnswers.length > 0"
            class="ui primary button icon labeled"
            @click="$emit('retakeWrong', wrongAnswers.map(wrongAnswer => wrongAnswer.word._id))"
          >
            <i class="redo icon"></i> Retake Wrong Answers
          </button>
          <button class="ui basic primary button icon labeled" @click="$emit('exitTest')">
            <i class="arrow left icon"></i> Back to Setup
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// ── Component quiz từ vựng ───────────────────────────────────────────
// Nhận danh sách words và 2 ngôn ngữ (hỏi/đáp), tổ chức quiz và chấm điểm
import { QUIZ_HISTORY_KEY, LANGUAGE_DETAILS } from '../helpers/helpers';

export default {
  // Tên của component
  name: 'vocab-test',
  // Các props truyền vào từ component cha (Test.vue)
  props: {
    words: { type: Array, required: true },            // Danh sách các từ vựng cần kiểm tra (mảng các object từ vựng)
    questionLanguage: { type: String, default: 'german' }, // Ngôn ngữ làm câu hỏi (mặc định: 'german')
    answerLanguage: { type: String, default: 'english' }   // Ngôn ngữ làm câu trả lời (mặc định: 'english')
  },
  // Khởi tạo dữ liệu trạng thái nội bộ cho bài kiểm tra
  data() {
    return {  
      remainingWords: [...this.words], // Sao chép danh sách từ vựng từ props để xoay vòng các câu hỏi
      wrongAnswers: [],     // Lưu danh sách các câu trả lời sai kèm đáp án người dùng đã nhập (dùng cho review cuối bài)
      userAnswer: '',       // Chuỗi câu trả lời người dùng nhập vào ô input hiện tại
      score: 0,             // Tổng số câu trả lời đúng của người dùng
      answeredCount: 0,     // Tổng số câu hỏi người dùng đã hoàn thành
      totalQuestions: this.words.length, // Tổng số lượng câu hỏi trong lượt test này
      isTestOver: false,    // Cờ đánh dấu bài test đã hoàn thành hay chưa (true: đã xong, false: đang làm)
      feedback: null,       // Trạng thái phản hồi câu làm: 'correct' (đúng), 'wrong' (sai), hoặc null (chưa trả lời)
      lastCorrectAnswer: '',// Lưu đáp án đúng của câu vừa làm để hiển thị khi người dùng làm sai
      isWaitingNext: false, // Cờ kiểm soát giao diện: true = đang hiện phản hồi & chờ bấm "Next Question"
      // Metadata hiển thị tên, mã quốc gia và class icon cờ (dùng chung từ helpers.js)
      languageDetails: LANGUAGE_DETAILS
    };
  },
  computed: {
    // Đối tượng từ vựng hiện tại đang được đưa ra hỏi (từ đầu tiên trong danh sách remainingWords)
    currentWord() {
      return this.remainingWords.length ? this.remainingWords[0] : null;
    },
    // Tính phần trăm tiến độ làm bài (% thanh tiến trình progress bar)
    progressPercent() {
      return Math.round((this.answeredCount / this.totalQuestions) * 100) || 0;
    },
    // Tính phần trăm điểm số đạt được so với tổng số câu
    scorePercent() {
      return Math.round((this.score / this.totalQuestions) * 100) || 0;
    },
    // Class CSS phản hồi dựa vào kết quả đúng ('positive') hay sai ('negative')
    feedbackClass() {
      return this.feedback === 'correct' ? 'positive' : 'negative';
    },
    // Icon Semantic UI phản hồi kết quả câu hỏi (dấu tích xanh cho đúng, dấu nhân đỏ cho sai)
    feedbackIcon() {
      return this.feedback === 'correct' ? 'check circle icon' : 'times circle icon';
    },
    // Lấy tên hiển thị của ngôn ngữ câu hỏi (VD: 'German')
    questionLanguageName() { return this.languageDetails[this.questionLanguage].name; },
    // Lấy tên hiển thị của ngôn ngữ câu trả lời (VD: 'English')
    answerLanguageName()   { return this.languageDetails[this.answerLanguage].name; },
    // Lấy mã ngắn của ngôn ngữ câu hỏi (VD: 'DE')
    questionLanguageCode() { return this.languageDetails[this.questionLanguage].code; },
    // Lấy mã ngắn của ngôn ngữ câu trả lời (VD: 'EN')
    answerLanguageCode()   { return this.languageDetails[this.answerLanguage].code; },
    // Lấy class icon cờ quốc gia cho ngôn ngữ câu hỏi
    questionLanguageFlag() { return this.languageDetails[this.questionLanguage].flag; },
    // Lấy class icon cờ quốc gia cho ngôn ngữ câu trả lời
    answerLanguageFlag()   { return this.languageDetails[this.answerLanguage].flag; }
  },
  // Hook lifecycle mounted: Tự động trỏ con trỏ chuột (focus) vào ô nhập liệu câu trả lời khi giao diện tải xong
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.answerInput) {
        this.$refs.answerInput.focus();
      }
    });
  },
  methods: {

    // Xử lý nộp câu trả lời: So sánh đáp án nhập vào với đáp án chuẩn (bỏ khoảng trắng thừa & không phân biệt hoa/thường)
    submitAnswer() {
      // Nút Submit đã disabled khi ô đáp án trống nên không bao giờ bật lỗi bất ngờ
      if (!this.userAnswer.trim()) return;

      const correctValue = this.currentWord[this.answerLanguage].trim().toLowerCase();
      const userValue = this.userAnswer.trim().toLowerCase();
      const isCorrect = correctValue === userValue;
      this.lastCorrectAnswer = this.currentWord[this.answerLanguage];

      if (isCorrect) {
        this.feedback = 'correct'; // Đặt phản hồi đúng
        this.score += 1;          // Tăng số câu đúng
      } else {
        this.feedback = 'wrong';   // Đặt phản hồi sai
        this.wrongAnswers.push({ word: this.currentWord, guess: this.userAnswer }); // Lưu lại từ sai và câu trả lời của user
      }
      this.isWaitingNext = true;   // Chuyển sang trạng thái chờ chuyển câu tiếp theo
    },
    // Lưu lịch sử bài test vào localStorage của trình duyệt (giữ tối đa 50 bản ghi gần nhất)
    saveResult() {
      const wrongWordIds = this.wrongAnswers.map(wrongAnswer => wrongAnswer.word._id);
      const history = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
      history.unshift({
        score: this.score,
        total: this.totalQuestions,
        timestamp: new Date().toISOString(),
        wordIds: this.words.map(word => word._id),
        wrongWordIds: wrongWordIds
      });
      if (history.length > 50) {
        history.pop(); // Loại bỏ bản ghi cũ nhất nếu vượt quá 50 bài
      }
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history));
    },
    // Chuyển sang câu hỏi tiếp theo: Xóa từ hiện tại khỏi danh sách chờ, hoặc kết thúc bài test nếu hết câu hỏi
    nextQuestion() {
      this.answeredCount += 1;
      this.feedback = null;
      this.isWaitingNext = false;
      this.userAnswer = '';
      this.remainingWords.shift(); // Loại bỏ từ vừa hỏi khỏi mảng

      if (this.remainingWords.length === 0) {
        this.isTestOver = true; // Đánh dấu hoàn thành bài test
        this.saveResult();      // Lưu kết quả vào localStorage
      } else {
        // Tự động focus lại ô nhập liệu cho câu hỏi tiếp theo
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
  padding: 0;
}
.quiz-result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: #ecfdf5;
}
.quiz-result-icon {
  display: flex;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #10b981;
  background: #ffffff;
  border: 2px solid #a7f3d0;
  font-size: 1rem;
}
.quiz-result-icon .icon {
  margin: 0 !important;
}
.quiz-result-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}
.quiz-result-header p {
  margin: 0.1rem 0 0;
  color: #475569;
  font-size: 0.82rem;
}
.quiz-review {
  margin-bottom: 0.75rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  text-align: left;
}
.quiz-review h4 {
  margin: 0 0 0.5rem;
  color: #991b1b;
  font-size: 0.82rem;
  font-weight: 700;
}
.quiz-review-table {
  max-height: 210px;
  overflow-y: auto;
  border-radius: 6px;
}
.quiz-review-table .ui.table {
  width: 100%;
  margin: 0;
  border-radius: 6px;
}
.quiz-review-table .ui.table td,
.quiz-review-table .ui.table th {
  padding: 0.45rem 0.7rem !important;
  font-size: 0.84rem;
}
.quiz-review-guess {
  text-decoration: line-through;
  color: #ef4444;
}
.quiz-perfect {
  display: block;
  margin: 0 0 0.75rem !important;
}
.quiz-complete-actions {
  display: flex;
  gap: 0.65rem;
}
.quiz-complete-actions .ui.button {
  flex: 1;
  margin: 0;
}
</style>
