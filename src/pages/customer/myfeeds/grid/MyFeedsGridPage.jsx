import React from "react";
import BottomNav from "../../../../components/BottomNav";
import ProfileTabs from "../../../../components/ProfileTabs";
import UserHeader from "../../../../components/UserHeader";

export default function MyFeedsGridPage() {
  const images = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517963879466-e9b5498433d5?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=300&auto=format&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
      <UserHeader />

      <main className="px-4 md:max-w-md md:mx-auto">
        <ProfileTabs activeTab="grid" />

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, index) => (
            <div
              key={index}
              className="aspect-square relative rounded-xl overflow-hidden bg-gray-800"
            >
              <img
                src={src}
                alt={`Post ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </main>

      <BottomNav activeItem="grid" />
    </div>
  );
}