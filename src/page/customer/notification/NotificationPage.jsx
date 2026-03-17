import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../../components/BottomNav";

// --- Icons ---
const ChevronLeftIcon = ({ className }) => (
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
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const HeartFilledIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export default function NotificationPage() {
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            user: {
                name: "Minh Hoàng",
                avatar:
                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
            },
            action: 'Started following your "Gym" routine.',
            timeago: "5m",
            type: "follow_routine",
        },
        {
            id: 2,
            user: {
                name: "daspirtitof.dom",
                avatar:
                    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
            },
            action: "Liked your photo.",
            timeago: "10m",
            type: "like_photo",
            targetImage:
                "https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=200&auto=format&fit=crop",
        },
        {
            id: 3,
            user: {
                name: "h.dwog",
                avatar:
                    "https://images.unsplash.com/photo-1549463412-10173bc3e597?q=80&w=200&auto=format&fit=crop",
            },
            action: "Started following you.",
            timeago: "1h",
            type: "follow_user",
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans relative pb-24">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 md:max-w-md md:mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>

                <h1 className="text-4xl font-bold text-[#d2fb05]">
                    Notification
                </h1>
            </header>

            {/* Main */}
            <main className="px-4 mt-2 md:max-w-md md:mx-auto">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-500">Today</h2>
                </div>

                <div className="flex flex-col space-y-6">
                    {notifications.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                                <img
                                    src={item.user.avatar}
                                    alt={item.user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm leading-relaxed">
                                    <span className="font-bold text-[#d2fb05] mr-1">
                                        {item.user.name}
                                    </span>
                                    <span className="text-white font-medium">
                                        {item.action}
                                    </span>
                                    <span className="text-gray-500 ml-2 text-xs">
                                        {item.timeago}
                                    </span>
                                </p>
                            </div>

                            {/* Right side */}
                            {item.type === "like_photo" && item.targetImage && (
                                <div className="relative w-12 h-12 ml-2">
                                    <img
                                        src={item.targetImage}
                                        alt="Liked"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                    <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-black">
                                        <HeartFilledIcon className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    );
}