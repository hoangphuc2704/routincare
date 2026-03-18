import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import LoginGoogle from './LoginGoogle';
import authApi from '../../../api/authApi';

function LoginEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      message.warning('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      if (res.data?.success !== false) {
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
          email: userData.email || email,
          roleId: userData.roleId,
          roleName: userData.roleName || userData.role,
        };

        localStorage.setItem('user', JSON.stringify(user));
        message.success('Đăng nhập thành công');

        setTimeout(() => {
          const isAdmin = user.roleName?.toLowerCase() === 'admin';
          navigate(isAdmin ? '/admin' : '/home', { replace: true });
        }, 1000);
      } else {
        message.error(res.data?.message || 'Đăng nhập thất bại, sai tài khoản hoặc mật khẩu');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error(err.response?.data?.message || 'Lỗi hệ thống khi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/image1.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90 backdrop-blur-[2px]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Rout<span className="text-lime-400">in</span>
            </h1>
            <p className="text-sm text-zinc-300">
              Discover millions of <span className="font-semibold text-lime-400">smart habits</span> shared daily.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/50 outline-none transition-all focus:border-lime-400 focus:bg-black/60 focus:ring-1 focus:ring-lime-400"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/50 outline-none transition-all focus:border-lime-400 focus:bg-black/60 focus:ring-1 focus:ring-lime-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-lime-400 text-sm font-bold text-black shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-500 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-4 flex-shrink-0 text-xs text-white/50">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <div className="space-y-3">
            <LoginGoogle />
          </div>

          <div className="pt-2 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-lime-400 transition-colors hover:text-lime-300 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginEmail;
