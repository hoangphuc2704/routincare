import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../services/api/authApi';
import userApi from '../services/api/userApi';
import { clearAllAuth, getRefreshToken } from '../utils/tokenService';
import { SearchIcon, UsersIcon } from './Icons';

// --- Icons ---
export const HomeIcon = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const TargetIcon = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const GridIcon = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export const MessageCircleIcon = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const MoreIcon = ({ className, filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// --- Component ---
export default function BottomNav({ activeItem }) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        // Try to get from localStorage first for instant feel
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.avatarUrl) setAvatar(user.avatarUrl);
        }

        // Always fetch fresh data to sync
        const res = await userApi.getMe();
        const data = res.data?.data || res.data;
        if (data.avatarUrl) {
          setAvatar(data.avatarUrl);

          // Update localStorage for other components
          if (storedUser) {
            const user = JSON.parse(storedUser);
            localStorage.setItem('user', JSON.stringify({ ...user, avatarUrl: data.avatarUrl }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      }
    };

    fetchAvatar();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await authApi.logout({ refreshToken });
        } catch (err) {
          console.warn('Logout API failed, fallback clear local auth:', err);
        }
      }

      clearAllAuth();
      setMoreMenuOpen(false);
      message.success('Da dang xuat');
      navigate('/', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  const getItemClass = (item) =>
    item === activeItem
      ? 'p-1 text-[#d2fb05]'
      : 'p-1 text-white hover:text-[#d2fb05] transition-colors';

  const desktopItems = [
    { key: 'home', to: '/home', label: 'Home', icon: HomeIcon },
    { key: 'search', to: '/customer/users/search', label: 'Search', icon: SearchIcon },
    { key: 'target', to: '/customer/selfroutin', label: 'Plan', icon: TargetIcon },
    { key: 'message', to: '/customer/message', label: 'Chat', icon: MessageCircleIcon },
    { key: 'friends', to: '/customer/friend/list', label: 'Friends', icon: UsersIcon },
  ];

  return (
    <>
      {/* Mobile bottom tab */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(calc(100%-2rem),28rem)] md:hidden">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-md rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10">
          <div className="flex flex-1 items-center justify-around px-1">
            <Link to="/home" className={`p-2 transition-all ${getItemClass('home')}`}>
              <HomeIcon className="w-6 h-6" filled={activeItem === 'home'} />
            </Link>

            <Link
              to="/customer/users/search"
              className="p-2 text-white hover:text-[#d2fb05] transition-colors"
            >
              <SearchIcon className="w-6 h-6" />
            </Link>

            <Link
              to="/customer/friend/list"
              className={`p-2 transition-all ${getItemClass('friends')}`}
            >
              <UsersIcon className="w-6 h-6" filled={activeItem === 'friends'} />
            </Link>

            <Link
              to="/customer/message"
              className={`p-2 transition-all ${getItemClass('message')}`}
            >
              <MessageCircleIcon className="w-6 h-6" filled={activeItem === 'message'} />
            </Link>
          </div>

          <Link to="/profile" className="flex-shrink-0 transition-transform active:scale-90">
            <div
              className={`w-12 h-12 rounded-full border-2 p-0.5 overflow-hidden shadow-lg transition-all ${
                activeItem === 'profile'
                  ? 'border-[#d2fb05] scale-110 shadow-[#d2fb05]/20'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <img
                src={
                  avatar ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Desktop left sidebar */}
      <aside
        onMouseLeave={() => setMoreMenuOpen(false)}
        className="hidden md:flex fixed left-0 top-0 h-screen w-[86px] hover:w-[220px] z-50 border-r border-white/10 bg-[#101010]/95 backdrop-blur-md transition-[width] duration-150 group"
      >
        <div className="h-full w-full flex flex-col py-6 px-3">
          <Link
            to="/home"
            className="flex items-center gap-3 px-3 text-white hover:text-[#d2fb05] transition-colors"
          >
            <span className="text-2xl font-black text-white leading-none">R</span>
            <span className="text-lg font-bold text-white whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-150">
              Routin
            </span>
          </Link>

          <div className="mt-12 flex flex-col gap-2">
            {desktopItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeItem;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-4 rounded-xl px-3 py-3 transition-all ${
                    isActive
                      ? 'text-[#d2fb05] bg-white/5'
                      : 'text-white hover:text-[#d2fb05] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-7 h-7 shrink-0" filled={isActive} />
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-150">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto mb-2 relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen((prev) => !prev)}
              className="w-full flex items-center gap-4 rounded-xl px-3 py-3 text-white hover:text-[#d2fb05] hover:bg-white/5 transition-all"
            >
              <MoreIcon className="w-7 h-7 shrink-0" filled={moreMenuOpen} />
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-150">
                Xem them
              </span>
            </button>

            {moreMenuOpen && (
              <div className="absolute bottom-full left-3 mb-2 w-44 rounded-2xl border border-white/10 bg-[#151515] p-2 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white whitespace-nowrap hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {logoutLoading ? 'Dang xuat...' : 'Dang xuat'}
                </button>
              </div>
            )}
          </div>

          <Link
            to="/profile"
            className="mb-2 flex items-center gap-4 rounded-xl px-1 py-3 hover:bg-white/5 transition-all"
          >
            <div
              className={`w-11 h-11 rounded-full border-2 p-0.5 overflow-hidden shrink-0 ${
                activeItem === 'profile' ? 'border-[#d2fb05]' : 'border-white/20'
              }`}
            >
              <img
                src={
                  avatar ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-150">
              Profile
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
