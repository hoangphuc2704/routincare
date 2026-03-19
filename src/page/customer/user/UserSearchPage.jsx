import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import userApi from '../../../api/userApi';
import BottomNav from '../../../components/BottomNav';

export default function UserSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const searchSeqRef = useRef(0);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (currentQ === keyword) return;
    const nextParams = new URLSearchParams(searchParams);
    if (keyword.trim()) {
      nextParams.set('q', keyword.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  }, [keyword, searchParams, setSearchParams]);

  useEffect(() => {
    const query = keyword.trim();
    if (!query) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      const currentSeq = ++searchSeqRef.current;
      try {
        setLoading(true);
        setError('');
        const res = await userApi.searchPublic({ keyword: query, page: 1, pageSize: 10 });
        const data = res.data?.data || res.data;
        const items = data?.items || data || [];
        if (cancelled || currentSeq !== searchSeqRef.current) return;
        const normalized = Array.isArray(items) ? items : [];
        setResults(normalized);
        if (normalized.length === 0) setError('Không tìm thấy người dùng phù hợp');
      } catch (err) {
        if (cancelled || currentSeq !== searchSeqRef.current) return;
        console.error('Search users failed:', err);
        setError(err.response?.data?.message || 'Không tìm thấy người dùng');
        setResults([]);
      } finally {
        if (!cancelled && currentSeq === searchSeqRef.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [keyword]);

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-black text-white pb-24">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-4 md:max-w-4xl md:mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Social</p>
              <h1 className="text-xl md:text-2xl font-bold">Tìm kiếm người dùng</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 md:max-w-4xl md:mx-auto space-y-6">
        <section className="p-4 rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-[0_20px_80px_-70px_rgba(255,255,255,0.25)]">
          <div>
            <label className="text-sm text-zinc-400">Tên hoặc email</label>
            <div className="mt-2 flex items-center gap-2 bg-black border border-white/10 rounded-xl px-3 py-2.5">
              <Search size={16} className="text-zinc-500" />
              <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Gõ tới đâu hiện danh sách tới đó"
                className="flex-1 bg-transparent outline-none text-white text-sm"
              />
              {loading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>

        {results.length > 0 && (
          <section className="space-y-3">
            {results.map((user) => {
              const userId = user?.id ?? user?.userId;
              const displayName = user?.name || user?.fullName || user?.userName || 'Người dùng';
              const email = user?.email || user?.emailAddress;
              const bio = user?.bio;
              return (
                <div
                  key={userId || displayName}
                  className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{displayName}</p>
                    {email && <p className="text-xs text-zinc-400 truncate">{email}</p>}
                    {bio && <p className="text-xs text-zinc-500 truncate">{bio}</p>}
                  </div>
                  <button
                    onClick={() => handleOpenProfile(userId)}
                    className="px-3 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#d2fb05] transition-all active:scale-95"
                  >
                    Xem profile
                  </button>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
