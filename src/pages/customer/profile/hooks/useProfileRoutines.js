import { useEffect, useState } from 'react';
import { message } from 'antd';
import routineApi from '../../../../services/api/routineApi';
import userApi from '../../../../services/api/userApi';

const toNormalizedId = (value) => String(value ?? '').trim().toLowerCase();

const extractRoutineList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const candidates = [
    payload.items,
    payload.records,
    payload.results,
    payload.$values,
    payload.data,
    payload.routines,
    payload.publicRoutines,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = extractRoutineList(candidate);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};

const getRoutineOwnerId = (item) =>
  item?.userId ||
  item?.ownerId ||
  item?.createdBy ||
  item?.creatorId ||
  item?.user?.id ||
  item?.user?.userId;

const mapRoutineCard = (item) => ({
  id: item.id || item.routineId,
  title: item.title || item.name || 'Untitled routine',
  description: item.description,
  repeatType: item.repeatType,
  repeatDays: item.repeatDays,
  visibility: item.visibility,
  categoryName: item.category?.name || item.categoryName,
  remindTime: item.remindTime,
  taskCount:
    item.tasks?.length ??
    item.tasks?.$values?.length ??
    item.routineTasks?.length ??
    item.routineTasks?.$values?.length ??
    item.taskCount ??
    item.totalTasks ??
    0,
});

export default function useProfileRoutines({ activeTab, isMe, userId, profile }) {
  const [routines, setRoutines] = useState([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      if (activeTab !== 'routines') return;
      try {
        setRoutinesLoading(true);
        let data = [];

        if (isMe) {
          const res = await routineApi.getMyRoutines();
          const raw = res.data?.data || res.data;
          const myRoutineCandidates = extractRoutineList(raw);

          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const myId = storedUser?.userId || storedUser?.id || profile?.userId || profile?.id;

          data = (Array.isArray(myRoutineCandidates) ? myRoutineCandidates : []).filter((item) => {
            if (!myId) return true;
            const ownerId = getRoutineOwnerId(item);
            return !ownerId || toNormalizedId(ownerId) === toNormalizedId(myId);
          });
        } else if (userId) {
          try {
            const res = await routineApi.getPublicByUser(userId);
            const raw = res.data?.data || res.data;
            data = extractRoutineList(raw);
          } catch (err) {
            console.warn('getPublicByUser not available:', err);
          }

          if (data.length === 0) {
            try {
              const profileRes = await userApi.getPublicProfile(userId);
              const profileData = profileRes.data?.data || profileRes.data || {};
              data = extractRoutineList(profileData);
            } catch (err) {
              console.warn('Public profile routines not available:', err);
            }
          }

          if (data.length === 0) {
            try {
              const searchRes = await routineApi.searchPublic({ userId, pageSize: 100 });
              const searchData = searchRes.data?.data || searchRes.data;
              const candidates = extractRoutineList(searchData);
              data = (Array.isArray(candidates) ? candidates : []).filter((item) => {
                const ownerId = getRoutineOwnerId(item);
                return ownerId && toNormalizedId(ownerId) === toNormalizedId(userId);
              });
            } catch (err) {
              console.warn('Search public routines fallback failed:', err);
            }
          }
        }

        setRoutines((data || []).map(mapRoutineCard));
      } catch (err) {
        console.error('Failed to fetch routines:', err);
        if (isMe) message.error('Không tải được danh sách routine');
      } finally {
        setRoutinesLoading(false);
      }
    };

    fetchRoutines();
  }, [activeTab, isMe, profile, userId]);

  return { routines, routinesLoading };
}
