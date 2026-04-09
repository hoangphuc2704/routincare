import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../api/userApi';
import friendApi from '../api/friendApi';

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

export const UserIcon = ({ className, filled }) => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// --- Component ---
export default function BottomNav({ activeItem }) {
  const [avatar, setAvatar] = useState(null);
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get from localStorage first for instant feel
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.avatarUrl) setAvatar(user.avatarUrl);
        }

        // Fetch avatar and friend requests
        const [meRes, incomingRes] = await Promise.all([userApi.getMe(), friendApi.getIncoming()]);

        // Handle avatar
        const meData = meRes.data?.data || meRes.data;
        if (meData.avatarUrl) {
          setAvatar(meData.avatarUrl);

          // Update localStorage for other components
          if (storedUser) {
            const user = JSON.parse(storedUser);
            localStorage.setItem('user', JSON.stringify({ ...user, avatarUrl: meData.avatarUrl }));
          }
        }

        // Handle incoming requests count
        const incomingData = incomingRes.data?.data || incomingRes.data || [];
        const count = Array.isArray(incomingData) ? incomingData.length : 0;
        setIncomingRequestCount(count);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
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
          <Link
            to="/home"
            className={`flex flex-col items-center gap-1 transition-all ${getItemClass('home')}`}
          >
            <HomeIcon className="w-6 h-6" filled={activeItem === 'home'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </Link>

          <Link
            to="/customer/selfroutin"
            className={`flex flex-col items-center gap-1 transition-all ${getItemClass('target')}`}
          >
            <TargetIcon className="w-6 h-6" filled={activeItem === 'target'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Plan</span>
          </Link>

          <Link
            to="/customer/message"
            className={`flex flex-col items-center gap-1 transition-all ${getItemClass('message')}`}
          >
            <MessageCircleIcon className="w-6 h-6" filled={activeItem === 'message'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
          </Link>

          <Link
            to="/customer/friend/requests"
            className={`flex flex-col items-center gap-1 transition-all relative ${getItemClass('requests')}`}
          >
            <UserIcon className="w-6 h-6" filled={activeItem === 'requests'} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Friends</span>
            {incomingRequestCount > 0 && (
              <div className="absolute -top-1 -right-2 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center border border-white/20">
                <span className="text-[10px] font-bold text-white">{incomingRequestCount}</span>
              </div>
            )}
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
  );
}
