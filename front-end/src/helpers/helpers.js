// ── API Client & Helpers ─────────────────────────────────────────────
// Tất cả các hàm gọi API và xử lý dùng chung trong toàn bộ front-end

// Import Axios để thực hiện các yêu cầu HTTP API
import axios from 'axios';

// Khởi tạo axios instance với base URL của server Express
const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
});

// ── Word APIs ────────────────────────────────────────────────────────
// Cache trong bộ nhớ cho danh sách words/categories: chuyển trang quay lại
// không phải gọi API lại → không còn hiện tượng bảng trống rồi mới hiện dữ liệu.
// Mọi thao tác ghi (create/update/delete) đều tự xóa cache để dữ liệu luôn đúng.
const listCache = {
  words: null,
  categories: null
};

// Lấy danh sách tất cả các từ vựng từ API
export const getWords = () => {
  if (listCache.words) return Promise.resolve(listCache.words);
  return apiClient.get('/words').then(response => {
    listCache.words = response.data;
    return response.data;
  });
};

// Lấy thông tin chi tiết một từ vựng theo ID
export const getWord = (id) => apiClient.get(`/words/${id}`).then(response => response.data);

// Gửi dữ liệu tạo mới một từ vựng
export const createWord = (word) =>
  apiClient.post('/words', word).then(response => {
    listCache.words = null;
    return response.data;
  });

// Cập nhật thông tin một từ vựng theo ID
export const updateWord = ({ _id, ...updates }) =>
  apiClient.put(`/words/${_id}`, updates).then(response => {
    listCache.words = null;
    return response.data;
  });

// Xóa một từ vựng theo ID
export const deleteWord = (id) =>
  apiClient.delete(`/words/${id}`).then(response => {
    listCache.words = null;
    return response.data;
  });

// ── Category APIs ────────────────────────────────────────────────────
// Lấy danh sách tất cả các danh mục từ vựng từ API
export const getCategories = () => {
  if (listCache.categories) return Promise.resolve(listCache.categories);
  return apiClient.get('/categories').then(response => {
    listCache.categories = response.data;
    return response.data;
  });
};

// Gửi dữ liệu tạo mới một danh mục từ vựng
export const createCategory = (category) =>
  apiClient.post('/categories', category).then(response => {
    listCache.categories = null;
    return response.data;
  });

// Cập nhật thông tin một danh mục từ vựng theo ID
// (đổi tên category ảnh hưởng tên hiển thị trong words nên xóa cả cache words)
export const updateCategory = ({ _id, ...updates }) =>
  apiClient.put(`/categories/${_id}`, updates).then(response => {
    listCache.categories = null;
    listCache.words = null;
    return response.data;
  });

// Xóa một danh mục từ vựng theo ID
export const deleteCategory = (id) =>
  apiClient.delete(`/categories/${id}`).then(response => {
    listCache.categories = null;
    return response.data;
  });

// ── Shared constants & utilities ─────────────────────────────────
// Key localStorage lưu lịch sử quiz (dùng chung VocabTest.vue & Dashboard.vue)
export const QUIZ_HISTORY_KEY = 'coursework03_quiz_history';

// Metadata hiển thị ngôn ngữ (dùng chung VocabTest.vue & Test.vue)
export const LANGUAGE_DETAILS = {
  german:  { name: 'German',  code: 'DE', flag: 'germany flag' },
  english: { name: 'English', code: 'EN', flag: 'united kingdom flag' },
  french:  { name: 'French',  code: 'FR', flag: 'france flag' }
};

// Validate tên danh mục (đồng bộ rule với backend): trả về chuỗi lỗi hoặc ''
export const validateCategoryName = (rawName) => {
  const name = (rawName || '').trim();
  if (!name) return 'Category name is required.';
  if (name.length < 2) return 'Category name must be at least 2 characters.';
  if (name.length > 40) return 'Category name cannot exceed 40 characters.';
  return '';
};

// Phát âm từ vựng bằng Web Speech API (dùng chung Words.vue & Show.vue)
// Trả về true nếu bắt đầu phát thành công, onEnd được gọi khi phát xong/lỗi
export const speakWord = (text, languageCode, { onEnd } = {}) => {
  if (!text || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
};
