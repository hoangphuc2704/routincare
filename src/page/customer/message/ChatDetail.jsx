import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import chatApi from '../../../api/chatApi';
import { ChevronLeft, Send, MoreVertical, Image, Smile, Phone, Video } from 'lucide-react';
import { message } from 'antd';

export default function ChatDetail() {
    const { id: conversationId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const partner = state?.partner || { fullName: 'User', avatarUrl: '' };

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await chatApi.getMessages(conversationId);
                const data = res.data?.data || res.data;
                setMessages(data || []);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                // message.error('Failed to load chat history');
            } finally {
                setLoading(false);
            }
        };

        if (conversationId && conversationId !== 'conv-1' && conversationId !== 'conv-2') {
            fetchMessages();
        } else {
             // Mock messages for direct demo
            setMessages([
                { id: 1, senderId: 'user-2', content: 'Chào ông!', createdAt: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, senderId: 'me', content: 'Hello! Sao rùi?', createdAt: new Date(Date.now() - 1800000).toISOString() },
                { id: 3, senderId: 'user-2', content: 'Ông đi gym chiều nay không?', createdAt: new Date(Date.now() - 900000).toISOString() },
                { id: 4, senderId: 'me', content: 'Có chứ, lúc nào đi ông?', createdAt: new Date(Date.now() - 600000).toISOString() },
                { id: 5, senderId: 'user-2', content: 'Tầm 5h nhé. Nhớ cầm theo tạ tay.', createdAt: new Date(Date.now() - 300000).toISOString() },
                { id: 6, senderId: 'me', content: 'Ok ông nhé, chiều mai gym.', createdAt: new Date().toISOString() },
            ]);
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            content: inputValue,
            senderId: 'me',
            createdAt: new Date().toISOString(),
        };

        setMessages([...messages, newMessage]);
        setInputValue('');

        try {
            if (conversationId && conversationId !== 'conv-1' && conversationId !== 'conv-2') {
                await chatApi.sendMessage(conversationId, { content: inputValue });
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            message.error('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans max-w-lg mx-auto border-x border-white/10">
            {/* Header */}
            <header className="p-4 flex items-center justify-between bg-zinc-900 border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-all">
                        <ChevronLeft size={28} />
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 px-2 py-1 rounded-2xl transition-all active:scale-95"
                        onClick={() => navigate(`/profile/${partner.id || partner.userId}`)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-lime-400 transition-all">
                                <img
                                    src={partner.avatarUrl || partner.avatar || 'https://via.placeholder.com/150'}
                                    alt={partner.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm group-hover:text-lime-400 transition-all">{partner.fullName}</h3>
                                <span className="text-[10px] text-lime-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span> Active now
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <button className="hover:text-white transition-colors"><Phone size={20} /></button>
                    <button className="hover:text-white transition-colors"><Video size={22} /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical size={22} /></button>
                </div>
            </header>

            {/* Chat Area */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-black scrollbar-hide flex flex-col pt-6"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === 'me' || msg.senderId === JSON.parse(localStorage.getItem('user'))?.userId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                        isMe
                                            ? 'bg-lime-400 text-black font-semibold rounded-br-none'
                                            : 'bg-zinc-800 text-white rounded-bl-none'
                                    }`}
                                >
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <span className={`text-[9px] mt-1 block opacity-60 ${isMe ? 'text-black text-right' : 'text-zinc-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-zinc-900 border-t border-white/5 sticky bottom-0">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-3"
                >
                    <div className="flex items-center gap-2 text-zinc-400 px-1">
                        <button type="button" className="hover:text-white"><Smile size={22} /></button>
                        <button type="button" className="hover:text-white"><Image size={22} /></button>
                    </div>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-full py-3 px-5 text-sm outline-none focus:ring-1 focus:ring-lime-400 transition-all placeholder:text-zinc-600"
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
