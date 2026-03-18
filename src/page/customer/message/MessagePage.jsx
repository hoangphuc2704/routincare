import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import chatApi from '../../../api/chatApi';
import BottomNav from '../../../components/BottomNav';
import { Search, ChevronLeft } from 'lucide-react';

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

    const mockConversations = [
        {
            id: 'conv-1',
            partner: {
                id: 'user-2',
                fullName: 'Minh Hoàng',
                avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
            },
            lastMessage: {
                content: 'Ok ông nhé, chiều mai gym.',
                createdAt: new Date().toISOString(),
                isRead: false,
            },
            unreadCount: 2,
        },
        {
            id: 'conv-2',
            partner: {
                id: 'user-3',
                fullName: 'Nguyễn Anh',
                avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
            },
            lastMessage: {
                content: 'Hôm nay tui bận rồi.',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                isRead: true,
            },
            unreadCount: 0,
        }
    ];

    const displayConversations = conversations.length > 0 ? conversations : mockConversations;

    return (
        <div className="min-h-screen bg-black text-white font-sans relative pb-24">
            {/* Header */}
            <header className="p-4 md:max-w-md md:mx-auto pt-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-bold">Messages</h1>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Search size={24} />
                </button>
            </header>

            <main className="px-4 mt-6 md:max-w-md md:mx-auto">
                <div className="flex flex-col gap-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
                        </div>
                    ) : (
                        displayConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => navigate(`/customer/message/${conv.id}`, { state: { partner: conv.partner } })}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <div 
                                    className="relative flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/profile/${conv.partner.id || conv.partner.userId}`);
                                    }}
                                >
                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 hover:border-lime-400 transition-all active:scale-90">
                                        <img
                                            src={conv.partner.avatarUrl || conv.partner.avatar || 'https://via.placeholder.com/150'}
                                            alt={conv.partner.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center border-2 border-black">
                                            <span className="text-[10px] font-bold text-black">{conv.unreadCount}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-base truncate">{conv.partner.fullName}</h3>
                                        <span className="text-xs text-zinc-500">
                                            {new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {!loading && displayConversations.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-lg">No messages yet</p>
                            <p className="text-sm">Connect with friends to start chatting!</p>
                        </div>
                    )}
                </div>
            </main>

            <BottomNav activeItem="message" />
        </div>
    );
}
