import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav';
import FeedPost from '../../../components/FeedPost';
import RoutinePreviewModal from '../../../components/RoutinePreviewModal';
import routineApi from '../../../services/api/routineApi';
import { message } from 'antd';
import { normalizeRoutinePreview } from './utils/homePageHelpers';
import useHomeData from './hooks/useHomeData';

const TAB = {
  FEED: 'feed',
  EXPLORE: 'explore',
};

const FEED_OBSERVER_ROOT_MARGIN = '300px 0px 300px 0px';

export default function Homepage() {
  const loadMoreTriggerRef = useRef(null);

  const [activeTab, setActiveTab] = useState(TAB.FEED);
  const [copyLoadingByPost, setCopyLoadingByPost] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSubmitting, setPreviewSubmitting] = useState(false);
  const [selectedCopyTarget, setSelectedCopyTarget] = useState(null);
  const [previewRoutine, setPreviewRoutine] = useState(null);
  const {
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
  } = useHomeData();

  useEffect(() => {
    if (activeTab !== TAB.FEED) return;
    if (!loadMoreTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          loadMoreFeed(activeTab === TAB.FEED);
        }
      },
      {
        root: null,
        rootMargin: FEED_OBSERVER_ROOT_MARGIN,
        threshold: 0.01,
      }
    );

    observer.observe(loadMoreTriggerRef.current);
    return () => observer.disconnect();
  }, [activeTab, loadMoreFeed]);

  const handleOpenCopyPreview = useCallback(async (target) => {
    const postId = target?.id;
    const routineId = target?.routineId;

    if (!postId || !routineId) {
      message.info('Post nay chua co routine de copy.');
      return;
    }

    if (copyLoadingByPost[postId]) return;

    setSelectedCopyTarget(target);
    setPreviewRoutine(null);
    setPreviewOpen(true);
    setPreviewLoading(true);

    try {
      const detailRes = await routineApi.getById(routineId);
      setPreviewRoutine(normalizeRoutinePreview(detailRes, target));
    } catch (err) {
      setPreviewRoutine(normalizeRoutinePreview(null, target));
      message.error(err?.response?.data?.message || 'Khong the tai chi tiet routine luc nay.');
    } finally {
      setPreviewLoading(false);
    }
  }, [copyLoadingByPost]);

  const handleClosePreview = useCallback(() => {
    if (previewSubmitting) return;
    setPreviewOpen(false);
    setSelectedCopyTarget(null);
    setPreviewRoutine(null);
    setPreviewLoading(false);
  }, [previewSubmitting]);

  const handleCopyRoutine = useCallback(async () => {
    const postId = selectedCopyTarget?.id;
    const routineId = selectedCopyTarget?.routineId;

    if (!postId || !routineId || previewSubmitting) return;

    setPreviewSubmitting(true);

    setCopyLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      await routineApi.copy(routineId);
      message.success('Copy routine thanh cong.');
      setPreviewOpen(false);
      setSelectedCopyTarget(null);
      setPreviewRoutine(null);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Khong the copy routine luc nay.');
    } finally {
      setPreviewSubmitting(false);
      setCopyLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  }, [previewSubmitting, selectedCopyTarget]);

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
                  onCopyRoutine={() => handleOpenCopyPreview(post)}
                />
              ))}

              <div ref={loadMoreTriggerRef} className="h-1" aria-hidden="true" />

              {feedLoadingMore && (
                <div className="py-3 flex justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-[#d2fb05] animate-spin" />
                </div>
              )}

              {!feedHasMore && (
                <p className="text-center text-xs text-white/45 py-2">Da hien thi het feed.</p>
              )}
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
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-white/60">{routine.copies} lượt copy</p>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCopyPreview({
                              id: `explore-${routine.id}`,
                              routineId: routine.id,
                              caption: routine.description,
                              image: routine.image,
                            })
                          }
                          disabled={Boolean(copyLoadingByPost[`explore-${routine.id}`])}
                          className="inline-flex items-center rounded-full border border-[#d2fb05]/40 px-3 py-1.5 text-xs font-semibold text-[#d2fb05] hover:bg-[#d2fb05]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {copyLoadingByPost[`explore-${routine.id}`] ? 'Dang copy...' : 'Copy routine'}
                        </button>
                      </div>
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

      <RoutinePreviewModal
        open={previewOpen}
        loading={previewLoading}
        submitting={previewSubmitting}
        routine={previewRoutine}
        canCopy={Boolean(selectedCopyTarget?.routineId)}
        onCancel={handleClosePreview}
        onConfirm={handleCopyRoutine}
      />

      <BottomNav activeItem="home" />
    </div>
  );
}
