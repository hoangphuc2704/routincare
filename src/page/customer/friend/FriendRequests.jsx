import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import friendApi from '../../../api/friendApi';
import userApi from '../../../api/userApi';
import BottomNav from '../../../components/BottomNav';
import { ChevronLeft, UserPlus, Check, X, UserMinus } from 'lucide-react';
import { message } from 'antd';

export default function FriendRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'friends'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState({});
  const [loadingRemovals, setLoadingRemovals] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchIncomingRequests = async () => {
    try {
      setLoading(true);
      const res = await friendApi.getIncoming();

      // Debug: log response structure
      console.log('📊 Incoming requests response:', res);
      console.log('📊 Response data:', res.data);
      console.log('📊 Response data.data:', res.data?.data);

      // Handle multiple possible response formats from backend
      let requests = [];
      if (Array.isArray(res.data)) {
        requests = res.data; // Direct array
      } else if (Array.isArray(res.data?.data)) {
        requests = res.data.data; // Wrapped in data field
      } else if (res.data?.data) {
        requests = [res.data.data]; // Single item
      } else if (Array.isArray(res.data?.items)) {
        requests = res.data.items; // Alternative wrapper
      }

      console.log(`📊 Extracted ${requests.length} requests`);

      // Fetch user info for each request
      const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
          try {
            // Get sender info using requesterId from the request
            const requesterId = req.requesterId;
            console.log('👤 Processing request:', {
              requestId: req.requestId,
              requesterId,
              requesterName: req.requesterName,
            });

            if (requesterId) {
              try {
                const userRes = await userApi.getPublicProfile(requesterId);
                const userData = userRes.data?.data || userRes.data;
                return {
                  ...req,
                  sender: {
                    id: requesterId,
                    fullName: userData?.fullName || req.requesterName,
                    username: userData?.username,
                    avatarUrl: userData?.avatarUrl,
                    bio: userData?.bio,
                    email: userData?.email,
                  },
                };
              } catch (err) {
                // If profile fetch fails, use data we already have
                console.warn('⚠️ Failed to fetch detailed user info, using basic info:', err);
                return {
                  ...req,
                  sender: {
                    id: requesterId,
                    fullName: req.requesterName,
                    username: req.requesterName?.toLowerCase()?.replace(/\s+/g, '_'),
                    avatarUrl: null,
                    bio: null,
                  },
                };
              }
            }
            return req;
          } catch (err) {
            console.error('❌ Failed to process friend request:', err);
            return req;
          }
        })
      );

      console.log(`✅ Enriched ${enrichedRequests.length} requests`);
      setIncomingRequests(enrichedRequests);
    } catch (err) {
      console.error('❌ Failed to fetch incoming requests:', err);
      message.error('Không thể tải danh sách lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsList = async () => {
    try {
      setLoading(true);
      const res = await friendApi.getAll();

      console.log('📊 Friends list response:', res.data);

      // Handle multiple response formats
      let friends = [];
      if (Array.isArray(res.data)) {
        friends = res.data;
      } else if (Array.isArray(res.data?.data)) {
        friends = res.data.data;
      } else if (Array.isArray(res.data?.items)) {
        friends = res.data.items;
      }

      console.log(`✅ Loaded ${friends.length} friends`);
      setFriendsList(friends);
    } catch (err) {
      console.error('❌ Failed to fetch friends list:', err);
      message.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'requests') {
      fetchIncomingRequests();
    } else {
      fetchFriendsList();
    }

    // Add listener for when window regains focus - refetch data
    const handleFocus = () => {
      console.log('Window focused - refetching');
      if (activeTab === 'requests') {
        fetchIncomingRequests();
      } else {
        fetchFriendsList();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Also listen for friend request updates
    const handleFriendStatusChange = () => {
      setTimeout(() => {
        console.log('Friend status changed - refetching');
        if (activeTab === 'requests') {
          fetchIncomingRequests();
        } else {
          fetchFriendsList();
        }
      }, 300);
    };

    window.addEventListener('friendStatusChanged', handleFriendStatusChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('friendStatusChanged', handleFriendStatusChange);
    };
  }, [activeTab]);

  const handleAccept = async (requestId, index) => {
    try {
      setLoadingRequests((prev) => ({ ...prev, [requestId]: true }));

      console.log('🔄 Accepting friend request:', requestId);
      const acceptRes = await friendApi.acceptRequest(requestId);
      console.log('✅ Accept response:', acceptRes.data);

      message.success('Đã chấp nhận yêu cầu kết bạn');

      // Immediately remove from UI
      setIncomingRequests((prev) => prev.filter((_, i) => i !== index));

      // Broadcast event to update other components
      window.dispatchEvent(new Event('friendStatusChanged'));

      // Validate accept success by checking incoming requests
      setTimeout(async () => {
        try {
          console.log('🔄 Validating accept by fetching incoming requests...');
          const validationRes = await friendApi.getIncoming();
          console.log('📊 Validation response:', validationRes.data);

          let incomingList = [];
          if (Array.isArray(validationRes.data)) {
            incomingList = validationRes.data;
          } else if (Array.isArray(validationRes.data?.data)) {
            incomingList = validationRes.data.data;
          }

          const stillPending = incomingList.find((r) => r.requestId === requestId);
          if (stillPending) {
            console.warn(
              '⚠️ Request still in incoming list! Backend may not have updated:',
              stillPending
            );
            // Keep UI as is (already removed), but log this issue
          } else {
            console.log('✅ Request successfully removed from incoming by backend');
            // Refetch to ensure UI is in sync with backend
            await fetchIncomingRequests();
          }

          // Also fetch friends list to verify friendship was created
          const friendsRes = await friendApi.getAll();
          console.log(
            '📋 Friends list after accept:',
            friendsRes.data?.data || friendsRes.data || []
          );
        } catch (err) {
          console.error('❌ Validation failed:', err);
        }
      }, 300);
    } catch (err) {
      console.error('❌ Failed to accept request:', err);
      message.error('Không thể chấp nhận yêu cầu');
    } finally {
      setLoadingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId, index) => {
    try {
      setLoadingRequests((prev) => ({ ...prev, [requestId]: true }));

      console.log('🔄 Rejecting friend request:', requestId);
      const rejectRes = await friendApi.rejectRequest(requestId);
      console.log('✅ Reject response:', rejectRes.data);

      message.success('Đã từ chối yêu cầu kết bạn');

      // Immediately remove from UI
      setIncomingRequests((prev) => prev.filter((_, i) => i !== index));

      // Broadcast event to update other components
      window.dispatchEvent(new Event('friendStatusChanged'));

      // Validate reject success
      setTimeout(async () => {
        try {
          console.log('🔄 Validating reject by fetching incoming requests...');
          const validationRes = await friendApi.getIncoming();

          let incomingList = [];
          if (Array.isArray(validationRes.data)) {
            incomingList = validationRes.data;
          } else if (Array.isArray(validationRes.data?.data)) {
            incomingList = validationRes.data.data;
          }

          const stillPending = incomingList.find((r) => r.requestId === requestId);
          if (stillPending) {
            console.warn('⚠️ Request still in incoming list after reject!');
          } else {
            console.log('✅ Request successfully removed from incoming by backend');
            await fetchIncomingRequests();
          }
        } catch (err) {
          console.error('❌ Validation failed:', err);
        }
      }, 300);
    } catch (err) {
      console.error('❌ Failed to reject request:', err);
      message.error('Không thể từ chối yêu cầu');
    } finally {
      setLoadingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRemoveFriend = async (userId, index) => {
    try {
      setLoadingRemovals((prev) => ({ ...prev, [userId]: true }));
      await friendApi.unfriend(userId);
      message.success('Đã xóa bạn');

      // Remove from list
      setFriendsList((prev) => prev.filter((_, i) => i !== index));

      // Broadcast event
      window.dispatchEvent(new Event('friendStatusChanged'));
    } catch (err) {
      console.error('❌ Failed to remove friend:', err);
      message.error('Không thể xóa bạn');
    } finally {
      setLoadingRemovals((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#0f1119] to-[#0b0b0f] text-white font-sans relative pb-24">
      {/* Header */}
      <header className="md:max-w-md md:mx-auto px-4 pt-8 sticky top-0 z-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft size={26} />
            </button>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-lime-300/80">Friends</p>
              <h1 className="text-3xl font-semibold mt-1 leading-tight">
                {activeTab === 'requests' ? 'Lời mời kết bạn' : 'Danh sách bạn bè'}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {activeTab === 'requests'
                  ? `${incomingRequests.length} yêu cầu chờ xử lý`
                  : `${friendsList.length} bạn bè`}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'requests'
                  ? 'bg-lime-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Lời mời ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'friends'
                  ? 'bg-lime-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Bạn bè ({friendsList.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 mt-6 md:max-w-md md:mx-auto">
        {activeTab === 'requests' ? (
          // REQUESTS TAB
          <>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
              </div>
            ) : incomingRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {incomingRequests.map((req, index) => {
                  const sender = req.sender || {};
                  const requestId = req.requestId;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/60 hover:bg-white/10 transition-all"
                    >
                      {/* Avatar */}
                      <div
                        className="relative flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${sender.id || sender.userId}`)}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 hover:border-lime-400 transition-all active:scale-90 bg-lime-400/20 flex items-center justify-center">
                          {sender.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.fullName || 'user'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-lime-400">
                              {(sender.fullName || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {sender.fullName || 'Unknown User'}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">
                          @{sender.username || sender.email?.split('@')[0] || 'user'}
                        </p>
                        {sender.bio && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{sender.bio}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAccept(requestId, index)}
                          disabled={loadingRequests[requestId]}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-400 text-black hover:bg-lime-500 transition-all active:scale-90 disabled:opacity-50"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(requestId, index)}
                          disabled={loadingRequests[requestId]}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90 disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-3xl">
                <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
                  <UserPlus className="text-lime-300" size={24} />
                </div>
                <p className="text-lg font-semibold">Không có lời mời</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Bạn không có yêu cầu kết bạn nào từ những người khác
                </p>
              </div>
            )}
          </>
        ) : (
          // FRIENDS TAB
          <>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
              </div>
            ) : friendsList.length > 0 ? (
              <div className="flex flex-col gap-3">
                {friendsList.map((friend, index) => {
                  const friendId = friend.userId;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/60 hover:bg-white/10 transition-all"
                    >
                      {/* Avatar */}
                      <div
                        className="relative flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${friendId}`)}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 hover:border-lime-400 transition-all active:scale-90 bg-lime-400/20 flex items-center justify-center">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.fullName || 'user'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-lime-400">
                              {(friend.fullName || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {friend.fullName || 'Unknown User'}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Bạn từ{' '}
                          {friend.friendsSince
                            ? new Date(friend.friendsSince).toLocaleDateString('vi-VN')
                            : 'n/a'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRemoveFriend(friendId, index)}
                          disabled={loadingRemovals[friendId]}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all active:scale-90 disabled:opacity-50"
                          title="Remove friend"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-3xl">
                <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
                  <UserPlus className="text-lime-300" size={24} />
                </div>
                <p className="text-lg font-semibold">Chưa có bạn bè</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Hãy gửi lời mời kết bạn để bắt đầu kết nối với các bạn
                </p>
                <button
                  onClick={() => navigate('/customer/users/search')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-semibold shadow-lg active:scale-95 transition-all"
                >
                  <UserPlus size={16} />
                  Tìm bạn
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav activeItem="requests" />
    </div>
  );
}
