import React from "react";
import BottomNav from "../../../../components/BottomNav";
import ProfileTabs from "../../../../components/ProfileTabs";
import UserHeader from "../../../../components/UserHeader";

export default function MyFeedsSavedPage() {
  const savedItems = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517963879466-e9b5498433d5?q=80&w=300&auto=format&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
      <UserHeader />

      <main className="px-4 md:max-w-md md:mx-auto">
        <ProfileTabs activeTab="saved" />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {savedItems.map((src, index) => (
            <div
              key={index}
              className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-gray-800 group"
            >
              <img
                src={src}
                alt={`Saved Post ${index}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav activeItem="target" />
    </div>
  );
}