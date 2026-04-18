export const normalizeId = (value) => String(value ?? '').trim();

export const normalizeTaskStatus = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;

  const str = String(value || '').trim().toLowerCase();
  if (['completed', 'done', 'success'].includes(str)) return 1;
  if (['skipped', 'skip'].includes(str)) return 2;
  return 0;
};

export const normalizePrepareCategoryLabel = (value) => {
  const parsed = Number(value);
  if (parsed === 0) return 'Equipment';
  if (parsed === 1) return 'Accessory';
  if (parsed === 2) return 'Food';
  if (parsed === 3) return 'Other';

  const str = String(value || '').trim().toLowerCase();
  if (str === 'equipment') return 'Equipment';
  if (str === 'accessory') return 'Accessory';
  if (str === 'food') return 'Food';
  return 'Other';
};

export const resolveTaskId = (task) => task?.id || task?.taskId || task?.routineTaskId || null;

export const resolveTaskStateKey = (task, index) => {
  const resolvedId = resolveTaskId(task);
  const normalized = normalizeId(resolvedId);
  if (normalized) return normalized;
  return `task-index-${index}`;
};

export const normalizeTaskUnitType = (value) => {
  const parsed = Number(value);
  if (parsed === 0) return 'Checkbox';
  if (parsed === 1) return 'Number';

  const str = String(value || '').trim().toLowerCase();
  if (['checkbox', 'boolean', 'done', 'check'].includes(str)) return 'Checkbox';
  if (['number', 'numeric', 'ml', 'value', 'quantity'].includes(str)) return 'Number';
  return 'Checkbox';
};

export const resolveEvidenceUrl = (log) =>
  log?.evidenceUrl || log?.evidenceURL || log?.evidence_url || log?.evidence?.url || null;

export const isLikelyImageEvidence = (url) => {
  const str = String(url || '').toLowerCase();
  return (
    str.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/.test(str) ||
    str.includes('res.cloudinary.com')
  );
};

export const normalizeRemindTimeForInput = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  if (!str) return '';
  if (str.includes(':')) return str.slice(0, 5);
  return str;
};

export const normalizeRemindTimeForApi = (value) => {
  const str = String(value || '').trim();
  if (!str) return null;
  if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
  return null;
};

export const normalizeVisibility = (value, defaultValue = 1) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;

  const str = String(value || '').trim().toLowerCase();
  if (str === 'private') return 0;
  if (str === 'public') return 1;
  if (str === 'subscribersonly' || str === 'subscribers') return 2;
  return defaultValue;
};

export const normalizeRepeatType = (value, defaultValue = 0) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;

  const str = String(value || '').trim().toLowerCase();
  if (str === 'daily') return 0;
  if (str === 'weekly') return 1;
  return defaultValue;
};

export const resolveTaskArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const nestedCandidates = [value.items, value.results, value.data, value.$values];
  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const resolveTasksFromRoutine = (routineData) => {
  const taskCandidates = [
    routineData?.tasks,
    routineData?.routineTasks,
    routineData?.routine_tasks,
    routineData?.taskDtos,
  ];

  for (const candidate of taskCandidates) {
    const resolved = resolveTaskArray(candidate);
    if (resolved.length > 0) {
      return resolved.map((task, index) => {
        const taskPrepareCandidates = [
          task?.prepareItems,
          task?.prepareItemDtos,
          task?.prepareItemDTOs,
          task?.taskPrepareItems,
          task?.taskPrepareItemDtos,
          task?.taskPrepareItemDTOs,
        ];

        let taskPrepareItems = [];
        for (const prepareCandidate of taskPrepareCandidates) {
          const resolvedPrepare = resolveTaskArray(prepareCandidate);
          if (resolvedPrepare.length > 0) {
            taskPrepareItems = resolvedPrepare;
            break;
          }
        }

        return {
          ...task,
          id: task?.id || task?.taskId || `task-${index}`,
          taskId: task?.taskId || task?.id || null,
          prepareItems: Array.isArray(taskPrepareItems)
            ? taskPrepareItems.map((item, itemIndex) => ({
                ...item,
                id: item?.id || item?.prepareItemId || `prepare-${index}-${itemIndex}`,
                category: normalizePrepareCategoryLabel(item?.category),
              }))
            : [],
        };
      });
    }
  }

  for (const candidate of taskCandidates) {
    if (Array.isArray(candidate) && candidate.length === 0) return candidate;
  }

  return [];
};

export const statusLabel = (status) => {
  if (status === 1) return 'Completed';
  if (status === 2) return 'Skipped';
  return 'InProgress';
};

export const statusColor = (status) => {
  if (status === 1) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
  if (status === 2) return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
  return 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30';
};

export const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
