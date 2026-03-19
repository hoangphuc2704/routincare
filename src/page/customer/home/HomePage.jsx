import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav'
import FeedPost from '../../../components/FeedPost';
import { BellIcon, SearchIcon } from '../../../components/Icons';

export default function Homepage() {
  // Posts should be loaded from API once available. For now, show empty state instead of mocked data.
  const posts = [];

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm md:max-w-md md:mx-auto">

        <Link
          to="/customer/users/search"
          className="p-2 -ml-2"
          aria-label="Tìm kiếm người dùng"
        >
          <SearchIcon className="w-7 h-7 text-white" />
        </Link>

        <div className="text-2xl font-bold tracking-tight">
          Rout<span className="text-[#d2fb05]">in</span>
        </div>

        <Link to="/notification" className="p-2 -mr-2 relative">
          <BellIcon className="w-7 h-7 text-white" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
        </Link>
      </header>

      {/* Feed */}
      <main className="md:max-w-md md:mx-auto pt-20 pb-28">
        {posts.length > 0 ? (
          <div className="flex flex-col gap-1">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-white/60">
            <p className="text-lg font-semibold">Chưa có nội dung hiển thị</p>
            <p className="text-sm mt-2">Kết nối hoặc theo dõi để thấy bài đăng tại đây.</p>
          </div>
        )}
      </main>

      <BottomNav activeItem="home" />
    </div>
  );
}