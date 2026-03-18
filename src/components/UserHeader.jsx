import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import chatApi from '../api/chatApi';
import { MessageCircle, UserPlus, UserCheck, Edit3 } from 'lucide-react';
import { message } from 'antd';

export default function UserHeader({ user: propUser, isMe }) {
    const navigate = useNavigate();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!propUser && isMe) {
            const fetchMe = async () => {
                try {
                    const res = await userApi.getMe();
                    const data = res.data?.data || res.data;
                    setFetchedUser(data);
                    setIsFollowing(data.isFollowing || false);
                } catch (err) {
                    console.error('Failed to fetch user in UserHeader:', err);
                }
            };
            fetchMe();
        } else if (propUser) {
            setIsFollowing(propUser.isFollowing || false);
        }
    }, [propUser, isMe]);

    const user = propUser || fetchedUser || {};

    const handleFollow = async () => {
        if (isMe) return;
        try {
            setFollowLoading(true);
            const userId = user.id || user.userId;
            if (!userId) {
                message.error('User ID not found');
                return;
            }
            if (isFollowing) {
                await userApi.unfollow(userId);
                setIsFollowing(false);
                message.success('Unfollowed');
            } else {
                await userApi.follow(userId);
                setIsFollowing(true);
                message.success('Following');
            }
        } catch (err) {
            console.error('Follow error:', err);
            message.error('Action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMessage = async () => {
        try {
            const userId = user.id || user.userId;
            if (!userId) {
                message.error('User ID not found');
                return;
            }
            const res = await chatApi.createDirect(userId);
            const conversation = res.data?.data || res.data;
            navigate(`/customer/message/${conversation.id}`, { state: { partner: user } });
        } catch (err) {
            console.error('Failed to start chat:', err);
            message.error('Could not start conversation');
        }
    };

    return (
        <div className="bg-neutral-900/50 rounded-3xl p-6 border border-white/5 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-black ring-2 ring-[#d2fb05]/20 group-hover:ring-[#d2fb05]/50 transition-all shadow-2xl flex-shrink-0">
                        <img
                            src={user.avatarUrl || user.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                            alt={user.fullName || user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight text-ellipsis overflow-hidden whitespace-nowrap">
                            {user.fullName || user.name || "User"}
                        </h2>
                        <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">
                            @{user.username || user.email?.split('@')[0] || "member"}
                        </p>
                    </div>

                    <div className="flex justify-center md:justify-start gap-8 py-2 border-y border-white/5">
                        <Stat label="Routines" value={user.routineCount || 0} />
                        <Stat label="Followers" value={user.followersCount || user.followers || 0} />
                        <Stat label="Following" value={user.followingCount || user.following || 0} />
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto md:mx-0">
                        {user.bio || "No bio yet. Start building habits together! 🚀"}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {isMe ? (
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold px-8 py-2.5 rounded-full text-sm transition-all active:scale-95 shadow-lg ${
                                        isFollowing 
                                        ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700' 
                                        : 'bg-[#d2fb05] text-black hover:bg-[#bce304]'
                                    }`}
                                >
                                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button 
                                    onClick={handleMessage}
                                    className="p-2.5 rounded-full bg-neutral-800 text-white border border-white/10 hover:bg-neutral-700 transition-all active:scale-90 shadow-lg"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Stat = ({ label, value }) => (
    <div className="flex flex-col items-center md:items-start group">
        <span className="text-lg font-black text-white group-hover:text-[#d2fb05] transition-colors">{value}</span>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{label}</span>
    </div>
);