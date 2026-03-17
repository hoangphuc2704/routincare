import axiosClient from '../service/axiosClient';

const adminApi = {
  // Admin Categories
  getCategories: (params) => axiosClient.get('/api/admin/categories', { params }),
  createCategory: (data) => axiosClient.post('/api/admin/categories', data),
  getCategoryById: (id) => axiosClient.get(`/api/admin/categories/${id}`),
  updateCategory: (id, data) => axiosClient.patch(`/api/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/api/admin/categories/${id}`),

  // Admin Users
  getUsers: (params) => axiosClient.get('/api/admin/users', { params }),
  createUser: (data) => axiosClient.post('/api/admin/users', data),
  getUserById: (id) => axiosClient.get(`/api/admin/users/${id}`),
};

export default adminApi;
