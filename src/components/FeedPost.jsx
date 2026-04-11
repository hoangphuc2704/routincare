import React from 'react';
import { BookmarkIcon } from './Icons';

export default function FeedPost({ post, onCopyRoutine, copyLoading }) {
  const user = post?.user || {};
  const displayName = user.name || user.fullName || 'Routin User';
  const displayImage = post?.image || post?.imageUrl || post?.thumbnailUrl || null;
  const canCopyRoutine = Boolean(post?.routineId);

  return (
    <article className="w-full mb-4 rounded-2xl border border-white/10 bg-neutral-950/75 overflow-hidden shadow-xl">
      <div className="relative h-52">
        {displayImage ? (
          <img
            src={displayImage}
            alt={post.caption || 'Post image'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(140deg,#1f2937_0%,#0f172a_45%,#1d2f14_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/75 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
              <img
                src={user.avatar || user.avatarUrl || `https://i.pravatar.cc/150?u=${displayName}`}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-sm text-white drop-shadow-md">
              {displayName}
            </span>
          </div>

          <div className="text-white/90">
            <BookmarkIcon className="w-6 h-6 text-white drop-shadow-md" />
          </div>
        </div>
      </div>

      <div className="p-3">
        {post.caption ? (
          <p className="text-sm text-white/95 line-clamp-2">
            <span className="font-semibold mr-2">{displayName}</span>
            {post.caption}
          </p>
        ) : (
          <p className="text-sm text-white/70">Chia se hoat dong hom nay</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCopyRoutine}
            disabled={!canCopyRoutine || copyLoading}
            className="inline-flex items-center rounded-full border border-[#d2fb05]/40 px-3 py-1.5 text-xs font-semibold text-[#d2fb05] hover:bg-[#d2fb05]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copyLoading ? 'Dang copy...' : 'Copy routine'}
          </button>

          {post.timeago && <p className="text-xs text-white/55">{post.timeago}</p>}
        </div>
      </div>
    </article>
  );
}
