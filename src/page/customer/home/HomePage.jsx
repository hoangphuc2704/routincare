import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BottomNav from '../../../components/BottomNav';
import FeedPost from '../../../components/FeedPost';
import feedApi from '../../../api/feedApi';
import postApi from '../../../api/postApi';
import routineApi from '../../../api/routineApi';
import { message } from 'antd';

const TAB = {
  FEED: 'feed',
  EXPLORE: 'explore',
};

function toRelativeTime(value) {
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

function unwrapItems(response) {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getCurrentUserSnapshot() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return {
      id: user?.id || user?.userId || null,
      name: user?.fullName || user?.name || user?.username || null,
      avatar:
        user?.avatarUrl ||
        user?.avatar ||
        user?.avatar_url ||
        null,
    };
  } catch {
    return null;
  }
}

function resolveRoutineId(item) {
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

  // Feed fallback may return routine entities directly instead of post entities.
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

function normalizePostItem(item, index, options = {}) {
  const { canInteract = true } = options;
  const me = getCurrentUserSnapshot();
  const user = item?.user || item?.owner || item?.author || {};
  const rawPostId = item?.id || item?.postId || item?.post_id || null;
  const normalizedUserId =
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

function normalizeExploreRoutine(item, index) {
  return {
    id: item?.id || item?.routineId || `routine-${index}`,
    title: item?.title || item?.name || 'Routine công khai',
    description: item?.description || '',
    image: item?.coverImageUrl || item?.thumbnailUrl || item?.imageUrl || null,
    copies: item?.copiesCount ?? item?.copyCount ?? 0,
    category: item?.categoryName || item?.category?.name || 'General',
  };
}

function normalizeExploreUser(item, index) {
  return {
    id: item?.id || item?.userId || `user-${index}`,
    name: item?.fullName || item?.name || item?.userName || 'Routin User',
    avatar: item?.avatarUrl || item?.avatar || null,
    bio: item?.bio || '',
    followers: item?.followersCount ?? item?.followerCount ?? 0,
  };
}

function normalizeCommentItem(item, index) {
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

function splitExploreItems(items) {
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

export default function Homepage() {
  const [activeTab, setActiveTab] = useState(TAB.FEED);
  const [feedPosts, setFeedPosts] = useState([]);
  const [exploreRoutines, setExploreRoutines] = useState([]);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [copyLoadingByPost, setCopyLoadingByPost] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [postsResult, exploreRoutineResult, exploreUserResult] = await Promise.allSettled([
      postApi.getPosts({ page: 1, pageSize: 10 }),
      feedApi.getExploreRoutines({ page: 1, pageSize: 8 }),
      feedApi.getExploreUsers({ page: 1, pageSize: 8 }),
    ]);

    const failures = [];

    let nextFeed = [];
    let nextRoutines = [];
    let nextUsers = [];

    if (postsResult.status === 'fulfilled') {
      nextFeed = unwrapItems(postsResult.value).map((item, index) =>
        normalizePostItem(item, index, { canInteract: true })
      );
    } else {
      failures.push(postsResult.reason);
      console.warn('Posts endpoint failed, try fallback feed:', postsResult.reason);

      try {
        const feedFallbackRes = await feedApi.getFeed({ page: 1, pageSize: 10 });
        nextFeed = unwrapItems(feedFallbackRes).map((item, index) =>
          normalizePostItem(item, index, { canInteract: true })
        );
      } catch (fallbackErr) {
        failures.push(fallbackErr);
        console.warn('Fallback /feed endpoint failed:', fallbackErr);
      }
    }

    if (exploreRoutineResult.status === 'fulfilled') {
      nextRoutines = unwrapItems(exploreRoutineResult.value).map(normalizeExploreRoutine);
    } else {
      failures.push(exploreRoutineResult.reason);
      console.warn('Explore routines endpoint failed:', exploreRoutineResult.reason);
    }

    if (exploreUserResult.status === 'fulfilled') {
      nextUsers = unwrapItems(exploreUserResult.value).map(normalizeExploreUser);
    } else {
      failures.push(exploreUserResult.reason);
      console.warn('Explore users endpoint failed:', exploreUserResult.reason);
    }

    if (nextRoutines.length === 0 && nextUsers.length === 0) {
      try {
        const exploreFallbackRes = await feedApi.getExplore({ page: 1, pageSize: 12 });
        const mixedItems = unwrapItems(exploreFallbackRes);
        const split = splitExploreItems(mixedItems);
        nextRoutines = split.routines;
        nextUsers = split.users;
      } catch (fallbackErr) {
        failures.push(fallbackErr);
        console.warn('Explore fallback endpoint failed:', fallbackErr);
      }
    }

    setFeedPosts(nextFeed);
    setExploreRoutines(nextRoutines);
    setExploreUsers(nextUsers);

    const hasAnyData = nextFeed.length > 0 || nextRoutines.length > 0 || nextUsers.length > 0;

    if (!hasAnyData && failures.length > 0) {
      const firstMessage = failures[0]?.response?.data?.message;
      setError(firstMessage || 'Không tải được dữ liệu trang chủ. Vui lòng thử lại.');
    } else {
      setError('');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const hasExploreData = useMemo(
    () => exploreRoutines.length > 0 || exploreUsers.length > 0,
    [exploreRoutines.length, exploreUsers.length]
  );

  const handleCopyRoutine = useCallback(async (post) => {
    const postId = post?.id;
    const routineId = post?.routineId;

    if (!postId || !routineId) {
      message.info('Post nay chua co routine de copy.');
      return;
    }

    if (copyLoadingByPost[postId]) return;

    setCopyLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      await routineApi.copy(routineId);
      message.success('Copy routine thanh cong.');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Khong the copy routine luc nay.');
    } finally {
      setCopyLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  }, [copyLoadingByPost]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#263328_0%,#0a0a0a_48%,#000_100%)] text-white">
      <main className="md:max-w-md md:mx-auto pt-6 pb-32 px-4">
        <div className="mb-4 border-b border-white/10 flex items-center justify-around">
          <button
            onClick={() => setActiveTab(TAB.FEED)}
            className={`relative py-2.5 text-sm font-semibold transition-colors ${
              activeTab === TAB.FEED ? 'text-white' : 'text-white/55 hover:text-white/85'
            }`}
          >
            Theo dõi
            {activeTab === TAB.FEED && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#d2fb05] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab(TAB.EXPLORE)}
            className={`relative py-2.5 text-sm font-semibold transition-colors ${
              activeTab === TAB.EXPLORE ? 'text-white' : 'text-white/55 hover:text-white/85'
            }`}
          >
            Khám phá
            {activeTab === TAB.EXPLORE && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#d2fb05] rounded-full" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 rounded-3xl bg-white/10" />
            <div className="h-40 rounded-3xl bg-white/10" />
            <div className="h-40 rounded-3xl bg-white/10" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-center">
            <p className="text-base font-semibold">Không thể tải trang chủ</p>
            <p className="text-sm text-white/70 mt-2">{error}</p>
            <button
              onClick={loadHomeData}
              className="mt-4 px-4 py-2 rounded-full bg-[#d2fb05] text-black font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : activeTab === TAB.FEED ? (
          feedPosts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {feedPosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  copyLoading={Boolean(copyLoadingByPost[post.id])}
                  onCopyRoutine={() => handleCopyRoutine(post)}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-white/60 rounded-3xl border border-white/10 bg-black/20">
              <p className="text-lg font-semibold">Feed của bạn đang trống</p>
              <p className="text-sm mt-2">Theo dõi thêm người dùng để xem hoạt động mới nhất.</p>
            </div>
          )
        ) : hasExploreData ? (
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Routine nổi bật</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exploreRoutines.map((routine) => (
                  <article
                    key={routine.id}
                    className="rounded-3xl border border-white/10 bg-neutral-950/70 overflow-hidden"
                  >
                    {routine.image ? (
                      <img src={routine.image} alt={routine.title} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="h-36 w-full bg-[linear-gradient(135deg,#d2fb05_0%,#6c8b05_100%)]" />
                    )}
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-[#d2fb05]">{routine.category}</p>
                      <h3 className="text-base font-bold mt-1 line-clamp-1">{routine.title}</h3>
                      <p className="text-sm text-white/65 mt-1 line-clamp-2">
                        {routine.description || 'Routine công khai đang thu hút nhiều người dùng.'}
                      </p>
                      <p className="text-xs text-white/60 mt-3">{routine.copies} lượt copy</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">Người dùng nên theo dõi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exploreUsers.map((user, index) => (
                  <Link
                    to={user.id ? `/profile/${user.id}` : '/profile'}
                    key={user.id || `${user.name}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/35 p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-white/15">
                      <img
                        src={user.avatar || `https://i.pravatar.cc/150?u=${user.name}`}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-white/60 truncate">
                        {user.bio || 'Người dùng mới của cộng đồng Routin.'}
                      </p>
                      <p className="text-xs text-[#d2fb05] mt-1">{user.followers} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-white/60 rounded-3xl border border-white/10 bg-black/20">
            <p className="text-lg font-semibold">Chưa có dữ liệu khám phá</p>
            <p className="text-sm mt-2">Nội dung public sẽ xuất hiện tại đây khi có bài mới.</p>
          </div>
        )}
      </main>

      <BottomNav activeItem="home" />
    </div>
  );
}
