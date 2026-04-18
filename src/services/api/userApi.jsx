import axiosClient from '../core/axiosClient';

const userApi = {
  // Danh sách users (admin)
  getAll: (params) => axiosClient.get('/api/Users', { params }),
  // Tạo user (admin)
  create: (data) => axiosClient.post('/api/Users', data),
  // Chi tiết user theo ID
  getById: (id) => axiosClient.get(`/api/Users/${id}`),
  // Profile của mình
  getMe: () => axiosClient.get('/api/Users/me'),
  // Public profile người khác
  getPublicProfile: (id) => axiosClient.get(`/api/users/${id}/profile`),
  // Cập nhật profile
  updateMe: (data) => axiosClient.patch('/api/Users/me', data),
  // Đổi mật khẩu
  changePassword: (data) => axiosClient.patch('/api/Users/me/password', data),

  // Search public users by keyword (name/email)
  searchPublic: (params) => axiosClient.get('/api/users/search', { params }),

  // Follow / Unfollow
  follow: (id) => axiosClient.post(`/api/Users/${id}/follow`),
  unfollow: (id) => axiosClient.delete(`/api/Users/${id}/follow`),
  getFollowers: (id) => axiosClient.get(`/api/Users/${id}/followers`),
  getFollowing: (id) => axiosClient.get(`/api/Users/${id}/following`),
  getFollowingRoutines: (params) => axiosClient.get('/api/users/me/following/routines', { params }),

  // Block / Unblock
  block: (id) => axiosClient.post(`/api/Users/${id}/block`),
  unblock: (id) => axiosClient.delete(`/api/Users/${id}/block`),
  getBlocked: () => axiosClient.get('/api/Users/me/blocks'),

  // Get user's public routines
  getPublicRoutines: (userId, params) =>
    axiosClient.get(`/api/users/${userId}/routines/public`, { params }),
};

export default userApi;
