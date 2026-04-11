import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import chatApi from '../api/chatApi';
import signalRService from '../service/signalRService';
import { getAccessToken } from '../utils/tokenService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const prevConversationIdRef = useRef(null);

  const getCurrentUserId = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))?.userId || null;
    } catch {
      return null;
    }
  }, []);

  // ─── Connect SignalR on mount ───
  useEffect(() => {
    const token = getAccessToken();
    if (!token || !getCurrentUserId()) return;

    signalRService.connect().catch(console.error);

    signalRService.on('chat:message-created', handleMessageCreated);
    signalRService.on('chat:conversation-upsert', handleConversationUpsert);
    signalRService.on('chat:conversation-read', handleConversationRead);
    signalRService.on('chat:message-deleted', handleMessageDeleted);

    return () => {
      signalRService.removeAllListeners('chat:message-created');
      signalRService.removeAllListeners('chat:conversation-upsert');
      signalRService.removeAllListeners('chat:conversation-read');
      signalRService.removeAllListeners('chat:message-deleted');
      signalRService.disconnect();
    };
  }, []);

  // ─── Real-time handlers ───

  const handleMessageCreated = useCallback((message) => {
    console.log('📩 Real-time message:', message);

    setMessages((prev) => {
      if (prev.some((m) => m.MessageId === message.messageId)) return prev;
      return [
        ...prev,
        {
          MessageId: message.messageId,
          ConversationId: message.conversationId,
          SenderId: message.senderId,
          Type: message.type,
          Body: message.body,
          CreatedAt: message.createdAt,
        },
      ];
    });

    setConversations((prev) =>
      prev
        .map((c) =>
          c.conversationId === message.conversationId
            ? { ...c, lastMessageAt: message.createdAt, _lastBody: message.body }
            : c
        )
        .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
    );
  }, []);

  const handleConversationUpsert = useCallback((conv) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.conversationId === conv.conversationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...conv };
        return updated;
      }
      return [conv, ...prev];
    });
  }, []);

  const handleConversationRead = useCallback(() => {}, []);

  const handleMessageDeleted = useCallback((payload) => {
    setMessages((prev) => prev.filter((m) => m.MessageId !== payload.messageId));
  }, []);

  // ─── Join/Leave conversation groups ───
  useEffect(() => {
    const handleGroupJoin = async () => {
      const prevId = prevConversationIdRef.current;
      if (prevId && prevId !== activeConversationId) {
        console.log(`👋 Leaving conversation group: ${prevId}`);
        try {
          await signalRService.leaveConversation(prevId);
        } catch (err) {
          console.error(`Failed to leave conversation ${prevId}:`, err);
        }
      }
      if (activeConversationId) {
        console.log(`🔗 Joining conversation group: ${activeConversationId}`);
        try {
          await signalRService.joinConversation(activeConversationId);
          console.log(`✅ Successfully joined conversation group: ${activeConversationId}`);
        } catch (err) {
          console.error(`Failed to join conversation ${activeConversationId}:`, err);
        }
      }
      prevConversationIdRef.current = activeConversationId;
    };

    handleGroupJoin();
  }, [activeConversationId]);

  // ─── API actions ───

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await chatApi.getConversations();
      setConversations(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const res = await chatApi.getMessages(conversationId);
      const data = res.data?.data || res.data || [];
      const normalized = (Array.isArray(data) ? data : [])
        .map((msg) => ({
          MessageId: msg.messageId || msg.id,
          ConversationId: msg.conversationId,
          SenderId: msg.senderId,
          Type: msg.type,
          Body: msg.body,
          CreatedAt: msg.createdAt,
        }))
        .sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
      setMessages(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId, body) => {
      const userId = getCurrentUserId();
      if (!conversationId || !body?.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        MessageId: tempId,
        ConversationId: conversationId,
        SenderId: userId,
        Type: 'Text',
        Body: body,
        CreatedAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await chatApi.sendMessage(conversationId, body);
        const sent = res.data?.data || res.data;
        if (sent?.messageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.MessageId === tempId
                ? {
                    MessageId: sent.messageId,
                    ConversationId: sent.conversationId,
                    SenderId: sent.senderId,
                    Type: sent.type,
                    Body: sent.body,
                    CreatedAt: sent.createdAt,
                  }
                : m
            )
          );
        }
        return sent;
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.MessageId !== tempId));
        throw err;
      }
    },
    [getCurrentUserId]
  );

  const value = {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    getCurrentUserId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
