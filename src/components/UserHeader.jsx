import React from 'react';

export default function UserHeader({ user: propUser }) {
    // Mock user for demo if no user is passed
    const defaultUser = {
        username: "hoangphuc.dev",
        name: "Nguyên Bùi Hoàng Phúc",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        routineCount: 12,
        followers: "1.2k",
        following: 156,
        bio: "Fitness Enthusiast | Habit Builder\nSharing my journey to a better life."
    };

    const user = propUser || defaultUser;

    return (
        <>
            {/* Header */}
            <header className="flex items-center justify-between p-4 md:max-w-md md:mx-auto">
                <h1 className="text-xl font-bold">{user?.username || "Guest"}</h1>

                <button className="p-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-white"
                    >
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                </button>
            </header>

            <div className="px-4 md:max-w-md md:mx-auto">

                {/* Profile Info */}
                <div className="flex gap-4 mb-6">

                    <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                        <img
                            src={user?.avatar || "https://via.placeholder.com/150"}
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="font-bold text-lg">{user?.name || "User"}</h2>

                        <div className="flex gap-6 mt-1 mb-2 text-sm">
                            <Stat label="Routine" value={user?.routineCount || 0} />
                            <Stat label="Followers" value={user?.followers || 0} />
                            <Stat label="Following" value={user?.following || 0} />
                        </div>

                        <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                            {user?.bio || "No bio yet."}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-8">
                    <ActionButton text="Follow" />
                    <ActionButton text="Copy Routine" />
                </div>

            </div>
        </>
    );
}

// --- Sub components ---
const Stat = ({ label, value }) => (
    <div>
        <span className="font-bold mr-1">{value}</span>
        <span className="text-gray-400">{label}</span>
    </div>
);

const ActionButton = ({ text }) => (
    <button className="flex-1 bg-[#d2fb05] text-black font-bold py-2 rounded-full text-sm hover:bg-[#bce304] transition-colors">
        {text}
    </button>
);