import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
});

export const getWords = () => apiClient.get('/words').then(res => res.data);
export const getWord = (id) => apiClient.get(`/words/${id}`).then(res => res.data);
export const createWord = (word) => apiClient.post('/words', word).then(res => res.data);
export const updateWord = (word) => apiClient.put(`/words/${word._id}`, word).then(res => res.data);
export const deleteWord = (id) => apiClient.delete(`/words/${id}`).then(res => res.data);

export const getCategories = () => apiClient.get('/categories').then(res => res.data);
export const getCategoryNames = async () => {
  const categories = await getCategories();
  return categories.map(cat => cat.name);
};
export const createCategory = (category) => apiClient.post('/categories', category).then(res => res.data);
export const updateCategory = (category) => apiClient.put(`/categories/${category._id}`, category).then(res => res.data);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`).then(res => res.data);
