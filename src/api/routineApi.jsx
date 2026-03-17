import axiosClient from '../service/axiosClient';

const routineApi = {
  // Routine CRUD
  getMyRoutines: () => axiosClient.get('/api/Routines/me'),
  getToday: () => axiosClient.get('/api/Routines/today'),
  getById: (id) => axiosClient.get(`/api/Routines/${id}`),
  create: (data) => axiosClient.post('/api/Routines', data),
  update: (id, data) => axiosClient.put(`/api/Routines/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/Routines/${id}`),
  copy: (id) => axiosClient.post(`/api/Routines/${id}/copy`),

  // Tasks in Routine
  addTask: (routineId, data) => axiosClient.post(`/api/Routines/${routineId}/tasks`, data),
  updateTask: (routineId, taskId, data) =>
    axiosClient.put(`/api/Routines/${routineId}/tasks/${taskId}`, data),
  deleteTask: (routineId, taskId) =>
    axiosClient.delete(`/api/Routines/${routineId}/tasks/${taskId}`),
  reorderTasks: (routineId, data) =>
    axiosClient.put(`/api/Routines/${routineId}/tasks/reorder`, data),

  // Prepare Items – Task level
  addTaskPrepareItem: (routineId, taskId, data) =>
    axiosClient.post(`/api/Routines/${routineId}/tasks/${taskId}/prepare-items`, data),
  updateTaskPrepareItem: (routineId, taskId, itemId, data) =>
    axiosClient.put(`/api/Routines/${routineId}/tasks/${taskId}/prepare-items/${itemId}`, data),
  deleteTaskPrepareItem: (routineId, taskId, itemId) =>
    axiosClient.delete(`/api/Routines/${routineId}/tasks/${taskId}/prepare-items/${itemId}`),

  // Prepare Items – Routine level
  addPrepareItem: (routineId, data) =>
    axiosClient.post(`/api/Routines/${routineId}/prepare-items`, data),
  updatePrepareItem: (routineId, itemId, data) =>
    axiosClient.put(`/api/Routines/${routineId}/prepare-items/${itemId}`, data),
  deletePrepareItem: (routineId, itemId) =>
    axiosClient.delete(`/api/Routines/${routineId}/prepare-items/${itemId}`),
};

export default routineApi;
