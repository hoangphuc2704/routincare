import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../../../contexts/ChatContext';
import chatApi from '../../../services/api/chatApi';
import userApi from '../../../services/api/userApi';
import {
  ChevronLeft,
  Send,
  MoreVertical,
  Image,
  Smile,
  Phone,
  Video,
  ShieldCheck,
  Dot,
} from 'lucide-react';
import { message as antdMessage } from 'antd';

export default function ChatDetail() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const conversation = state?.conversation || { title: 'User' };
  const stateOtherUser = state?.user || state?.partner || {};

  const {
    messages,
    loadingMessages,
    loadMessages,
    sendMessage,
    setActiveConversationId,
    getCurrentUserId,
  } = useChat();

  const currentUserId = getCurrentUserId();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);
  const [fetchedOtherUser, setFetchedOtherUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const displayUser = fetchedOtherUser || stateOtherUser;

  // Fetch participant data if not available in state
  useEffect(() => {
    if (stateOtherUser?.id || stateOtherUser?.userId) {
      // User data already available from state
      return;
    }

    const fetchParticipant = async () => {
      try {
        setLoadingUser(true);
        const myId = getCurrentUserId();
        if (!myId || !conversationId) return;

        // Get messages to find the other participant ID
        const messagesRes = await chatApi.getMessages(conversationId);
        const msgs = messagesRes.data?.data || messagesRes.data || [];

        let otherUserId = null;
        if (msgs && msgs.length > 0) {
          for (const msg of msgs) {
            const senderId = msg.senderId || msg.SenderId;
            if (senderId && senderId !== myId) {
              otherUserId = senderId;
              break;
            }
          }
        }

        if (otherUserId) {
          const userRes = await userApi.getPublicProfile(otherUserId);
          const userData = userRes.data?.data || userRes.data;
          if (userData) {
            setFetchedOtherUser(userData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch participant data:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchParticipant();
  }, [conversationId, currentUserId, stateOtherUser?.id, stateOtherUser?.userId, getCurrentUserId]);

  // Set active conversation for SignalR group + load messages
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      loadMessages(conversationId);
    }

    return () => {
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId, loadMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Filter messages for this conversation only
  const conversationMessages = messages.filter((msg) => msg.ConversationId === conversationId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const body = inputValue;
    setInputValue('');

    try {
      await sendMessage(conversationId, body);
    } catch (err) {
      console.error('❌ Send message error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Gửi tin nhắn thất bại';

      // Check for network errors
      if (
        err.message === 'Network Error' ||
        err.code === 'NETWORK_ERROR' ||
        err.code === 'ERR_CONNECTION_REFUSED'
      ) {
        antdMessage.error('Kết nối thất bại. Vui lòng kiểm tra internet hoặc thử lại sau.');
      } else {
        antdMessage.error(errorMsg);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0b0b0f] via-[#0f1119] to-[#0b0b0f] text-white font-sans max-w-lg mx-auto border-x border-white/5">
      {/* Header */}
      <header className="p-4 pb-3 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft size={26} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 px-2 py-1 rounded-2xl transition-all active:scale-95">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-white/15 group-hover:border-lime-400 transition-all bg-lime-400/20 flex items-center justify-center overflow-hidden">
                {displayUser?.avatarUrl ? (
                  <img
                    src={displayUser?.avatarUrl}
                    alt={displayUser?.fullName || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-lime-400">
                    {(displayUser?.fullName ||
                      conversation.title ||
                      'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-lime-400 transition-all flex items-center gap-1">
                  {loadingUser ? (
                    <span className="text-xs text-zinc-400">Đang tải...</span>
                  ) : (
                    <>
                      {displayUser?.fullName ||
                        conversation.title ||
                        'Nguoi dung'}
                      <ShieldCheck size={14} className="text-lime-300" />
                    </>
                  )}
                </h3>
                <span className="text-[11px] text-lime-300/80 flex items-center gap-1">
                  <Dot size={16} className="-ml-1" /> Active now
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <button className="hover:text-white transition-colors">
            <Phone size={20} />
          </button>
          <button className="hover:text-white transition-colors">
            <Video size={22} />
          </button>
          <button className="hover:text-white transition-colors">
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/2 to-transparent scrollbar-hide flex flex-col pt-6"
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
          </div>
        ) : conversationMessages.length > 0 ? (
          conversationMessages.map((msg) => {
            const isMe = msg.SenderId === currentUserId;
            // Use stable clientMessageId as key instead of MessageId which may change
            const messageKey = msg.ClientMessageId || msg.MessageId;
            return (
              <div
                key={messageKey}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-lg shadow-black/30 border border-white/5 ${
                    isMe
                      ? 'bg-lime-400 text-black font-semibold rounded-br-none'
                      : 'bg-white/5 text-white rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.Body}</p>
                  <span
                    className={`text-[10px] mt-1 block opacity-70 ${isMe ? 'text-black text-right' : 'text-zinc-300'}`}
                  >
                    {new Date(msg.CreatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm bg-white/5 border border-white/10 rounded-2xl">
            <p className="font-semibold text-white">Chua co tin nhan</p>
            <p className="text-xs text-zinc-400 mt-1">Hay gui tin nhan dau tien.</p>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md sticky bottom-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400 px-1">
            <button type="button" className="hover:text-white">
              <Smile size={22} />
            </button>
            <button type="button" className="hover:text-white">
              <Image size={22} />
            </button>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-5 text-sm outline-none focus:ring-1 focus:ring-lime-400 transition-all placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
              inputValue.trim()
                ? 'bg-lime-400 text-black active:scale-90 scale-100'
                : 'bg-zinc-800 text-zinc-500 scale-95'
            }`}
          >
            <Send size={18} className={inputValue.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </form>
      </footer>
    </div>
  );
}
