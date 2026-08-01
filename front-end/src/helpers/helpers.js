// ── API Client & Helpers ─────────────────────────────────────────────
// Tất cả các hàm gọi API và xử lý dùng chung trong toàn bộ front-end

import axios from 'axios';

// Khởi tạo axios instance với base URL của server Express
const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
});

// ── Word APIs ────────────────────────────────────────────────────────
export const getWords = () => apiClient.get('/words').then(response => response.data);
export const getWord = (id) => apiClient.get(`/words/${id}`).then(response => response.data);
export const createWord = (word) => apiClient.post('/words', word).then(response => response.data);
export const updateWord = ({ _id, ...updates }) =>
  apiClient.put(`/words/${_id}`, updates).then(response => response.data);

export const deleteWord = (id) => apiClient.delete(`/words/${id}`).then(response => response.data);

// ── Category APIs ────────────────────────────────────────────────────
export const getCategories = () => apiClient.get('/categories').then(response => response.data);
export const createCategory = (category) => apiClient.post('/categories', category).then(response => response.data);
export const updateCategory = ({ _id, ...updates }) =>
  apiClient.put(`/categories/${_id}`, updates).then(response => response.data);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`).then(response => response.data);
