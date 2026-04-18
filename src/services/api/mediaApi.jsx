import axiosClient from '../core/axiosClient';

const mediaApi = {
  signUpload: (data) => axiosClient.post('/api/media/sign-upload', data),
};

export default mediaApi;
