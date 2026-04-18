import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../services/api/userApi';
import chatApi from '../services/api/chatApi';
import friendApi from '../services/api/friendApi';
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  Edit3,
  Ban,
  UserMinus,
  Clock3,
  Search,
} from 'lucide-react';
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

const getRelationIds = (item) =>
  [
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

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getUniqueFollowingCountFromRoutines = (payload) => {
  const list = getListData(payload);
  const ids = new Set();
  list.forEach((item) => {
    const id =
      item?.userId || item?.ownerId || item?.createdBy || item?.user?.id || item?.user?.userId;
    if (id !== undefined && id !== null) {
      ids.add(String(id).toLowerCase());
    }
  });
  return ids.size;
};

export default function UserHeader({ user: propUser, isMe, onEditProfile }) {
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
  const [followingCountState, setFollowingCountState] = useState(0);

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

    const [followersRes, followingRes] = await Promise.all([
      userApi.getFollowers(targetId),
      userApi.getFollowing(targetId),
    ]);
    const followersPayload = followersRes.data?.data || followersRes.data || [];
    const followersList = getListData(followersPayload);
    setFollowersCountState(followersList.length);

    const followingPayload = followingRes.data?.data || followingRes.data || [];
    const followingList = getListData(followingPayload);
    setFollowingCountState(followingList.length);

    if (myId) {
      const followed = followersList.some((item) =>
        getRelationIds(item).some((id) => sameId(id, myId))
      );
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

  // Fetch follower/following counts for own profile
  useEffect(() => {
    if (!isMe) return;
    const fetchMyCounts = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        let myId = currentUser?.userId || currentUser?.id;
        if (!myId) {
          const meRes = await userApi.getMe();
          const meData = meRes.data?.data || meRes.data || {};
          myId = meData.userId || meData.id;
        }
        if (!myId) return;
        await refreshFollowSnapshot(myId);

        // Prefer social snapshot from /users/me/following/routines when available.
        // Some backends return counters in payload/meta for this endpoint.
        try {
          const followRoutinesRes = await userApi.getFollowingRoutines({ page: 1, pageSize: 1 });
          const payload = followRoutinesRes.data?.data || followRoutinesRes.data || {};
          const followingFromPayload =
            toNumber(payload?.followingCount) ??
            toNumber(payload?.totalFollowing) ??
            toNumber(payload?.following_count) ??
            toNumber(payload?.meta?.followingCount) ??
            toNumber(payload?.meta?.totalFollowing) ??
            toNumber(payload?.meta?.following_count);
          const followersFromPayload =
            toNumber(payload?.followersCount) ??
            toNumber(payload?.followerCount) ??
            toNumber(payload?.totalFollowers) ??
            toNumber(payload?.followers_count) ??
            toNumber(payload?.meta?.followersCount) ??
            toNumber(payload?.meta?.followerCount) ??
            toNumber(payload?.meta?.totalFollowers) ??
            toNumber(payload?.meta?.followers_count);

          if (followingFromPayload !== null) {
            setFollowingCountState(followingFromPayload);
          } else {
            const uniqueFollowingCount = getUniqueFollowingCountFromRoutines(payload);
            if (uniqueFollowingCount > 0) {
              setFollowingCountState(uniqueFollowingCount);
            }
          }

          if (followersFromPayload !== null) {
            setFollowersCountState(followersFromPayload);
          }
        } catch (err) {
          console.warn('Following routines snapshot not available:', err);
        }
      } catch (err) {
        console.error('Failed to fetch my follow counts:', err);
      }
    };
    fetchMyCounts();
  }, [isMe, propUser]);

  useEffect(() => {
    const loadRelations = async () => {
      if (isMe) return;
      const targetId = (propUser || fetchedUser)?.id || (propUser || fetchedUser)?.userId;
      if (!targetId) return;

      console.log('🔍 Loading relations for targetId:', targetId);

      try {
        await refreshFollowSnapshot(targetId);

        // Block status
        const blockedRes = await userApi.getBlocked();
        const blockedList = blockedRes.data?.data || blockedRes.data || [];
        const blocked = (blockedList || []).some((item) => sameId(getUserId(item), targetId));
        setIsBlocked(blocked);
        console.log('🚫 Block status:', blocked);

        // Friend status
        const friendsRes = await friendApi.getAll();
        const friends = getListData(friendsRes.data) || [];
        console.log('👥 Friends list:', friends);

        const isFriend = friends.some((f) => getRelationIds(f).some((id) => sameId(id, targetId)));
        if (isFriend) {
          console.log('✅ Found as friend');
          setFriendStatus('friend');
          setFriendRequestId(null);
          return;
        }

        // Incoming friend requests - check for requesterId specifically
        const incomingRes = await friendApi.getIncoming();
        const incoming = getListData(incomingRes.data) || [];
        console.log('📬 Incoming requests raw:', incoming);

        const incomingReq = incoming.find((r) => {
          // Check requesterId first (most common in incoming requests)
          const requesterId = r?.requesterId || r?.senderId || r?.fromUserId;
          console.log('Checking request:', r, 'requesterId:', requesterId, 'targetId:', targetId);

          if (requesterId && sameId(requesterId, targetId)) {
            return true;
          }

          // Fallback to general ID extraction
          return getRelationIds(r).some((id) => sameId(id, targetId));
        });

        if (incomingReq) {
          console.log('⬇️ Found incoming request:', incomingReq);
          const reqId = incomingReq.id || incomingReq.requestId || incomingReq.requestID || null;
          console.log('Request ID:', reqId);
          setFriendStatus('incoming');
          setFriendRequestId(reqId);
          return;
        }

        // Outgoing friend requests
        const outgoingRes = await friendApi.getOutgoing();
        const outgoing = getListData(outgoingRes.data) || [];
        console.log('📤 Outgoing requests:', outgoing);

        const outgoingReq = outgoing.find((r) => {
          // Check targetUserId first (most common in outgoing requests)
          const targetUserId = r?.targetUserId || r?.toUserId || r?.recipientId;
          console.log(
            'Checking outgoing request:',
            r,
            'targetUserId:',
            targetUserId,
            'targetId:',
            targetId
          );

          if (targetUserId && sameId(targetUserId, targetId)) {
            return true;
          }

          return getRelationIds(r).some((id) => sameId(id, targetId));
        });

        if (outgoingReq) {
          console.log('⬆️ Found outgoing request:', outgoingReq);
          setFriendStatus('outgoing');
          setFriendRequestId(
            outgoingReq.id || outgoingReq.requestId || outgoingReq.requestID || null
          );
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
  const routineCount = getCountValue(user, [
    'routineCount',
    'routinesCount',
    'totalRoutines',
    'total_routines',
  ]);
  const followersCount = getCountValue(user, [
    'followersCount',
    'followerCount',
    'followers',
    'totalFollowers',
    'total_followers',
  ]);
  const followingCount = getCountValue(user, [
    'followingCount',
    'following',
    'totalFollowing',
    'total_following',
  ]);

  useEffect(() => {
    if (followersCount > 0) setFollowersCountState(followersCount);
  }, [followersCount]);

  useEffect(() => {
    if (followingCount > 0) setFollowingCountState(followingCount);
  }, [followingCount]);

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
        message.error('Không tìm thấy ID người dùng');
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
      message.error('Không tìm thấy ID người dùng');
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
      message.error('Không tìm thấy ID người dùng');
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
        message.error('Không tìm thấy ID người dùng');
        return;
      }
      console.log('💬 Creating direct chat with userId:', userId);
      console.log('👤 User object:', user);

      const res = await chatApi.createDirect(userId);
      console.log('✅ Chat response status:', res.status);
      console.log('📦 Chat response data:', res.data);
      console.log('📦 Full response:', res);

      // Handle multiple possible response formats
      let conversationId = null;
      if (res.data?.data?.id) {
        conversationId = res.data.data.id;
      } else if (res.data?.id) {
        conversationId = res.data.id;
      } else if (res.data?.conversationId) {
        conversationId = res.data.conversationId;
      } else if (res.data?.data?.conversationId) {
        conversationId = res.data.data.conversationId;
      } else if (typeof res.data === 'string') {
        conversationId = res.data;
      } else if (typeof res.data === 'object' && Object.keys(res.data).length > 0) {
        // Try to find any ID-like property
        const keys = Object.keys(res.data);
        console.log('Available keys in response:', keys);
        const idKey = keys.find(
          (k) => k.toLowerCase().includes('id') || k.toLowerCase().includes('conversation')
        );
        if (idKey) {
          conversationId = res.data[idKey];
          console.log('Found ID using key:', idKey, 'Value:', conversationId);
        }
      }

      if (!conversationId) {
        console.error('❌ No conversation ID extracted from response:', res.data);
        message.error('Không thể tạo cuộc trò chuyện - không có ID');
        return;
      }

      console.log('✨ Navigating to conversation:', conversationId);
      navigate(`/customer/message/${conversationId}`, { state: { user } });
    } catch (err) {
      console.error('❌ Failed to start chat:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      // Show more detailed error message
      const errorMsg = err.response?.data?.message || err.message || 'Không thể mở cuộc trò chuyện';
      message.error(errorMsg);
    }
  };

  return (
    <div className="bg-[radial-gradient(circle_at_15%_20%,#263328_0%,#0a0a0a_48%,#000_100%)] rounded-3xl p-6 border border-white/10 mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-black ring-2 ring-[#d2fb05]/20 group-hover:ring-[#d2fb05]/50 transition-all shadow-2xl flex-shrink-0">
            <img
              src={
                user.avatarUrl ||
                user.avatar ||
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop'
              }
              alt={user.fullName || user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight text-ellipsis overflow-hidden whitespace-nowrap">
              {user.fullName || user.name || 'Người dùng'}
            </h2>
            <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">
              @{user.username || user.email?.split('@')[0] || 'thanhvien'}
            </p>
          </div>

          <div className="flex justify-center md:justify-start gap-8 py-2 border-y border-white/5">
            <Stat label="Thói quen" value={routineCount} />
            <Stat label="Người theo dõi" value={followersCountState} />
            <Stat label="Đang theo dõi" value={followingCountState} />
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto md:mx-0">
            {user.bio || 'Chưa có mô tả. Hãy cùng xây dựng thói quen! 🚀'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {isMe ? (
              <div className="flex flex-wrap gap-3 w-full">
                <button
                  onClick={() => {
                    if (typeof onEditProfile === 'function') {
                      onEditProfile();
                      return;
                    }
                    navigate('/profile');
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
                >
                  <Edit3 size={16} />
                  Chỉnh sửa hồ sơ
                </button>
                <button
                  onClick={() => navigate('/customer/users/search')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-900 text-white border border-white/10 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-neutral-800 transition-all active:scale-95 shadow-lg"
                >
                  <Search size={16} />
                  Tìm người dùng
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading || isBlocked}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold px-8 py-2.5 rounded-full text-sm transition-all active:scale-95 shadow-lg ${
                    isBlocked
                      ? 'bg-zinc-800/60 text-zinc-500 border border-white/10 cursor-not-allowed'
                      : isFollowing
                        ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700'
                        : 'bg-[#d2fb05] text-black hover:bg-[#bce304]'
                  }`}
                >
                  {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
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
                    {friendStatus === 'friend'
                      ? 'Hủy kết bạn'
                      : friendStatus === 'outgoing'
                        ? 'Đã gửi lời mời'
                        : 'Kết bạn'}
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
    <span className="text-lg font-black text-white group-hover:text-[#d2fb05] transition-colors">
      {value}
    </span>
    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{label}</span>
  </div>
);
