import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import LoginGoogle from './LoginGoogle';
import authApi from '../../../services/api/authApi';
import backgroundImage from '../../../assets/images/image1.png';
import { setAuthTokens, setUser } from '../../../utils/tokenService';

function SignUp() {
  const navigate = useNavigate();
  const googleRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      message.warning('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const registerData = {
        fullName,
        email,
        password,
        confirmPassword,
      };

      const res = await authApi.register(registerData);

      if (res.data?.success === false) {
        message.error(res.data?.message || 'Registration failed');
        return;
      }

      const payload = res.data?.data || res.data;

      // Nếu backend trả token (luồng register không OTP), tự đăng nhập
      if (payload?.accessToken) {
        setAuthTokens(payload.accessToken, payload.refreshToken);
        const user = {
          userId: payload.userId || payload.id,
          fullName: payload.fullName || fullName,
          email: payload.email || email,
          roleId: payload.roleId,
          roleName: payload.roleName || payload.role,
          avatar: payload.avatar,
        };
        setUser(user);
        message.success('Registration successful! Logged in.');
        navigate('/home', { replace: true });
        return;
      }

      // Trường hợp server yêu cầu OTP -> không có token, chuyển hướng nhập OTP / login
      message.success('Registration successful! Please check your email for OTP.');
      setTimeout(() => {
        navigate('/login-email');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      message.error(err.response?.data?.message || 'Email already exists or system error!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
      {/* Background/Overlay - Match Login style */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />

      {/* Hidden Google Component */}
      <LoginGoogle ref={googleRef} />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center pt-8">
            <h1 className="text-6xl font-bold tracking-tight text-white mb-2">Sign up</h1>
          </div>

          <div className="space-y-6 pt-4">
            {/* Google Signup */}
            <button
              onClick={() => googleRef.current?.triggerLogin()}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/30 bg-black/40 text-sm font-semibold transition-all hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center">
              <span className="text-lg font-medium text-white px-4">or</span>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-black placeholder-zinc-500 outline-none transition-all focus:ring-2 focus:ring-lime-400"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-black placeholder-zinc-500 outline-none transition-all focus:ring-2 focus:ring-lime-400"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-black placeholder-zinc-500 outline-none transition-all focus:ring-2 focus:ring-lime-400"
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-black placeholder-zinc-500 outline-none transition-all focus:ring-2 focus:ring-lime-400"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-lime-400 py-4 text-center text-sm font-bold text-black transition-all hover:bg-lime-500 active:scale-95 disabled:opacity-70"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-[10px] leading-relaxed text-zinc-400 px-4">
              Signing up for a Routincare account means you agree to the{' '}
              <a href="#" className="font-semibold text-white hover:underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="font-semibold text-white hover:underline">
                Terms of Service
              </a>
              .
            </p>

            <div className="pt-8 text-center">
              <Link
                to="/login-email"
                className="text-sm font-semibold text-white transition-colors hover:text-lime-400"
              >
                Have an account? <span className="underline underline-offset-4">Log in here</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
