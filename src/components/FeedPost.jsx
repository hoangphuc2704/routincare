import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, HeartIcon, MessageCircleIcon, SendIcon } from './Icons';

export default function FeedPost({ post }) {
    const userId = post.user.id || post.user.userId;
    
    return (
        <div
            className="relative w-full bg-neutral-900 overflow-hidden mb-4 rounded-3xl border-b border-white/5 shadow-xl"
            style={{ aspectRatio: '4/5' }}
        >
            {/* Image */}
            <img
                src={post.image}
                alt={post.caption || 'Post image'}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <Link to={`/profile/${userId}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-[#d2fb05] transition-all">
                        <img
                            src={
                                post.user.avatar ||
                                `https://i.pravatar.cc/150?u=${post.user.name}`
                            }
                            alt={post.user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="font-semibold text-sm drop-shadow-md group-hover:text-[#d2fb05] transition-all">
                        {post.user.name}
                    </span>
                </Link>

                <button>
                    <BookmarkIcon className="w-6 h-6 text-white drop-shadow-md" />
                </button>
            </div>

            {/* Right actions */}
            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">

                <Action icon={<HeartIcon className="w-8 h-8 text-red-500 fill-red-500" />} value={post.likes} />

                <Action icon={<MessageCircleIcon className="w-8 h-8 text-white" />} value={post.comments} />

                <Action icon={<SendIcon className="w-8 h-8 text-white -rotate-45" />} value={post.shares} />

            </div>

            {/* Caption */}
            {post.caption && (
                <div className="absolute bottom-24 left-4 right-16 z-10">
                    <p className="text-sm font-light line-clamp-2">
                        <span className="font-semibold mr-2">{post.user.name}</span>
                        {post.caption}
                    </p>

                    {post.timeago && (
                        <p className="text-xs text-white/60 mt-1">
                            {post.timeago}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// 🔥 Reusable action component
function Action({ icon, value }) {
    return (
        <div className="flex flex-col items-center gap-1">
            {icon}
            <span className="text-xs font-medium">{value}</span>
        </div>
    );
}