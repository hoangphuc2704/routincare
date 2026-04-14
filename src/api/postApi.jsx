import axiosClient from '../service/axiosClient';

const requestWithFallback = async (primaryConfig, fallbackConfig) => {
  const fallbackConfigs = Array.isArray(fallbackConfig)
    ? fallbackConfig.filter(Boolean)
    : fallbackConfig
      ? [fallbackConfig]
      : [];

  try {
    return await axiosClient(primaryConfig);
  } catch (err) {
    const status = err?.response?.status;
    const shouldTryFallback = (status === 404 || status === 405) && fallbackConfigs.length > 0;

    if (!shouldTryFallback) {
      throw err;
    }

    let lastErr = err;
    for (const config of fallbackConfigs) {
      try {
        return await axiosClient(config);
      } catch (fallbackErr) {
        lastErr = fallbackErr;
      }
    }

    throw lastErr;
  }
};

const postApi = {
  getPosts: (params) =>
    requestWithFallback(
      { method: 'get', url: '/api/posts', params },
      { method: 'get', url: '/api/Posts', params }
    ),
  getById: (id) =>
    requestWithFallback(
      { method: 'get', url: `/api/posts/${id}` },
      { method: 'get', url: `/api/Posts/${id}` }
    ),
  create: (data) =>
    requestWithFallback(
      { method: 'post', url: '/api/posts', data },
      { method: 'post', url: '/api/Posts', data }
    ),
  delete: (id) =>
    requestWithFallback(
      { method: 'delete', url: `/api/posts/${id}` },
      { method: 'delete', url: `/api/Posts/${id}` }
    ),

  toggleLike: (id) =>
    requestWithFallback(
      { method: 'post', url: `/api/posts/${id}/like` },
      { method: 'post', url: `/api/Posts/${id}/like` }
    ),
  getLikes: (id, params) =>
    requestWithFallback(
      { method: 'get', url: `/api/posts/${id}/likes`, params },
      { method: 'get', url: `/api/Posts/${id}/likes`, params }
    ),

  createComment: (id, data) =>
    requestWithFallback(
      { method: 'post', url: `/api/posts/${id}/comments`, data },
      { method: 'post', url: `/api/Posts/${id}/comments`, data }
    ),
  getComments: (id, params) =>
    requestWithFallback(
      { method: 'get', url: `/api/posts/${id}/comments`, params },
      { method: 'get', url: `/api/Posts/${id}/comments`, params }
    ),
  updateComment: (id, commentId, data) =>
    requestWithFallback(
      { method: 'patch', url: `/api/posts/${id}/comments/${commentId}`, data },
      { method: 'patch', url: `/api/Posts/${id}/comments/${commentId}`, data }
    ),
  deleteComment: (id, commentId) =>
    requestWithFallback(
      { method: 'delete', url: `/api/posts/${id}/comments/${commentId}` },
      { method: 'delete', url: `/api/Posts/${id}/comments/${commentId}` }
    ),

  adminDeletePost: (id) =>
    requestWithFallback(
      { method: 'delete', url: `/api/admin/posts/${id}` },
      { method: 'delete', url: `/api/admin/Posts/${id}` }
    ),
  adminDeleteComment: (id) =>
    requestWithFallback(
      { method: 'delete', url: `/api/admin/comments/${id}` },
      { method: 'delete', url: `/api/admin/Comments/${id}` }
    ),
};

export default postApi;