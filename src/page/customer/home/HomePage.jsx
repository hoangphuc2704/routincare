import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav'
import FeedPost from '../../../components/FeedPost';
import { BellIcon, SearchIcon } from '../../../components/Icons';

export default function Homepage() {
  const posts = [
    {
      id: 1,
      user: {
        name: 'bng.png',
        avatar: '/images/avatar1.png',
      },
      image:
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8',
      likes: '11.7k',
      comments: '2.5k',
      shares: '5k',
      caption: 'Finding peace in the chaos ✨',
    },
    {
      id: 2,
      user: {
        name: 'lawren_wes',
        avatar: '/images/avatar2.png',
      },
      image:
        'https://images.unsplash.com/photo-1618331835717-801e976710b2',
      likes: '5.2k',
      comments: '1.2k',
      shares: '800',
      caption: 'Pushed harder today. No excuses.',
      timeago: '6 days ago',
    },
    {
      id: 3,
      user: {
        name: 'fitness_junkie',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      likes: '23.1k',
      comments: '430',
      shares: '1.2k',
      caption: 'Morning run views 🌅 #cardio #morningmotivation',
      timeago: '2 hours ago',
    },
    {
      id: 4,
      user: {
        name: 'yoga_daily',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1544367563-12123d815d19',
      likes: '8.9k',
      comments: '210',
      shares: '500',
      caption: 'Balance is key. 🧘‍♀️',
      timeago: '1 day ago',
    },
    {
      id: 5,
      user: {
        name: 'crossfit_dave',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      likes: '15k',
      comments: '800',
      shares: '3k',
      caption: 'Personal best today! 🏋️‍♂️',
      timeago: '3 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm md:max-w-md md:mx-auto">

        <button className="p-2 -ml-2">
          <SearchIcon className="w-7 h-7 text-white" />
        </button>

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
        <div className="flex flex-col gap-1">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </main>

      <BottomNav activeItem="home" />
    </div>
  );
}