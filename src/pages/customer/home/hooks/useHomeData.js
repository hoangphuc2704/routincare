import { useCallback, useEffect, useMemo, useState } from 'react';
import feedApi from '../../../../services/api/feedApi';
import postApi from '../../../../services/api/postApi';
import {
  normalizePostItem,
  splitExploreItems,
  unwrapItems,
} from '../utils/homePageHelpers';

const FEED_PAGE_SIZE = 10;
const EXPLORE_PAGE_SIZE = 8;
const EXPLORE_FALLBACK_PAGE_SIZE = 12;

const FEED_SOURCE = {
  POSTS: 'posts',
  FEED: 'feed',
};

const mergeUniquePosts = (prev, next) => {
  const seen = new Set(prev.map((item) => String(item?.id || '')));
  const toAppend = next.filter((item) => {
    const key = String(item?.id || '');
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...prev, ...toAppend];
};

const sortFeedByLatest = (items) =>
  [...items].sort((a, b) => {
    const aTime = Number.isFinite(a?.sortTimestamp) ? a.sortTimestamp : 0;
    const bTime = Number.isFinite(b?.sortTimestamp) ? b.sortTimestamp : 0;
    return bTime - aTime;
  });

const normalizeExploreRoutine = (item) => ({
  id: item?.id || item?.routineId || item?.postId,
  title: item?.title || item?.routineTitle || item?.name || 'Routine công khai',
  description: item?.description || item?.caption || '',
  image: item?.coverImageUrl || item?.thumbnailUrl || item?.imageUrl || item?.image || '',
  copies: item?.copyCount ?? item?.totalCopies ?? item?.usedCount ?? 0,
  category:
    item?.category?.name ||
    item?.categoryName ||
    item?.category ||
    item?.topic ||
    'Featured',
});

const normalizeExploreUser = (item) => ({
  id: item?.id || item?.userId,
  name: item?.fullName || item?.name || item?.username || 'Routin User',
  avatar: item?.avatarUrl || item?.avatar || item?.profilePicture || '',
  bio: item?.bio || '',
  followers: item?.followersCount ?? item?.totalFollowers ?? item?.followerCount ?? 0,
});

export default function useHomeData() {
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedSource, setFeedSource] = useState(FEED_SOURCE.POSTS);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);

  const [exploreRoutines, setExploreRoutines] = useState([]);
  const [exploreUsers, setExploreUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedPage = useCallback(async (source, page) => {
    if (source === FEED_SOURCE.FEED) {
      return feedApi.getFeed({ page, pageSize: FEED_PAGE_SIZE });
    }
    return postApi.getPosts({ page, pageSize: FEED_PAGE_SIZE });
  }, []);

  const appendFeedItems = useCallback((items) => {
    setFeedPosts((prev) => {
      const normalized = items.map((item, index) =>
        normalizePostItem(item, prev.length + index, { canInteract: true })
      );
      return sortFeedByLatest(mergeUniquePosts(prev, normalized));
    });
  }, []);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [postsResult, exploreRoutineResult, exploreUserResult] = await Promise.allSettled([
      fetchFeedPage(FEED_SOURCE.POSTS, 1),
      feedApi.getExploreRoutines({ page: 1, pageSize: EXPLORE_PAGE_SIZE }),
      feedApi.getExploreUsers({ page: 1, pageSize: EXPLORE_PAGE_SIZE }),
    ]);

    const failures = [];

    let nextFeed = [];
    let nextRoutines = [];
    let nextUsers = [];
    let nextFeedSource = FEED_SOURCE.POSTS;
    let hasMoreFeed = true;

    if (postsResult.status === 'fulfilled') {
      const rawPosts = unwrapItems(postsResult.value);
      nextFeed = rawPosts.map((item, index) =>
        normalizePostItem(item, index, { canInteract: true })
      );
      hasMoreFeed = rawPosts.length === FEED_PAGE_SIZE;
    } else {
      failures.push(postsResult.reason);
      console.warn('Posts endpoint failed, try fallback feed:', postsResult.reason);

      try {
        const feedFallbackRes = await fetchFeedPage(FEED_SOURCE.FEED, 1);
        const rawFallbackPosts = unwrapItems(feedFallbackRes);
        nextFeedSource = FEED_SOURCE.FEED;
        nextFeed = rawFallbackPosts.map((item, index) =>
          normalizePostItem(item, index, { canInteract: true })
        );
        hasMoreFeed = rawFallbackPosts.length === FEED_PAGE_SIZE;
      } catch (fallbackErr) {
        failures.push(fallbackErr);
        console.warn('Fallback /feed endpoint failed:', fallbackErr);
        hasMoreFeed = false;
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
        const exploreFallbackRes = await feedApi.getExplore({
          page: 1,
          pageSize: EXPLORE_FALLBACK_PAGE_SIZE,
        });
        const mixedItems = unwrapItems(exploreFallbackRes);
        const split = splitExploreItems(mixedItems);
        nextRoutines = split.routines;
        nextUsers = split.users;
      } catch (fallbackErr) {
        failures.push(fallbackErr);
        console.warn('Explore fallback endpoint failed:', fallbackErr);
      }
    }

    setFeedPosts(sortFeedByLatest(nextFeed));
    setFeedSource(nextFeedSource);
    setFeedPage(1);
    setFeedHasMore(hasMoreFeed);
    setFeedLoadingMore(false);

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
  }, [fetchFeedPage]);

  const loadMoreFeed = useCallback(
    async (canLoad) => {
      if (!canLoad || loading || error || feedLoadingMore || !feedHasMore || feedPosts.length === 0) {
        return;
      }

      setFeedLoadingMore(true);
      const nextPage = feedPage + 1;

      try {
        const res = await fetchFeedPage(feedSource, nextPage);
        const items = unwrapItems(res);
        appendFeedItems(items);
        setFeedPage(nextPage);
        setFeedHasMore(items.length === FEED_PAGE_SIZE);
      } catch (err) {
        if (feedSource !== FEED_SOURCE.FEED) {
          try {
            const fallbackRes = await fetchFeedPage(FEED_SOURCE.FEED, nextPage);
            const fallbackItems = unwrapItems(fallbackRes);
            appendFeedItems(fallbackItems);
            setFeedSource(FEED_SOURCE.FEED);
            setFeedPage(nextPage);
            setFeedHasMore(fallbackItems.length === FEED_PAGE_SIZE);
          } catch (fallbackErr) {
            console.warn('Load more fallback feed failed:', fallbackErr);
            setFeedHasMore(false);
          }
        } else {
          console.warn('Load more feed failed:', err);
          setFeedHasMore(false);
        }
      } finally {
        setFeedLoadingMore(false);
      }
    },
    [
      appendFeedItems,
      error,
      feedHasMore,
      feedLoadingMore,
      feedPage,
      feedPosts.length,
      feedSource,
      fetchFeedPage,
      loading,
    ]
  );

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const hasExploreData = useMemo(
    () => exploreRoutines.length > 0 || exploreUsers.length > 0,
    [exploreRoutines.length, exploreUsers.length]
  );

  return {
    loading,
    error,
    feedPosts,
    feedHasMore,
    feedLoadingMore,
    exploreRoutines,
    exploreUsers,
    hasExploreData,
    loadHomeData,
    loadMoreFeed,
  };
}
