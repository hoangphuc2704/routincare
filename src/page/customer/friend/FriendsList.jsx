import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import friendApi from '../../../api/friendApi';
import userApi from '../../../api/userApi';
import chatApi from '../../../api/chatApi';
import BottomNav from '../../../components/BottomNav';
import { ChevronLeft, UserMinus, MessageCircle, Search } from 'lucide-react';
import { message } from 'antd';

// Helper function to extract user ID from various field names
const getFriendId = (friend) => {
  return (
    friend?.id || friend?.userId || friend?.friendId || friend?.targetUserId || friend?.user?.id
  );
};

const getFriendName = (friend) => {
  return friend?.fullName || friend?.name || 'User';
};

const getFriendAvatar = (friend) => {
  return (
    friend?.avatarUrl ||
    friend?.avatar ||
    `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`
  );
};

export default function FriendsList() {
  const navigate = useNavigate();
  const [friendsList, setFriendsList] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingFriendId, setRemovingFriendId] = useState(null);
  const [messagingUserId, setMessagingUserId] = useState(null);

  useEffect(() => {
    fetchFriendsList();

    // Listen for window focus to refresh
    const handleFocus = () => {
      fetchFriendsList();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
      if (friends.length > 0) {
        console.log('🔍 Friend object structure:', friends[0]);
        console.log('🔍 Extracted friend ID:', getFriendId(friends[0]));
      }
      setFriendsList(friends);
      setFilteredFriends(friends);
    } catch (err) {
      console.error('❌ Failed to fetch friends list:', err);
      message.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFriends(friendsList);
    } else {
      const filtered = friendsList.filter((friend) => {
        const fullName = getFriendName(friend);
        const username = friend.username || '';
        const queryLower = query.toLowerCase();
        return (
          fullName.toLowerCase().includes(queryLower) || username.toLowerCase().includes(queryLower)
        );
      });
      setFilteredFriends(filtered);
    }
  };

  const handleUnfriend = async (userId) => {
    try {
      setRemovingFriendId(userId);
      await friendApi.unfriend(userId);
      message.success('Đã xóa bạn bè');
      setFriendsList((prev) => prev.filter((f) => getFriendId(f) !== userId));
      setFilteredFriends((prev) => prev.filter((f) => getFriendId(f) !== userId));
    } catch (err) {
      console.error('❌ Failed to unfriend:', err);
      message.error('Không thể xóa bạn bè');
    } finally {
      setRemovingFriendId(null);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = async (userId) => {
    try {
      setMessagingUserId(userId);
      // Create or get direct conversation with this user
      const res = await chatApi.createDirect(userId);
      const conversationId = res.data?.data?.id || res.data?.id || res.data;

      if (conversationId) {
        navigate(`/customer/message/${conversationId}`);
      } else {
        message.error('Không thể tạo cuộc trò chuyện');
      }
    } catch (err) {
      console.error('❌ Failed to create conversation:', err);
      message.error('Không thể mở cuộc trò chuyện');
    } finally {
      setMessagingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:ml-[86px]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#101010]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Danh sách bạn bè</h1>
          <div className="text-sm text-white/60">{filteredFriends.length} bạn</div>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Tìm bạn bè..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Đang tải...</div>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-3 text-white/40">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm3-9h4m-2-2v4"
              />
            </svg>
          </div>
          <p className="text-white/70 font-medium">
            {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
          </p>
          <p className="text-white/40 text-sm mt-1">
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tìm và kết bạn với mọi người'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {filteredFriends.map((friend) => {
            const friendId = getFriendId(friend);
            const friendName = getFriendName(friend);
            const friendAvatar = getFriendAvatar(friend);

            return (
              <button
                key={friendId}
                type="button"
                onClick={() => handleViewProfile(friendId)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group text-left"
              >
                {/* Avatar */}
                <img
                  src={friendAvatar}
                  alt={friendName}
                  className="w-14 h-14 rounded-full object-cover border border-white/20 hover:border-[#d2fb05] transition-all flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate hover:text-[#d2fb05] transition-colors">
                    {friendName}
                  </h3>
                  <p className="text-white/50 text-sm">
                    {friend.mutualFriendsCount || 0} bạn chung
                  </p>
                </div>

                {/* Menu Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const menuId = `menu-${friendId}`;
                    const menu = document.getElementById(menuId);
                    if (menu) {
                      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  title="Thêm tùy chọn"
                >
                  <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="6" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="18" cy="12" r="2" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  id={`menu-${friendId}`}
                  className="absolute right-4 mt-0 hidden bg-[#151515] border border-white/10 rounded-lg shadow-xl z-50"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(friendId);
                      document.getElementById(`menu-${friendId}`).style.display = 'none';
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center gap-2 rounded-t-lg"
                  >
                    <MessageCircle className="w-4 h-4 text-[#d2fb05]" />
                    Nhắn tin
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfriend(friendId);
                      document.getElementById(`menu-${friendId}`).style.display = 'none';
                    }}
                    disabled={removingFriendId === friendId}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-white/10 transition-colors flex items-center gap-2 rounded-b-lg disabled:opacity-50"
                  >
                    <UserMinus className="w-4 h-4" />
                    Xóa bạn bè
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeItem="friends" />
    </div>
  );
}
