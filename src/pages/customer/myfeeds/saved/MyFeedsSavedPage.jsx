import React from 'react';
import BottomNav from '../../../../components/BottomNav';
import ProfileTabs from '../../../../components/ProfileTabs';
import UserHeader from '../../../../components/UserHeader';

const DEMO_SAVED_ITEMS = [
  {
    id: 'saved-1',
    imageUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop',
    alt: 'Saved post fitness',
  },
  {
    id: 'saved-2',
    imageUrl:
      'https://images.unsplash.com/photo-1517963879466-e9b5498433d5?q=80&w=300&auto=format&fit=crop',
    alt: 'Saved post workout',
  },
];

export default function MyFeedsSavedPage() {
  const savedItems = DEMO_SAVED_ITEMS;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
      <UserHeader />

      <main className="px-4 md:max-w-md md:mx-auto">
        <ProfileTabs activeTab="saved" />

        {savedItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-center text-sm text-zinc-400">
            Chưa có bài viết nào được lưu.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedItems.map((item) => (
              <article
                key={item.id}
                className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-gray-800 group"
              >
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
              </article>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeItem="target" />
    </div>
  );
}