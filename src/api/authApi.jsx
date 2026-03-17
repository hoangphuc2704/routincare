import axiosClient from '../service/axiosClient';

const authApi = {
  // 1 & 2. Đăng ký & Xác thực OTP
  register: (data) => axiosClient.post('/api/Auth/register', data),
  sendOtp: (data) => axiosClient.post('/api/Auth/register/otp/send', data),
  verifyOtp: (data) => axiosClient.post('/api/Auth/register/otp/verify', data),

  // 3. Đăng nhập Email/Password
  login: (data) => axiosClient.post('/api/Auth/login', data),

  // 4. Đăng nhập / Đăng ký Google
  loginWithGoogle: (data) => axiosClient.post('/api/Auth/google', data),

  // 5. Refresh Token
  refreshToken: (data) => axiosClient.post('/api/Auth/refresh-token', data),

  // 6. Đăng xuất
  logout: (data) => axiosClient.post('/api/Auth/logout', data),
};
export default authApi;
