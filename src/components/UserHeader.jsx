import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import chatApi from '../api/chatApi';
import friendApi from '../api/friendApi';
import { MessageCircle, UserPlus, UserCheck, Edit3, Ban, UserMinus, Clock3, Search } from 'lucide-react';
import { message } from 'antd';

const getUserId = (item) => item?.id || item?.userId;

const sameId = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

const getListData = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getRelationIds = (item) => [
    item?.id,
    item?.userId,
    item?.followerId,
    item?.followingId,
    item?.followedUserId,
    item?.targetUserId,
    item?.sourceUserId,
    item?.fromUserId,
    item?.toUserId,
    item?.user?.id,
    item?.user?.userId,
    item?.follower?.id,
    item?.follower?.userId,
    item?.following?.id,
    item?.following?.userId,
].filter(Boolean);

const getFollowState = (data) => {
    if (!data) return false;
    return Boolean(
        data.isFollowing ??
        data.isFollowed ??
        data.following ??
        data.followed ??
        data.is_following ??
        data.is_followed
    );
};

const getCountValue = (data, keys) => {
    if (!data) return 0;
    for (const key of keys) {
        const value = data[key];
        if (value !== undefined && value !== null) {
            const n = Number(value);
            if (Number.isFinite(n)) return n;
        }
    }
    return 0;
};

export default function UserHeader({ user: propUser, isMe }) {
    const navigate = useNavigate();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [friendStatus, setFriendStatus] = useState('none'); // none | friend | incoming | outgoing
    const [friendRequestId, setFriendRequestId] = useState(null);
    const [friendLoading, setFriendLoading] = useState(false);
    const [followersCountState, setFollowersCountState] = useState(0);

    const refreshFollowSnapshot = async (targetId) => {
        if (!targetId) return;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        let myId = currentUser?.userId || currentUser?.id;
        if (!myId) {
            try {
                const meRes = await userApi.getMe();
                const meData = meRes.data?.data || meRes.data || {};
                myId = meData.userId || meData.id;
                if (myId) {
                    const mergedUser = {
                        ...currentUser,
                        userId: myId,
                        id: myId,
                        fullName: currentUser?.fullName || meData.fullName || meData.name,
                        email: currentUser?.email || meData.email,
                        avatarUrl: currentUser?.avatarUrl || meData.avatarUrl || meData.avatar,
                    };
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                }
            } catch (err) {
                console.error('Failed to resolve my id for follow snapshot:', err);
            }
        }

        const followersRes = await userApi.getFollowers(targetId);
        const followersPayload = followersRes.data?.data || followersRes.data || [];
        const followersList = getListData(followersPayload);
        setFollowersCountState(followersList.length);

        if (myId) {
            const followed = followersList.some((item) => getRelationIds(item).some((id) => sameId(id, myId)));
            setIsFollowing(followed);
        }
    };

    useEffect(() => {
        if (!propUser && isMe) {
            const fetchMe = async () => {
                try {
                    const res = await userApi.getMe();
                    const data = res.data?.data || res.data;
                    setFetchedUser(data);
                    setIsFollowing(getFollowState(data));
                } catch (err) {
                    console.error('Failed to fetch user in UserHeader:', err);
                }
            };
            fetchMe();
        } else if (propUser) {
            setIsFollowing(getFollowState(propUser));
        }
    }, [propUser, isMe]);

    useEffect(() => {
        const loadRelations = async () => {
            if (isMe) return;
            const targetId = (propUser || fetchedUser)?.id || (propUser || fetchedUser)?.userId;
            if (!targetId) return;
            try {
                await refreshFollowSnapshot(targetId);

                // Block status
                const blockedRes = await userApi.getBlocked();
                const blockedList = blockedRes.data?.data || blockedRes.data || [];
                const blocked = (blockedList || []).some((item) => sameId(getUserId(item), targetId));
                setIsBlocked(blocked);

                // Friend status
                const friendsRes = await friendApi.getAll();
                const friends = getListData(friendsRes.data) || [];
                const isFriend = friends.some((f) => getRelationIds(f).some((id) => sameId(id, targetId)));
                if (isFriend) {
                    setFriendStatus('friend');
                    setFriendRequestId(null);
                    return;
                }

                const incomingRes = await friendApi.getIncoming();
                const incoming = getListData(incomingRes.data) || [];
                const incomingReq = incoming.find((r) => getRelationIds(r).some((id) => sameId(id, targetId)));
                if (incomingReq) {
                    setFriendStatus('incoming');
                    setFriendRequestId(incomingReq.id || incomingReq.requestId || incomingReq.requestId || incomingReq.requestID || null);
                    return;
                }

                const outgoingRes = await friendApi.getOutgoing();
                const outgoing = getListData(outgoingRes.data) || [];
                const outgoingReq = outgoing.find((r) => getRelationIds(r).some((id) => sameId(id, targetId)));
                if (outgoingReq) {
                    setFriendStatus('outgoing');
                    setFriendRequestId(outgoingReq.id || outgoingReq.requestId || outgoingReq.requestID || null);
                    return;
                }

                setFriendStatus('none');
                setFriendRequestId(null);
            } catch (err) {
                console.error('Relation fetch error:', err);
            }
        };

        loadRelations();
    }, [propUser, fetchedUser, isMe]);

    const user = propUser || fetchedUser || {};
    const routineCount = getCountValue(user, ['routineCount', 'routinesCount', 'totalRoutines', 'total_routines']);
    const followersCount = getCountValue(user, ['followersCount', 'followerCount', 'followers', 'totalFollowers', 'total_followers']);
    const followingCount = getCountValue(user, ['followingCount', 'following', 'totalFollowing', 'total_following']);

    useEffect(() => {
        setFollowersCountState(followersCount);
    }, [followersCount]);

    const handleFollow = async () => {
        if (isMe) return;
        if (isBlocked) {
            message.warning('Bạn đã block user này');
            return;
        }
        try {
            setFollowLoading(true);
            const userId = user.id || user.userId;
            if (!userId) {
                message.error('User ID not found');
                return;
            }
            if (isFollowing) {
                await userApi.unfollow(userId);
                await refreshFollowSnapshot(userId);
                message.success('Unfollowed');
            } else {
                await userApi.follow(userId);
                await refreshFollowSnapshot(userId);
                message.success('Following');
            }
        } catch (err) {
            console.error('Follow error:', err);
            message.error('Action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (isMe) return;
        const userId = user.id || user.userId;
        if (!userId) {
            message.error('User ID not found');
            return;
        }
        try {
            setBlockLoading(true);
            if (isBlocked) {
                await userApi.unblock(userId);
                setIsBlocked(false);
                message.success('Đã gỡ block');
            } else {
                await userApi.block(userId);
                setIsBlocked(true);
                setIsFollowing(false);
                setFriendStatus('none');
                message.success('Đã block user');
            }
        } catch (err) {
            console.error('Block toggle error:', err);
            message.error('Không thực hiện được');
        } finally {
            setBlockLoading(false);
        }
    };

    const handleFriendAction = async (action) => {
        if (isMe || isBlocked) return;
        const userId = user.id || user.userId;
        if (!userId) {
            message.error('User ID not found');
            return;
        }
        try {
            setFriendLoading(true);
            if (action === 'send') {
                const res = await friendApi.sendRequest(userId);
                const payload = res.data?.data || res.data;
                setFriendStatus('outgoing');
                setFriendRequestId(payload?.requestId || payload?.id || null);
                message.success('Đã gửi lời mời kết bạn');
            } else if (action === 'cancel' && friendRequestId) {
                await friendApi.cancelRequest(friendRequestId);
                setFriendStatus('none');
                setFriendRequestId(null);
                message.success('Đã hủy lời mời');
            } else if (action === 'accept' && friendRequestId) {
                await friendApi.acceptRequest(friendRequestId);
                setFriendStatus('friend');
                message.success('Đã chấp nhận kết bạn');
            } else if (action === 'reject' && friendRequestId) {
                await friendApi.rejectRequest(friendRequestId);
                setFriendStatus('none');
                setFriendRequestId(null);
                message.success('Đã từ chối lời mời');
            } else if (action === 'unfriend') {
                await friendApi.unfriend(userId);
                setFriendStatus('none');
                message.success('Đã hủy kết bạn');
            }
        } catch (err) {
            console.error('Friend action error:', err);
            message.error('Không thực hiện được');
        } finally {
            setFriendLoading(false);
        }
    };

    const handleMessage = async () => {
        if (isBlocked) {
            message.warning('Bạn đã block user này');
            return;
        }
        if (friendStatus !== 'friend') {
            message.info('Hãy kết bạn trước khi chat');
            return;
        }
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
                        <Stat label="Routines" value={routineCount} />
                        <Stat label="Followers" value={followersCountState} />
                        <Stat label="Following" value={followingCount} />
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto md:mx-0">
                        {user.bio || "No bio yet. Start building habits together! 🚀"}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {isMe ? (
                            <div className="flex flex-wrap gap-3 w-full">
                                <button 
                                    onClick={() => navigate('/profile')} 
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
                                >
                                    <Edit3 size={16} />
                                    Edit Profile
                                </button>
                                <button 
                                    onClick={() => navigate('/customer/users/search')} 
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-900 text-white border border-white/10 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-neutral-800 transition-all active:scale-95 shadow-lg"
                                >
                                    <Search size={16} />
                                    Tìm user
                                </button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={handleFollow}
                                    disabled={followLoading || isBlocked}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold px-8 py-2.5 rounded-full text-sm transition-all active:scale-95 shadow-lg ${
                                        isBlocked ? 'bg-zinc-800/60 text-zinc-500 border border-white/10 cursor-not-allowed'
                                        : isFollowing 
                                        ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700' 
                                        : 'bg-[#d2fb05] text-black hover:bg-[#bce304]'
                                    }`}
                                >
                                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                    {isFollowing ? 'Followed' : 'Follow'}
                                </button>

                                {friendStatus === 'incoming' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleFriendAction('accept')}
                                            disabled={friendLoading || isBlocked}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all active:scale-95"
                                        >
                                            <UserCheck size={16} />
                                            Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => handleFriendAction('reject')}
                                            disabled={friendLoading || isBlocked}
                                            className="px-4 py-2 rounded-full bg-neutral-900 text-white border border-white/10 text-sm hover:bg-neutral-800 transition-all active:scale-95"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (friendStatus === 'friend') return handleFriendAction('unfriend');
                                            if (friendStatus === 'outgoing') return handleFriendAction('cancel');
                                            return handleFriendAction('send');
                                        }}
                                        disabled={friendLoading || isBlocked}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm transition-all active:scale-95 shadow-lg ${
                                            friendStatus === 'friend'
                                            ? 'bg-neutral-900 text-white border border-white/10 hover:bg-neutral-800'
                                            : friendStatus === 'outgoing'
                                            ? 'bg-neutral-800 text-white border border-white/10 hover:bg-neutral-700'
                                            : 'bg-white text-black hover:bg-neutral-200'
                                        }`}
                                    >
                                        {friendStatus === 'friend' && <UserMinus size={16} />}
                                        {friendStatus === 'outgoing' && <Clock3 size={16} />}
                                        {friendStatus === 'none' && <UserPlus size={16} />}
                                        {friendStatus === 'friend' ? 'Hủy kết bạn' : friendStatus === 'outgoing' ? 'Đã gửi lời mời' : 'Kết bạn'}
                                    </button>
                                )}

                                <button 
                                    onClick={handleBlockToggle}
                                    disabled={blockLoading}
                                    className={`p-2.5 rounded-full border text-sm transition-all active:scale-90 shadow-lg ${
                                        isBlocked
                                            ? 'bg-red-500/15 border-red-400/40 text-red-200 hover:bg-red-500/25'
                                            : 'bg-neutral-800 text-white border-white/10 hover:bg-neutral-700'
                                    }`}
                                >
                                    <Ban size={18} />
                                </button>

                                <button 
                                    onClick={handleMessage}
                                    disabled={isBlocked || friendStatus !== 'friend'}
                                    className={`p-2.5 rounded-full border text-white transition-all active:scale-90 shadow-lg ${
                                        isBlocked || friendStatus !== 'friend'
                                            ? 'bg-neutral-800/60 border-white/10 text-zinc-500 cursor-not-allowed'
                                            : 'bg-neutral-800 border-white/10 hover:bg-neutral-700'
                                    }`}
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