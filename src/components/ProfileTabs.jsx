import React from 'react';
import { Link } from 'react-router-dom';
import { TargetIcon, GridIcon } from './BottomNav';

// --- Local Icon ---
const BookmarkIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
);

// --- Component ---
export default function ProfileTabs({ activeTab }) {
    const getTabClass = (tab) =>
        activeTab === tab
            ? 'flex-1 py-2 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#d2fb05] shadow-sm'
            : 'flex-1 py-2 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors';

    return (
        <div className="bg-[#1a1a1a] rounded-full p-1 flex justify-between mb-6 max-w-xs mx-auto">

            <Link to="/customer/myfeeds" className={getTabClass('routine')}>
                <TargetIcon className="w-6 h-6" />
            </Link>

            <Link to="/customer/myfeeds/grid" className={getTabClass('grid')}>
                <GridIcon className="w-6 h-6" />
            </Link>

            <Link to="/customer/myfeeds/saved" className={getTabClass('saved')}>
                <BookmarkIcon className="w-6 h-6" />
            </Link>

        </div>
    );
}