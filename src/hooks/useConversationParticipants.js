import { useState, useEffect, useCallback } from 'react';
import chatApi from '../services/api/chatApi';
import userApi from '../services/api/userApi';

/**
 * Hook to fetch and cache participant data for conversations
 * Returns a map of conversationId -> { user: UserData, loading: boolean, error: string|null }
 */
export const useConversationParticipants = (conversations = []) => {
  const [participantsMap, setParticipantsMap] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);

  const getCurrentUserId = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))?.userId;
    } catch {
      return null;
    }
  }, []);

  const getOtherParticipantIdFromMessages = useCallback(
    async (conversationId) => {
      try {
        const currentUserId = getCurrentUserId();
        const messagesRes = await chatApi.getMessages(conversationId);
        const messages = messagesRes.data?.data || messagesRes.data || [];

        if (!messages || messages.length === 0) return null;

        for (const msg of messages) {
          const senderId = msg.senderId || msg.SenderId;
          if (senderId && senderId !== currentUserId) {
            return senderId;
          }
        }
        return null;
      } catch (err) {
        console.error(`Failed to get messages for conversation ${conversationId}:`, err);
        return null;
      }
    },
    [getCurrentUserId]
  );

  const fetchParticipantData = useCallback(
    async (conversationId) => {
      // Check if already cached
      if (participantsMap[conversationId]) {
        return participantsMap[conversationId];
      }

      try {
        // Get other participant ID from messages
        const otherUserId = await getOtherParticipantIdFromMessages(conversationId);

        if (!otherUserId) {
          setParticipantsMap((prev) => ({
            ...prev,
            [conversationId]: { user: null, loading: false, error: 'No other participant found' },
          }));
          return null;
        }

        // Fetch user profile
        const userRes = await userApi.getPublicProfile(otherUserId);
        const userData = userRes.data?.data || userRes.data;

        setParticipantsMap((prev) => ({
          ...prev,
          [conversationId]: { user: userData, loading: false, error: null },
        }));

        return userData;
      } catch (err) {
        console.error(`Failed to fetch participant for conversation ${conversationId}:`, err);
        setParticipantsMap((prev) => ({
          ...prev,
          [conversationId]: { user: null, loading: false, error: err.message },
        }));
        return null;
      }
    },
    [participantsMap, getOtherParticipantIdFromMessages]
  );

  // Fetch all participants when conversations list changes
  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      setLoadingAll(false);
      return;
    }

    const fetchAll = async () => {
      setLoadingAll(true);

      // Create a map to track which conversations still need data
      const idsToFetch = conversations
        .filter((conv) => !participantsMap[conv.conversationId])
        .map((conv) => conv.conversationId);

      if (idsToFetch.length === 0) {
        setLoadingAll(false);
        return;
      }

      // Fetch all participants in parallel
      try {
        const currentUserId = getCurrentUserId();

        // Get all messages for all conversations to find other participant IDs
        const messagePromises = idsToFetch.map((convId) =>
          chatApi
            .getMessages(convId)
            .then((res) => {
              const messages = res.data?.data || res.data || [];
              let otherUserId = null;

              if (messages && messages.length > 0) {
                for (const msg of messages) {
                  const senderId = msg.senderId || msg.SenderId;
                  if (senderId && senderId !== currentUserId) {
                    otherUserId = senderId;
                    break;
                  }
                }
              }

              return { conversationId: convId, otherUserId };
            })
            .catch((err) => {
              console.error(`Failed to get messages for ${convId}:`, err);
              return { conversationId: convId, otherUserId: null };
            })
        );

        const participantIds = await Promise.all(messagePromises);

        // Filter out null otherUserIds and get unique ones
        const uniqueUserIds = Array.from(
          new Set(participantIds.filter((p) => p.otherUserId).map((p) => p.otherUserId))
        );

        // Fetch all user profiles in parallel
        const userPromises = uniqueUserIds.map((userId) =>
          userApi
            .getPublicProfile(userId)
            .then((res) => ({
              userId,
              data: res.data?.data || res.data,
              error: null,
            }))
            .catch((err) => ({
              userId,
              data: null,
              error: err.message,
            }))
        );

        const userDataList = await Promise.all(userPromises);

        // Create a map of userId -> userData
        const userDataMap = {};
        userDataList.forEach((item) => {
          userDataMap[item.userId] = { data: item.data, error: item.error };
        });

        // Update state with all participant data
        setParticipantsMap((prev) => {
          const updated = { ...prev };

          participantIds.forEach((item) => {
            const userData = userDataMap[item.otherUserId];
            updated[item.conversationId] = {
              user: userData?.data || null,
              loading: false,
              error: userData?.error || null,
            };
          });

          return updated;
        });
      } catch (err) {
        console.error('Failed to fetch all participants:', err);
      }

      setLoadingAll(false);
    };

    fetchAll();
  }, [conversations, participantsMap, getCurrentUserId]);

  return {
    participantsMap,
    loadingAll,
    fetchParticipantData, // For manual fetching if needed
  };
};
