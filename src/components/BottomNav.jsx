import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../api/userApi';

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

// --- Component ---
export default function BottomNav({ activeItem }) {
  const [avatar, setAvatar] = useState(null);

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

  const getItemClass = (item) =>
    item === activeItem
      ? 'p-1 text-[#d2fb05]'
      : 'p-1 text-white hover:text-[#d2fb05] transition-colors';

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 md:max-w-md md:mx-auto">
      <div className="bg-[#1a1a1a]/95 backdrop-blur-md rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10">
        {/* Main Nav Items */}
        <div className="flex flex-1 items-center justify-around px-2">
          <Link to="/home" className={`flex flex-col items-center gap-1 transition-all ${getItemClass('home')}`}>
            <HomeIcon className="w-6 h-6" filled={activeItem === 'home'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </Link>

          <Link to="/customer/selfroutin" className={`flex flex-col items-center gap-1 transition-all ${getItemClass('target')}`}>
            <TargetIcon className="w-6 h-6" filled={activeItem === 'target'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Plan</span>
          </Link>

          <Link to="/customer/message" className={`flex flex-col items-center gap-1 transition-all ${getItemClass('message')}`}>
            <MessageCircleIcon className="w-6 h-6" filled={activeItem === 'message'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
          </Link>
        </div>

        {/* Profile Avatar as a separate circular action */}
        <Link to="/profile" className="flex-shrink-0 transition-transform active:scale-90">
          <div
            className={`w-12 h-12 rounded-full border-2 p-0.5 overflow-hidden shadow-lg transition-all ${
              activeItem === 'profile'
                ? 'border-[#d2fb05] scale-110 shadow-[#d2fb05]/20'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img
              src={avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
