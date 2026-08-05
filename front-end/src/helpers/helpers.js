// ── API Client & Helpers ─────────────────────────────────────────────
// Tất cả các hàm gọi API và xử lý dùng chung trong toàn bộ front-end

// Import Axios để thực hiện các yêu cầu HTTP API
import axios from 'axios';

// Khởi tạo axios instance với base URL của server Express
const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
});

// ── Word APIs ────────────────────────────────────────────────────────
// Lấy danh sách tất cả các từ vựng từ API
export const getWords = () => apiClient.get('/words').then(response => response.data);

// Lấy thông tin chi tiết một từ vựng theo ID
export const getWord = (id) => apiClient.get(`/words/${id}`).then(response => response.data);

// Gửi dữ liệu tạo mới một từ vựng
export const createWord = (word) => apiClient.post('/words', word).then(response => response.data);

// Cập nhật thông tin một từ vựng theo ID
export const updateWord = ({ _id, ...updates }) =>
  apiClient.put(`/words/${_id}`, updates).then(response => response.data);

// Xóa một từ vựng theo ID
export const deleteWord = (id) => apiClient.delete(`/words/${id}`).then(response => response.data);

// ── Category APIs ────────────────────────────────────────────────────
// Lấy danh sách tất cả các danh mục từ vựng từ API
export const getCategories = () => apiClient.get('/categories').then(response => response.data);

// Gửi dữ liệu tạo mới một danh mục từ vựng
export const createCategory = (category) => apiClient.post('/categories', category).then(response => response.data);

// Cập nhật thông tin một danh mục từ vựng theo ID
export const updateCategory = ({ _id, ...updates }) =>
  apiClient.put(`/categories/${_id}`, updates).then(response => response.data);

// Xóa một danh mục từ vựng theo ID
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`).then(response => response.data);
