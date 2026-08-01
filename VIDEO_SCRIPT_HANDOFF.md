# COMP1842 VOCABULARY BUILDER — VIDEO SCRIPT HANDOFF
## Self-Contained Brief for Video Script Writer (AI-Ready)

---

## 1. PROJECT IDENTITY

- **Module**: COMP1842 – Web Programming 2
- **University**: University of Greenwich
- **Student**: Mạc Xuân Hòa — Student ID: 001361516
- **Project Name**: Vocabulary Builder (Multilingual Vocabulary Learning App)
- **Video Duration Limit**: Maximum 7 minutes (target 6:00–6:45)

---

## 2. ASSIGNMENT REQUIREMENTS (what the video MUST prove)

| # | Required Evidence | Present in Project? |
|---|---|---|
| 1 | Full-stack web app (Node.js backend + Vue.js frontend + MongoDB) | Yes |
| 2 | CRUD operations for vocabulary words | Yes |
| 3 | Category management (create/rename/delete) | Yes |
| 4 | Search, filter, sort vocabulary entries | Yes |
| 5 | Favourite marking for words | Yes |
| 6 | Vocabulary Test/Quiz feature | Yes |
| 7 | Dashboard with statistics and quiz history | Yes |
| 8 | Form validation (frontend and backend) | Yes |
| 9 | REST API with proper HTTP methods and status codes | Yes |
| 10 | MongoDB with Mongoose schemas | Yes |
| 11 | History-mode routing (SPA) | Yes |
| 12 | At least one additional feature beyond CRUD | Yes (Test, Dashboard, Speech, About) |
| 13 | Code walk showing full-stack data flow | Yes |
| 14 | Browser storage usage (localStorage/sessionStorage) | Yes |

---

## 3. CONFIRMED TECHNICAL ARCHITECTURE

```
FRONTEND (Vue 2, port 8080 dev):
  main.js → App.vue → <router-view>
  
  ROUTES (history mode, 10 routes):
    /              → redirect → /dashboard
    /dashboard     → Dashboard.vue
    /words         → Words.vue (list + search/filter/sort)
    /words/new     → New.vue → WordForm.vue
    /words/:id     → Show.vue (detail)
    /words/:id/edit → Edit.vue → WordForm.vue
    /categories    → Categories.vue (CRUD)
    /test          → Test.vue → VocabTest.vue
    /about         → AboutMe.vue
    *              → NotFound.vue

  SHARED COMPONENTS:
    WordForm.vue — used by New.vue and Edit.vue
    VocabTest.vue — used by Test.vue

  HTTP CLIENT: helpers.js (Axios, baseURL: http://localhost:3000)
  UI LIBRARIES: Semantic UI CSS, vue-flash-message

BACKEND (Express, port 3000):
  server.js — Express app setup, MongoDB connection, default category init
  
  ROUTES:
    wordRoutes.js:
      GET    /words          → wordController.list_all_words
      POST   /words          → wordController.create_a_word
      GET    /words/:wordId  → wordController.read_a_word
      PUT    /words/:wordId  → wordController.update_a_word
      DELETE /words/:wordId  → wordController.delete_a_word
    
    categoryRoutes.js:
      GET    /categories              → categoryController.list_all_categories
      POST   /categories              → categoryController.create_a_category
      PUT    /categories/:categoryId  → categoryController.update_a_category
      DELETE /categories/:categoryId  → categoryController.delete_a_category

DATABASE (MongoDB, localhost, database: COMP1842_MacXuanHoa):
  
  Collection: words (model: Words)
    Fields:
      german     String  (required, trim, maxlength:80)
      english    String  (required, trim, maxlength:80)
      french     String  (required, trim, maxlength:80)
      category   ObjectId (ref: 'Categories', required)
      favourite  Boolean (default: false)
      created_date Date  (default: Date.now)
  
  Collection: categories (model: Categories)
    Fields:
      name       String  (required, trim, minlength:2, maxlength:40)
      isDefault  Boolean (default: false)
```

---

## 4. STORAGE MAP (exactly where every piece of data lives)

| Data | Storage | Lifetime |
|---|---|---|
| Words (german, english, french, category, favourite) | **MongoDB** `words` collection | Permanent |
| Categories (name, isDefault) | **MongoDB** `categories` collection | Permanent |
| Quiz history (score, total, timestamp, wordIds) | **localStorage** key `coursework03_quiz_history` | Permanent (max 50 entries) |
| Retake word IDs | **sessionStorage** key `retake_word_ids` | Until tab closed or consumed |
| Form input (while typing) | **Vue component state** | Until navigation |
| Search/filter/sort selections | **Vue component state** | Until navigation |
| Current quiz words, score, answer | **Vue component state** | Until test exit |
| Favourite toggle state | **MongoDB** (synced immediately via PUT) | Permanent |

**CRITICAL FACT**: Quiz results are NEVER sent to the backend. They live only in localStorage. Do NOT say "quiz results are stored in MongoDB."

---

## 5. ALL FEATURES — COMPLETE LIST (with exact file paths)

### CRUD Words
- **Create**: `New.vue` → `WordForm.vue` → `helpers.js` `createWord()` → `POST /words` → `wordController.create_a_word` → MongoDB
- **Read/List**: `Words.vue` → `getWords()` → `GET /words` → `wordController.list_all_words` (populates category)
- **Detail**: `Show.vue` → `getWord(id)` → `GET /words/:id` → populated response
- **Update**: `Edit.vue` → `WordForm.vue` → `updateWord()` → `PUT /words/:id` → `wordController.update_a_word`
- **Delete**: `Words.vue` or `Show.vue` → `deleteWord(id)` → `DELETE /words/:id` → `wordController.delete_a_word`

### Categories
- **Create**: `Categories.vue` `createNewCategory()` → `createCategory()` → `POST /categories` → `categoryController.create_a_category`
- **Rename**: `Categories.vue` `saveCategoryEdit()` → `updateCategory()` → `PUT /categories/:id` → `categoryController.update_a_category` (NOTE: since words store category as ObjectId, renaming does NOT update words)
- **Delete**: `Categories.vue` `deleteCategoryItem()` → `deleteCategory()` → `DELETE /categories/:id` → `categoryController.delete_a_category` (reassigns words to default, then deletes)
- **Default protection**: Category with `isDefault: true` cannot be edited or deleted (checked in both frontend UI and backend controller)

### Search, Filter, Sort
- **All client-side** in `Words.vue` computed property `filteredWords`
- Search: searches `german`, `english`, `french` fields (case-insensitive includes)
- Filter: by category (`word.category._id`) or favourite status
- Sort: by `created_date` (newest first or oldest first)
- Pagination: 8 items per page

### Favourite
- Toggle from `Words.vue` (star icon) or `Show.vue` (favourite button)
- Sends partial update: `PUT /words/:id` with only `{ _id, favourite: bool }`
- Backend only updates the favourite field

### Vocabulary Test
- **Setup**: `Test.vue` — choose question language, answer language, word set (all/favourites/category), number of questions (all or custom)
- **Anti-collision**: If same language selected for question and answer, auto-swaps one
- **Session**: `VocabTest.vue` — shuffled words, one question at a time, typed answer
- **Answer checking**: `currentWord[answerLanguage].trim().toLowerCase()` === `userAnswer.trim().toLowerCase()`
- **Score**: correct count, progress bar, percentage
- **Wrong-answer review**: table showing word, your answer, correct answer (from `wrongAnswers` array)
- **Result save**: `saveResult()` writes to `localStorage('coursework03_quiz_history')` — format: `{ score, total, timestamp, wordIds }`

### Dashboard
- Shows: total words count, favourite count, category count, recent quiz attempts (last 5)
- Average score computed from last 5 attempts
- Retake button: stores `attempt.wordIds` in `sessionStorage('retake_word_ids')`, navigates to `/test`

### Retake
- Dashboard writes word IDs to sessionStorage, then navigates to `/test`
- `Test.vue` `mounted()` checks sessionStorage, if retake IDs found: filters words by IDs, starts quiz immediately

### Speech Synthesis
- `Show.vue` and `Words.vue` both have `speakWord(text, languageCode)` method
- Uses browser Web Speech API: `new SpeechSynthesisUtterance(text); speech.lang = langCode; window.speechSynthesis.speak(speech)`
- Languages: 'de-DE', 'en-US', 'fr-FR'

### Additional Pages
- **AboutMe.vue**: Student info, tech stack, project description, learning reflection
- **NotFound.vue**: 404 page with links to Dashboard and Library

---

## 6. KEY CODE FILES TO OPEN IN VIDEO (in recommended order)

| # | File | What to Open | Why |
|---|---|---|---|
| 1 | `front-end/src/router.js` | Full router config | Shows all 10 routes |
| 2 | `front-end/src/App.vue` | Template (navbar) | Shows SPA navigation structure |
| 3 | `front-end/src/helpers/helpers.js` | All exports | Shows Axios API client layer |
| 4 | `server/server.js` | Full file | Shows Express setup, MongoDB connect |
| 5 | `front-end/src/components/WordForm.vue` | `onSubmit()` method | Shows form validation, category handling, emit |
| 6 | `front-end/src/views/New.vue` | `createOrUpdate()` method | Shows receiving emit + calling createWord |
| 7 | `server/api/routes/wordRoutes.js` | Full file | Shows REST endpoint definitions |
| 8 | `server/api/controllers/wordController.js` | `create_a_word` function | Shows backend create logic, default category, duplicate check |
| 9 | `server/api/models/wordModel.js` | WordSchema | Shows Mongoose schema with ObjectId ref |
| 10 | `server/api/models/categoryModel.js` | CategorySchema | Shows isDefault field |
| 11 | `server/api/controllers/categoryController.js` | `delete_a_category` | Shows word reassignment on category delete |
| 12 | `front-end/src/views/Test.vue` | `startTest()`, `mounted()` | Shows quiz setup, retake logic |
| 13 | `front-end/src/components/VocabTest.vue` | `submitAnswer()`, `saveResult()` | Shows answer checking, localStorage save |
| 14 | `front-end/src/views/Dashboard.vue` | `mounted()`, `retakeTest()` | Shows history read, retake write |
| 15 | `front-end/src/views/Words.vue` | `filteredWords` computed | Shows client-side search/filter/sort |

---

## 7. RECOMMENDED VIDEO STRUCTURE (8 clips)

### Clip 1: Introduction + Architecture (0:00–0:35)
- **Screen**: Dashboard page
- **Explain**: Full-stack vocabulary learning app — Vue 2 frontend, Express REST API, MongoDB database
- **Show**: Navbar with 6 links (Dashboard, Words, Add Word, Categories, Test, About Me)
- **Mention**: 3 languages (German, English, French), CRUD, categories, quiz, dashboard
- **Files to open**: `router.js` (show routes), `server.js` (show Express + MongoDB)
- **Transition**: "Let me start by demonstrating the core CRUD features"

### Clip 2: CRUD Words Demo (0:35–1:50)
- **Screen**: Words page, then New Word form
- **Actions**:
  1. Show Words list (pre-populated) — point out columns
  2. Click "Add New Word" → fill form: German "Haus", English "house", French "maison", select category, click Save
  3. Word appears in list — point out populated category name
  4. Click star to toggle favourite — show flash message
  5. Search "haus" — list filters
  6. Filter by category "Travel" — show filtered results
  7. Click Edit on a word → change English → Save → back to list
  8. Click Delete → confirm → removed
- **Files to open after demo**: `WordForm.vue` → `onSubmit()`, `Words.vue` → `filteredWords` computed
- **Transition**: "Now let me show how categories are managed"

### Clip 3: Categories Demo (1:50–2:30)
- **Screen**: Categories page
- **Actions**:
  1. Show category list — point out "General (Default)" badge
  2. Create new category "Travel" → appears in list
  3. Rename "Travel" → "Journey" — note: words automatically update because they reference by ID
  4. Try to delete "General" → shows "Locked" (isDefault protection)
  5. Delete empty category → confirmed → removed
- **Files to open after demo**: `categoryController.js` → `delete_a_category` (show Word.updateMany reassignment)
- **Transition**: "Now the most complex feature — the vocabulary test"

### Clip 4: Vocabulary Test Demo (2:30–3:30)
- **Screen**: Test page setup → quiz session → results
- **Actions**:
  1. Show setup: Question Language = German, Answer Language = English, Word set = All, Questions = 5
  2. Click "Start Test"
  3. Answer first 4 questions correctly, answer 1 wrong intentionally
  4. Show: score updates, progress bar, "Correct!" / "Incorrect — correct answer is: X" feedback
  5. After last question: show result screen — "You scored 4 out of 5 (80%)"
  6. Show wrong-answer review table
  7. Click "Back to Setup" → back to setup screen
- **Files to open after demo**: `Test.vue` → `startTest()`, `VocabTest.vue` → `submitAnswer()` + `saveResult()`
- **Transition**: "The quiz results appear on the dashboard"

### Clip 5: Dashboard + Retake (3:30–4:05)
- **Screen**: Dashboard page
- **Actions**:
  1. Show stats: total words, favourites count, categories count
  2. Show quiz history table — point out latest attempt with 80% score
  3. Point out average score
  4. Click "Retake" on an attempt → jumps directly to test with same words
  5. Exit test → back to setup
- **Files to open after demo**: `Dashboard.vue` → `mounted()` and `retakeTest()`
- **Transition**: "Now let me walk through the full-stack code flow"

### Clip 6: Full-Stack Code Walk — Create Word (4:05–5:00)
- **Screen**: VS Code, open files in sequence
- **Walk through** (open each file, point to specific code):
  1. `WordForm.vue` line ~130: `onSubmit()` — validation, category handling, `$emit('createOrUpdate', {...})`
  2. `New.vue` line ~42: `createOrUpdate(word)` — receives emit, calls `createWord(word)`
  3. `helpers.js` line ~8: `createWord = (word) => apiClient.post('/words', word)` — Axios POST
  4. `wordRoutes.js` line ~6: `router.route('/words').post(wordController.create_a_word)` — route mapping
  5. `wordController.js` line ~25: `create_a_word` — finds default category, checks duplicates, saves, populates
  6. `wordModel.js` line ~4: WordSchema — german, english, french, category (ObjectId ref), favourite
- **Explain flow**: "User types → v-model binds to Vue state → onSubmit validates → emits to parent → Axios POST → Express route → controller processes → Mongoose saves to MongoDB → response flows back → UI updates"
- **Transition**: "Let me also walk through the test logic"

### Clip 7: Test Code Flow (5:00–5:40)
- **Screen**: VS Code
- **Walk through**:
  1. `Test.vue` `startTest()` — shuffle words, slice to question count
  2. `VocabTest.vue` `submitAnswer()` — trim+lowercase comparison, score tracking
  3. `VocabTest.vue` `saveResult()` — localStorage write with history array
  4. `Dashboard.vue` `mounted()` — localStorage read
  5. `Dashboard.vue` `retakeTest()` — sessionStorage write
- **Emphasize**: "Quiz results are stored in localStorage — NOT sent to the server. Retake uses sessionStorage for temporary word IDs."
- **Transition**: "To conclude, let me reflect on what I learned"

### Clip 8: Evaluation + Conclusion (5:40–6:30)
- **Screen**: Back to browser or VS Code
- **Points to cover**:
  1. Vue's reactivity (computed auto-updates) made search/filter seamless
  2. REST API separation (routes/controllers/models) keeps code organized
  3. Category ObjectId reference makes renames efficient (no word updates needed)
  4. MongoDB document model fits vocabulary data naturally
  5. Browser storage (localStorage/sessionStorage) appropriate for non-critical quiz data
  6. Speech synthesis adds accessibility
  7. Future: user authentication, spaced repetition, more languages, mobile responsive
- **End**: "Thank you for watching — this is my COMP1842 Vocabulary Builder project"

---

## 8. DEMO DATASET (insert before recording)

Prepare MongoDB with these exact entries:

### Categories (create in order):
```
General (isDefault: true) ← auto-created by server
Travel  (isDefault: false)
Food    (isDefault: false)
EmptyCat (isDefault: false) ← for delete demo (no words)
```

### Words (15 entries):

| # | German | English | French | Category | Favourite |
|---|---|---|---|---|---|
| 1 | Haus | house | maison | General | No |
| 2 | Hund | dog | chien | General | Yes |
| 3 | Katze | cat | chat | General | Yes |
| 4 | Buch | book | livre | General | No |
| 5 | Tisch | table | table | General | No |
| 6 | Fenster | window | fenêtre | General | No |
| 7 | Flugzeug | airplane | avion | Travel | Yes |
| 8 | Zug | train | train | Travel | Yes |
| 9 | Flughafen | airport | aéroport | Travel | No |
| 10 | Restaurant | restaurant | restaurant | Food | Yes |
| 11 | Brot | bread | pain | Food | No |
| 12 | Wasser | water | eau | Food | No |
| 13 | Apfel | apple | pomme | Food | No |
| 14 | Schule | school | école | — (use General) | No |
| 15 | Lehrer | teacher | professeur | — (use General) | No |

### Pre-recording checklist:
- [ ] MongoDB running (`mongod`)
- [ ] Server running (`node server.js` in `server/`)
- [ ] Frontend running (`npm run serve` in `front-end/`)
- [ ] All 15 words + 4 categories inserted
- [ ] At least 1 quiz history entry in localStorage (run a quick quiz)
- [ ] Clear sessionStorage (no retake leftovers)
- [ ] Browser: Chrome (for speech synthesis)
- [ ] VS Code: project open, files ready
- [ ] Screen recording: 1920×1080, both browser and VS Code visible

---

## 9. THINGS YOU MUST NEVER SAY IN THE VIDEO

These are WRONG and will lose marks:

| ❌ Wrong Statement | ✅ Correct Statement |
|---|---|
| "Quiz results are stored in MongoDB" | "Quiz results are stored in the browser's localStorage" |
| "Word category is stored as a string" | "Word category is stored as an ObjectId reference to the Categories collection" |
| "The backend validates all user input" | "The Mongoose schema validates field types and constraints; the backend checks for duplicate words and category existence" |
| "Categories are embedded in each word document" | "Categories are a separate collection; words reference categories by ObjectId" |
| "Every quiz answer is sent to the server" | "Quiz answers are compared entirely in the browser using Vue component logic" |
| "The dashboard fetches quiz history from the API" | "The dashboard reads quiz history from localStorage" |
| "Express middleware handles all errors" | "Each controller has its own try/catch with appropriate HTTP status codes" |

---

## 10. EXACT CODE SNIPPETS FOR VIDEO HIGHLIGHT

### WordForm.vue — onSubmit() (the core form logic):
```js
async onSubmit() {
  if (!this.word.german || !this.word.english || !this.word.french) {
    this.errorMessage = 'Please fill in all required fields.';
    return;
  }
  this.submitting = true;
  this.errorMessage = '';
  let categoryId = this.selectedCategoryId || '';
  if (this.isAddingCategory) {
    const name = this.newCategoryName.trim();
    if (!name) { this.errorMessage = 'Please enter a category name.'; this.submitting = false; return; }
    const newCat = await createCategory({ name });
    this.categories.push(newCat);
    categoryId = newCat._id;
    this.isAddingCategory = false;
    this.newCategoryName = '';
  }
  this.$emit('createOrUpdate', {
    german: this.word.german, english: this.word.english, french: this.word.french,
    category: categoryId, favourite: this.word.favourite, _id: this.word._id
  });
  this.submitting = false;
}
```

### wordController.js — create_a_word (backend create logic):
```js
exports.create_a_word = async (req, res) => {
  const { german, english, french, category } = req.body;
  if (!category) {
    const defaultCat = await Category.findOne({ isDefault: true });
    req.body.category = defaultCat._id;
  }
  const duplicate = await findDuplicateWord(german, english, french);
  if (duplicate) return res.status(409).json({ message: 'This word already exists.' });
  const word = await new Word(req.body).save();
  const populated = await Word.findById(word._id).populate('category', 'name isDefault');
  res.status(201).json(populated);
};
```

### VocabTest.vue — submitAnswer() (quiz logic):
```js
submitAnswer() {
  const correctVal = this.currentWord[this.answerLanguage].trim().toLowerCase();
  const userVal = this.userAnswer.trim().toLowerCase();
  if (correctVal === userVal) {
    this.feedback = 'correct'; this.score += 1;
  } else {
    this.feedback = 'wrong';
    this.wrongAnswers.push({ word: this.currentWord, guess: this.userAnswer });
  }
  this.lastCorrectAnswer = this.currentWord[this.answerLanguage];
  this.waitingNext = true;
}
```

### VocabTest.vue — saveResult() (localStorage):
```js
saveResult() {
  const history = JSON.parse(localStorage.getItem('coursework03_quiz_history') || '[]');
  history.unshift({
    score: this.score, total: this.totalQuestions,
    timestamp: new Date().toISOString(), wordIds: this.words.map(word => word._id)
  });
  if (history.length > 50) history.pop();
  localStorage.setItem('coursework03_quiz_history', JSON.stringify(history));
}
```

### categoryController.js — delete_a_category:
```js
exports.delete_a_category = async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (category.isDefault) return res.status(400).json({ message: 'Cannot delete the default category.' });
  const defaultCategory = await Category.findOne({ isDefault: true });
  await Word.updateMany({ category: category._id }, { category: defaultCategory._id });
  await Category.findByIdAndDelete(req.params.categoryId);
  res.json({ message: 'Category deleted successfully.' });
};
```

---

## 11. FLOW DIAGRAM (text-based, for script context)

### Create Word Full-Stack Flow:
```
User types "Haus", "house", "maison" in browser
  ↓
WordForm.vue: v-model binds to word.german, word.english, word.french
  ↓
User selects category → selectedCategoryId = category._id
  ↓
User clicks "Save word" → onSubmit() fires
  ↓
Validates all 3 fields are non-empty
  ↓
If "New Category" mode: POST /categories → creates category → gets new _id
  ↓
Emits 'createOrUpdate' event with { german, english, french, category: categoryId, favourite, _id }
  ↓
New.vue: createOrUpdate(word) receives event
  ↓
helpers.js: createWord(word) → axios.post('http://localhost:3000/words', word)
  ↓
Express: wordRoutes.js matches POST /words → wordController.create_a_word
  ↓
Controller: if no category → finds default (isDefault:true)
  ↓
Controller: findDuplicateWord() checks MongoDB for same german+english+french
  ↓
Mongoose: new Word(req.body).save() → MongoDB writes document
  ↓
Mongoose: Word.findById().populate('category') → gets category name+isDefault
  ↓
Response: 201 Created + populated word JSON
  ↓
Axios returns data → New.vue receives response
  ↓
New.vue: this.flash('Word created successfully!', 'success')
  ↓
New.vue: this.$router.push('/words') → navigates to word list
  ↓
Words.vue remounts, loadPageData() fetches all words
  ↓
filteredWords computed re-evaluates → visibleWords updates → table renders with new word
```

### Quiz Flow:
```
User opens /test → Test.vue mounts
  ↓
getWords() → GET /words → returns all words with populated category
  ↓
getCategories() → GET /categories → returns all categories
  ↓
Checks sessionStorage('retake_word_ids') → if exists, loads retake
  ↓
User selects: German→English, All words, 5 questions
  ↓
User clicks "Start Test" → startTest()
  ↓
Shuffles availableWords, slices to 5 → testWords = random 5
  ↓
isSessionActive = true → v-else renders VocabTest
  ↓
VocabTest receives props: words, questionLanguage, answerLanguage
  ↓
For each question: shows currentWord[questionLanguage]
  ↓
User types answer → v-model="userAnswer"
  ↓
User clicks Submit → submitAnswer()
  ↓
Compares: currentWord[answerLanguage].trim().toLowerCase() === userAnswer.trim().toLowerCase()
  ↓
Correct: score++, feedback='correct'  |  Wrong: push to wrongAnswers
  ↓
User clicks Next → nextQuestion(): shift word, reset feedback
  ↓
After last question: testOver = true
  ↓
saveResult(): writes { score, total, timestamp, wordIds } to localStorage
  ↓
Shows result screen: score, percentage, review table (wrong answers)
  ↓
User clicks "Back to Setup" → emits exitTest → Test.vue resets isSessionActive
```

---

## 12. VIDEO TIMING BUDGET

| Clip | Content | Duration | Cumulative |
|---|---|---|---|
| 1 | Introduction + Architecture | 0:35 | 0:35 |
| 2 | CRUD Words Demo | 1:15 | 1:50 |
| 3 | Categories Demo | 0:40 | 2:30 |
| 4 | Vocabulary Test Demo | 1:00 | 3:30 |
| 5 | Dashboard + Retake | 0:35 | 4:05 |
| 6 | Full-Stack Code Walk | 0:55 | 5:00 |
| 7 | Test Code Flow | 0:40 | 5:40 |
| 8 | Evaluation + Conclusion | 0:50 | 6:30 |
| **Buffer** | (safety margin) | 0:30 | 7:00 |

---

## 13. PRE-RECORDING CHECKLIST

```
HARDWARE/SOFTWARE:
  [ ] MongoDB running (check: mongosh or compass)
  [ ] Backend running on port 3000 (check: curl http://localhost:3000/words)
  [ ] Frontend running on port 8080 (check: browser http://localhost:8080)
  [ ] Chrome browser (needed for speech synthesis)
  [ ] VS Code with project open
  [ ] Screen recorder (OBS or similar) configured for 1920×1080

DATA:
  [ ] Database contains demo dataset (15 words, 4 categories)
  [ ] localStorage has at least 1 quiz history entry
  [ ] sessionStorage is EMPTY (clear it)
  [ ] At least 5 words marked as favourite

BROWSER STATE:
  [ ] All browser extensions hidden/disabled
  [ ] Bookmarks bar hidden
  [ ] Start on Dashboard page (/dashboard)
  [ ] DevTools CLOSED (open only during code walk if needed)

SCRIPT:
  [ ] Have this handoff document open on second screen
  [ ] Know exact sequence of actions for each clip
  [ ] Practice transitions between clips
```

---

## 14. HANDOFF NOTE FOR SCRIPT WRITER

This document contains everything you need to write a complete A–Z video script. Use it to produce:

1. **Second-by-second timeline** — what happens at each moment
2. **Full English narration** — every word the presenter says
3. **Vietnamese translation** — for bilingual presentation or subtitles
4. **On-screen action descriptions** — every click, every typed word, every navigation
5. **Code highlight instructions** — which file to open, which lines to point at, what to say about each
6. **Transition phrases** — how to move smoothly between topics
7. **Caption/subtitle text** — for post-production overlay
8. **Recording checklist** — step-by-step setup verification

The script should be detailed enough that someone unfamiliar with the project could record the video by following it exactly. Every user action must be specified. Every expected result must be described. Every code file and line must be identified.
