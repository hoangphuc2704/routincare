import axiosClient from '../service/axiosClient';

const feedApi = {
  getFeed: (params) => axiosClient.get('/api/feed', { params }),
  getExplore: (params) => axiosClient.get('/api/explore', { params }),
  getExploreRoutines: (params) => axiosClient.get('/api/explore/routines', { params }),
  getExploreUsers: (params) => axiosClient.get('/api/explore/users', { params }),
};

export default feedApi;