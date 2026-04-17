export function toRelativeTime(value) {
  if (!value) return '';
  const ts = new Date(value);
  if (Number.isNaN(ts.getTime())) return '';
  const diffMs = Date.now() - ts.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${Math.floor(diffMonth / 12)} năm trước`;
}

export function unwrapItems(response) {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function unwrapObject(response) {
  const payload = response?.data?.data ?? response?.data ?? null;
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

export function getCurrentUserSnapshot() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return {
      id: user?.id || user?.userId || null,
      name: user?.fullName || user?.name || user?.username || null,
      avatar: user?.avatarUrl || user?.avatar || user?.avatar_url || null,
    };
  } catch {
    return null;
  }
}

export function resolveRoutineId(item) {
  const directCandidates = [
    item?.routineId,
    item?.routine_id,
    item?.originalRoutineId,
    item?.original_routine_id,
    item?.sourceRoutineId,
    item?.source_routine_id,
    item?.sharedRoutineId,
    item?.shared_routine_id,
    item?.relatedRoutineId,
    item?.related_routine_id,
  ];

  for (const value of directCandidates) {
    if (value) return value;
  }

  const nestedRoutine = item?.routine;
  if (typeof nestedRoutine === 'string' && nestedRoutine) {
    return nestedRoutine;
  }

  const nestedCandidates = [
    nestedRoutine?.id,
    nestedRoutine?.routineId,
    nestedRoutine?.routine_id,
    nestedRoutine?.originalRoutineId,
    item?.routineDetail?.id,
    item?.routineDetail?.routineId,
  ];

  for (const value of nestedCandidates) {
    if (value) return value;
  }

  const looksLikeRoutineEntity =
    item?.repeatType !== undefined ||
    item?.visibility !== undefined ||
    item?.taskCount !== undefined ||
    Array.isArray(item?.tasks);

  if (looksLikeRoutineEntity && item?.id) {
    return item.id;
  }

  return null;
}

export function normalizePostItem(item, index, options = {}) {
  const { canInteract = true } = options;
  const me = getCurrentUserSnapshot();
  const user = item?.user || item?.owner || item?.author || {};
  const creator = item?.creator || item?.routineCreator || {};
  const routine = item?.routine || item?.routineDetail || item?.originalRoutine || {};
  const routineCreator = routine?.creator || routine?.owner || routine?.author || {};
  const rawPostId = item?.id || item?.postId || item?.post_id || null;
  const normalizedUserId =
    creator?.id ||
    creator?.userId ||
    creator?.user_id ||
    routineCreator?.id ||
    routineCreator?.userId ||
    routineCreator?.user_id ||
    item?.creatorId ||
    item?.creator_id ||
    item?.routineCreatorId ||
    item?.routine_creator_id ||
    routine?.creatorId ||
    routine?.creator_id ||
    routine?.ownerId ||
    routine?.owner_id ||
    user?.id ||
    user?.userId ||
    user?.user_id ||
    item?.userId ||
    item?.user_id ||
    item?.ownerId ||
    item?.owner_id ||
    item?.authorId ||
    item?.author_id ||
    item?.createdBy ||
    item?.created_by ||
    null;

  const rawName =
    item?.creatorNamee ||
    item?.creatornamee ||
    item?.creatorName ||
    item?.creator_name ||
    item?.routineCreatorName ||
    item?.routine_creator_name ||
    routine?.creatorNamee ||
    routine?.creatornamee ||
    routine?.creatorName ||
    routine?.creator_name ||
    routine?.ownerName ||
    routine?.owner_name ||
    routineCreator?.fullName ||
    routineCreator?.full_name ||
    routineCreator?.name ||
    routineCreator?.userName ||
    routineCreator?.username ||
    creator?.fullName ||
    creator?.full_name ||
    creator?.name ||
    creator?.userName ||
    creator?.username ||
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.userName ||
    user?.username ||
    item?.userFullName ||
    item?.user_full_name ||
    item?.ownerName ||
    item?.owner_name ||
    item?.authorName ||
    item?.author_name ||
    item?.createdByName ||
    item?.created_by_name ||
    item?.fullName ||
    item?.full_name ||
    item?.userName ||
    item?.username ||
    null;

  const rawAvatar =
    item?.creatorAvatar ||
    item?.creatorAvatarUrl ||
    item?.creator_avatar_url ||
    item?.routineCreatorAvatar ||
    item?.routineCreatorAvatarUrl ||
    routine?.creatorAvatar ||
    routine?.creatorAvatarUrl ||
    routine?.creator_avatar_url ||
    routine?.ownerAvatar ||
    routine?.ownerAvatarUrl ||
    routine?.owner_avatar_url ||
    routineCreator?.avatarUrl ||
    routineCreator?.avatar ||
    routineCreator?.avatar_url ||
    creator?.avatarUrl ||
    creator?.avatar ||
    creator?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.avatar_url ||
    item?.userAvatar ||
    item?.userAvatarUrl ||
    item?.user_avatar_url ||
    item?.ownerAvatar ||
    item?.ownerAvatarUrl ||
    item?.owner_avatar_url ||
    item?.authorAvatar ||
    item?.authorAvatarUrl ||
    item?.author_avatar_url ||
    item?.avatarUrl ||
    item?.avatar ||
    item?.avatar_url ||
    null;

  const isMyPost =
    me?.id && normalizedUserId
      ? String(me.id).toLowerCase() === String(normalizedUserId).toLowerCase()
      : false;

  const userName = rawName || (isMyPost ? me?.name : null) || 'Routin User';
  const userAvatar = rawAvatar || (isMyPost ? me?.avatar : null) || null;
  const media = Array.isArray(item?.media) ? item.media : [];
  const firstMedia = media[0];
  const image =
    item?.image ||
    item?.imageUrl ||
    item?.thumbnailUrl ||
    item?.coverImageUrl ||
    item?.mediaUrl ||
    item?.evidenceUrl ||
    firstMedia?.url ||
    firstMedia?.mediaUrl ||
    null;

  const routineId = resolveRoutineId(item);

  const postId = rawPostId || `post-${index}`;

  return {
    id: postId,
    image,
    caption: item?.caption || item?.content || item?.description || item?.title || '',
    likes: item?.likesCount ?? item?.likeCount ?? item?.likes ?? 0,
    comments: item?.commentsCount ?? item?.commentCount ?? item?.comments ?? 0,
    shares: item?.sharesCount ?? item?.shareCount ?? 0,
    liked: Boolean(item?.isLiked ?? item?.liked ?? item?.likedByMe ?? false),
    canInteract: Boolean(canInteract && rawPostId),
    routineId,
    timeago: toRelativeTime(item?.createdAt || item?.updatedAt || item?.publishedAt),
    user: {
      id: normalizedUserId,
      name: userName,
      avatar: userAvatar,
    },
  };
}

export function normalizeExploreRoutine(item, index) {
  return {
    id: item?.id || item?.routineId || `routine-${index}`,
    title: item?.title || item?.name || 'Routine công khai',
    description: item?.description || '',
    image: item?.coverImageUrl || item?.thumbnailUrl || item?.imageUrl || null,
    copies: item?.copiesCount ?? item?.copyCount ?? 0,
    category: item?.categoryName || item?.category?.name || 'General',
  };
}

export function normalizeExploreUser(item, index) {
  return {
    id: item?.id || item?.userId || `user-${index}`,
    name: item?.fullName || item?.name || item?.userName || 'Routin User',
    avatar: item?.avatarUrl || item?.avatar || null,
    bio: item?.bio || '',
    followers: item?.followersCount ?? item?.followerCount ?? 0,
  };
}

export function normalizeCommentItem(item, index) {
  const user = item?.user || item?.author || item?.owner || {};
  return {
    id: item?.id || item?.commentId || `comment-${index}`,
    content: item?.content || item?.body || item?.text || '',
    likesCount: item?.likesCount ?? item?.likeCount ?? item?.likes ?? 0,
    createdAt: item?.createdAt || item?.updatedAt || null,
    timeago: toRelativeTime(item?.createdAt || item?.updatedAt),
    authorName: user?.fullName || user?.name || user?.userName || item?.authorName || 'User',
  };
}

export function splitExploreItems(items) {
  const routines = [];
  const users = [];

  items.forEach((item, index) => {
    const hasUserSignals =
      item?.followersCount !== undefined ||
      item?.followerCount !== undefined ||
      item?.bio !== undefined ||
      item?.avatarUrl !== undefined;

    if (hasUserSignals) {
      users.push(normalizeExploreUser(item, index));
    } else {
      routines.push(normalizeExploreRoutine(item, index));
    }
  });

  return { routines, users };
}

export function normalizeRoutinePreview(response, post) {
  const payload = unwrapObject(response);
  const routine = payload?.routine || payload || {};

  const tasksRaw = routine?.tasks || routine?.taskDtos || routine?.taskDTOs || routine?.taskList || [];

  const prepareRaw =
    routine?.prepareItems || routine?.prepareItemDtos || routine?.prepareItemDTOs || [];

  const tasks = Array.isArray(tasksRaw)
    ? tasksRaw.map((task, index) => ({
        id: task?.id || task?.taskId || `task-${index}`,
        title: task?.title || task?.name || task?.taskName || `Task ${index + 1}`,
        note: task?.description || task?.note || '',
        tips: task?.tips || '',
        type: task?.type || task?.taskType || task?.unitType || null,
        targetValue: task?.targetValue ?? task?.target ?? null,
        unitName: task?.unitName || task?.unit || null,
        difficulty: task?.difficulty || null,
        estimatedMinutes: task?.estimatedMinutes ?? null,
        restAfterSeconds: task?.restAfterSeconds ?? null,
        prepareItems: Array.isArray(task?.prepareItems)
          ? task.prepareItems.map((item, itemIndex) => ({
              id: item?.id || item?.prepareItemId || `task-${index}-prepare-${itemIndex}`,
              title: item?.title || item?.name || item?.itemName || `Vật dụng ${itemIndex + 1}`,
              description: item?.description || '',
              isRequired: item?.isRequired,
              category: item?.category,
              purchaseUrl: item?.purchaseUrl || null,
            }))
          : [],
      }))
    : [];

  const prepareItems = Array.isArray(prepareRaw)
    ? prepareRaw.map((item, index) => ({
        id: item?.id || item?.prepareItemId || `prepare-${index}`,
        title: item?.title || item?.name || item?.itemName || `Prepare ${index + 1}`,
      }))
    : [];

  return {
    id: routine?.id || routine?.routineId || post?.routineId,
    title: routine?.title || routine?.name || post?.caption || 'Routine',
    description: routine?.description || post?.caption || '',
    image:
      routine?.coverImageUrl ||
      routine?.thumbnailUrl ||
      routine?.imageUrl ||
      routine?.image ||
      post?.image ||
      null,
    taskCount: routine?.taskCount ?? tasks.length,
    prepareCount: routine?.prepareItemsCount ?? prepareItems.length,
    repeatType: routine?.repeatType ?? null,
    repeatDays: routine?.repeatDays || null,
    remindTime: routine?.remindTime || null,
    visibility: routine?.visibility ?? null,
    categoryName: routine?.categoryName || routine?.category?.name || null,
    createdAt: routine?.createdAt || null,
    updatedAt: routine?.updatedAt || null,
    tasks,
    prepareItems,
    rawRoutine: routine,
  };
}
