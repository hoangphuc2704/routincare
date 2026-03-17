import React, { forwardRef, useImperativeHandle } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import authApi from '../../../api/authApi';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
function GoogleButton(props, ref) {
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleSuccess,
    onError: handleError,
  });

  useImperativeHandle(ref, () => ({
    triggerLogin() {
      googleLogin();
    },
  }));

  async function handleSuccess(response) {
    try {
      if (!response?.code) {
        throw new Error('No authorization code received from Google');
      }

      console.log('Google auth code received. Sending to backend...');

      const loginData = {
        idToken: response.code,
        token: response.code,
        code: response.code,
      };

      const res = await authApi.loginWithGoogle(loginData);

      if (res.data?.success === false) {
        throw new Error(res.data?.message || 'Unauthorized by Server');
      }

      const userData = res.data?.data || res.data;

      if (userData.accessToken) {
        localStorage.setItem('accessToken', userData.accessToken);
      }
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }

      const user = {
        userId: userData.userId || userData.id,
        fullName: userData.fullName || userData.name,
        email: userData.email,
        roleId: userData.roleId,
        roleName: userData.roleName || userData.role,
        avatar: userData.avatar,
      };

      localStorage.setItem('user', JSON.stringify(user));
      message.success('Đăng nhập Google thành công');

      setTimeout(() => {
        const isAdmin = user.roleName?.toLowerCase() === 'admin';
        navigate(isAdmin ? '/admin' : '/home', { replace: true });
      }, 500);
    } catch (err) {
      // Log chi tiết lỗi 400/401 từ server để debug
      console.error('Login error detail:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Đăng nhập Google thất bại!';
      message.error(errorMsg);
    }
  }
  function handleError() {
    message.error('Đăng nhập Google thất bại');
  }
  return null;
}

export default forwardRef(GoogleButton);
