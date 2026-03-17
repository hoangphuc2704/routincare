import React from 'react';
import { Link } from 'react-router-dom';

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
    const getItemClass = (item) =>
        item === activeItem
            ? 'p-1 text-[#d2fb05]'
            : 'p-1 text-white hover:text-[#d2fb05] transition-colors';

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:max-w-md md:mx-auto flex items-end justify-between gap-4">

            {/* Main Nav */}
            <div className="flex-1 bg-[#1a1a1a] rounded-[2rem] px-6 py-4 flex items-center justify-between shadow-xl border border-white/5">

                <Link to="/customer" className={getItemClass('home')}>
                    <HomeIcon className="w-6 h-6" filled={activeItem === 'home'} />
                </Link>

                <Link to="/customer/selfroutin" className={getItemClass('target')}>
                    <TargetIcon className="w-6 h-6" filled={activeItem === 'target'} />
                </Link>

                <Link to="/customer/myfeeds/grid" className={getItemClass('grid')}>
                    <GridIcon className="w-6 h-6" filled={activeItem === 'grid'} />
                </Link>

                <Link to="/customer/message" className={getItemClass('message')}>
                    <MessageCircleIcon className="w-6 h-6" filled={activeItem === 'message'} />
                </Link>
            </div>

            {/* Profile */}
            <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-[#d2fb05] p-0.5 overflow-hidden bg-black shadow-xl">
                    <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>

        </div>
    );
}