import axiosClient from '../service/axiosClient';

const mediaApi = {
  signUpload: (data) => axiosClient.post('/api/media/sign-upload', data),
};

export default mediaApi;
