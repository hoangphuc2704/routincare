import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import chatApi from '../../../api/chatApi';
import BottomNav from '../../../components/BottomNav';
import { Search, ChevronLeft, Plus, MessageSquare } from 'lucide-react';

export default function MessagePage() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await chatApi.getConversations();
                const data = res.data?.data || res.data;
                setConversations(data || []);
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#0f1119] to-[#0b0b0f] text-white font-sans relative pb-24">
            {/* Hero Header */}
            <header className="md:max-w-md md:mx-auto px-4 pt-8">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                    <div className="flex items-start justify-between gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft size={26} />
                        </button>
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-lime-300/80">Direct chat</p>
                            <h1 className="text-3xl font-semibold mt-1 leading-tight">Messages</h1>
                            <p className="text-sm text-zinc-400 mt-1">Nói chuyện với bạn bè và huấn luyện viên.</p>
                        </div>
                        <button
                            onClick={() => navigate('/customer/users/search')}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-lime-400 text-black font-semibold shadow-lg active:scale-95 transition-all"
                        >
                            <Plus size={18} />
                            New
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-4 mt-6 md:max-w-md md:mx-auto">
                <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <Search size={18} className="text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Tìm hội thoại"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
                        onClick={() => navigate('/customer/users/search')}
                        readOnly
                    />
                    <MessageSquare size={18} className="text-zinc-500" />
                </div>

                <div className="flex flex-col gap-3">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const partner = conv.partner || {};
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => navigate(`/customer/message/${conv.id}`, { state: { partner } })}
                                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/60 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.8)]"
                                >
                                    <div 
                                        className="relative flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${partner.id || partner.userId}`);
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 hover:border-lime-400 transition-all active:scale-90">
                                            <img
                                                src={partner.avatarUrl || partner.avatar || 'https://via.placeholder.com/150'}
                                                alt={partner.fullName || 'user-avatar'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-lime-400 rounded-full flex items-center justify-center border-2 border-[#0b0b0f]">
                                                <span className="text-[10px] font-bold text-black">{conv.unreadCount}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-base truncate">{partner.fullName || 'Nguoi dung'}</h3>
                                            <span className="text-xs text-zinc-500">
                                                {conv.lastMessage?.createdAt
                                                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ''}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {!loading && conversations.length === 0 && (
                        <div className="text-center py-14 px-6 bg-white/5 border border-white/10 rounded-3xl">
                            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
                                <MessageSquare className="text-lime-300" size={24} />
                            </div>
                            <p className="text-lg font-semibold">Chua co tin nhan</p>
                            <p className="text-sm text-zinc-500 mt-1">Bat dau ket ban va tao cuoc tro chuyen moi.</p>
                            <button
                                onClick={() => navigate('/customer/users/search')}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-semibold shadow-lg active:scale-95 transition-all"
                            >
                                <Plus size={16} />
                                Tim ban be
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <BottomNav activeItem="message" />
        </div>
    );
}
