import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, PencilLine, Activity, Flame, Target, Trophy, Settings, LayoutDashboard, Crown, Archive, Clock3, Eye, LogOut } from 'lucide-react';
import { message } from 'antd';
import userApi from '../../../api/userApi';
import authApi from '../../../api/authApi';
import analyticsApi from '../../../api/analyticsApi';
import routineApi from '../../../api/routineApi';
import mediaApi from '../../../api/mediaApi';
import subscriptionApi from '../../../api/subscriptionApi';
import { clearAllAuth, getRefreshToken } from '../../../utils/tokenService';
import Heatmap from '../../../components/Heatmap';
import UserHeader from '../../../components/UserHeader';

const normalizeSubscriptionStatus = (rawStatus) => {
  if (rawStatus === 1 || String(rawStatus).toLowerCase() === 'active') return 'Active';
  if (rawStatus === 0 || String(rawStatus).toLowerCase() === 'pending') return 'Pending';
  if (rawStatus === 2 || ['canceled', 'cancelled'].includes(String(rawStatus).toLowerCase())) return 'Cancelled';
  if (rawStatus === 3 || String(rawStatus).toLowerCase() === 'expired') return 'Expired';
  if (rawStatus === 4 || String(rawStatus).toLowerCase() === 'failed') return 'Failed';
  return 'Unknown';
};

const formatSubscriptionDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isMe, setIsMe] = useState(!userId);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
    bio: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [activeTab, setActiveTab] = useState(userId ? 'routines' : 'dashboard');
  const [routines, setRoutines] = useState([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = userId ? await userApi.getPublicProfile(userId) : await userApi.getMe();
        const data = res.data?.data || res.data;
        
        // Detect if it's actually me even if visited via ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const myId = JSON.parse(storedUser).userId;
          if (myId === (data.id || data.userId)) {
              setIsMe(true);
          } else {
              setIsMe(!userId);
          }
        }

        setProfile(data);

        if (!userId && data) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const nextUser = {
            ...storedUser,
            ...data,
            userId: data.userId || data.id || storedUser.userId,
            id: data.id || data.userId || storedUser.id,
            IsPremium: Boolean(data.IsPremium ?? data.isPremium ?? storedUser.IsPremium),
          };
          localStorage.setItem('user', JSON.stringify(nextUser));
        }
      } catch (err) {
        message.error(err.response?.data?.message || 'Không tải được thông tin');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getOverview();
        const data = res.data?.data || res.data;
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    const fetchHeatmap = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const res = await analyticsApi.getHeatmap(currentYear);
        const data = res.data?.data || res.data;
        setHeatmapData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch heatmap:', err);
      }
    };

    const fetchCurrentSubscription = async () => {
      try {
        setSubscriptionLoading(true);
        const res = await subscriptionApi.getMe();
        const data = res.data?.data || res.data;
        const normalized = Array.isArray(data) ? data[0] : data;
        setCurrentSubscription(normalized || null);

        const status = normalizeSubscriptionStatus(normalized?.status);
        const isPremium = status === 'Active';
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, IsPremium: isPremium }));
      } catch (err) {
        console.error('Failed to fetch current subscription on profile:', err);
        setCurrentSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (isMe) {
        fetchAnalytics();
        fetchHeatmap();
        fetchCurrentSubscription();
    }
    fetchUser();
  }, [userId, isMe]);

  const subscriptionStatus = normalizeSubscriptionStatus(currentSubscription?.status);
  const subscriptionPlanName = currentSubscription?.planName || currentSubscription?.name || (subscriptionStatus === 'Active' ? 'Premium Plan' : 'Free Plan');
  const subscriptionEndDate = currentSubscription?.endDate || currentSubscription?.expiresAt;
  const isPremiumActive = subscriptionStatus === 'Active';
  let subscriptionDescription = 'Your current subscription';
  if (isPremiumActive) {
    subscriptionDescription = `Hiệu lực đến ${formatSubscriptionDate(subscriptionEndDate)}`;
  } else if (subscriptionStatus === 'Pending') {
    subscriptionDescription = 'Subscription đang chờ kích hoạt';
  }

  useEffect(() => {
    const fetchRoutines = async () => {
      if (activeTab !== 'routines') return;
      try {
        setRoutinesLoading(true);
        let data = [];

        if (isMe) {
          const res = await routineApi.getMyRoutines();
          data = res.data?.data || res.data || [];
        } else if (userId) {
          // Strategy 1: dedicated user routines endpoint
          try {
            const res = await routineApi.getPublicByUser(userId);
            const raw = res.data?.data || res.data;
            data = raw?.items || raw?.records || (Array.isArray(raw) ? raw : []);
          } catch (err) {
            console.warn('getPublicByUser not available:', err);
          }

          // Strategy 2: search with userId filter
          if (data.length === 0) {
            try {
              const searchRes = await routineApi.searchPublic({ userId, pageSize: 100 });
              const searchData = searchRes.data?.data || searchRes.data;
              const allRoutines = searchData?.items || searchData?.records || (Array.isArray(searchData) ? searchData : []);
              data = allRoutines.filter((item) => {
                const ownerId = item.userId || item.ownerId || item.createdBy || item.user?.id || item.user?.userId;
                return !ownerId || String(ownerId).toLowerCase() === String(userId).toLowerCase();
              });
            } catch (err) {
              console.warn('Search public routines failed:', err);
            }
          }

          // Strategy 3: public profile response
          if (data.length === 0) {
            try {
              const profileRes = await userApi.getPublicProfile(userId);
              const profileData = profileRes.data?.data || profileRes.data || {};
              data = profileData.routines || profileData.publicRoutines || [];
            } catch (err) {
              console.warn('Public profile routines not available:', err);
            }
          }
        }

        const mapped = (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          repeatType: item.repeatType,
          repeatDays: item.repeatDays,
          visibility: item.visibility,
          categoryName: item.category?.name || item.categoryName,
          remindTime: item.remindTime,
          taskCount: item.tasks?.length ?? item.routineTasks?.length ?? item.taskCount ?? 0,
        }));
        setRoutines(mapped);
      } catch (err) {
        console.error('Failed to fetch routines:', err);
        if (isMe) message.error('Không tải được danh sách routine');
      } finally {
        setRoutinesLoading(false);
      }
    };

    fetchRoutines();
  }, [activeTab, isMe, userId]);

  const visibilityLabel = (value) => {
    if (value === 0) return 'Private';
    if (value === 1) return 'Public';
    if (value === 2) return 'Subscribers';
    return 'Unknown';
  };

  const repeatLabel = (repeatType, repeatDays) => {
    if (repeatType === 1) return `Weekly: ${repeatDays || '—'}`;
    return 'Daily';
  };

  const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const getCompletionPercent = (overview) => {
    // Support both old and new API field names.
    const raw =
      overview?.completionRate ??
      overview?.completion_rate_7d ??
      overview?.completionRate7d ??
      0;
    const value = toNumber(raw, 0);
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  };

  const analyticsStats = {
    totalRoutines: toNumber(analytics?.totalRoutines ?? analytics?.total_routines),
    currentStreak: toNumber(analytics?.currentStreak ?? analytics?.current_streak),
    longestStreak: toNumber(analytics?.longestStreak ?? analytics?.longest_streak),
    completionPercent: getCompletionPercent(analytics),
  };

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.warning('Vui lòng chọn file ảnh');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.warning('Ảnh tối đa 5MB');
      e.target.value = '';
      return;
    }

    try {
      setUploadingAvatar(true);

      const signRes = await mediaApi.signUpload({ folder: 'routin/avatar', resourceType: 'image' });
      const signData = signRes.data?.data || signRes.data;

      if (!signData?.uploadUrl || !signData?.apiKey || !signData?.timestamp || !signData?.signature) {
        throw new Error('Missing signed upload data');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', String(signData.apiKey));
      formData.append('timestamp', String(signData.timestamp));
      formData.append('signature', String(signData.signature));
      if (signData.folder) {
        formData.append('folder', String(signData.folder));
      }

      const uploadRes = await fetch(signData.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const uploaded = await uploadRes.json();
      const secureUrl = uploaded.secure_url || uploaded.url;
      if (!secureUrl) {
        throw new Error('Upload success but no URL returned');
      }

      setProfile((prev) => ({ ...prev, avatarUrl: secureUrl }));
      message.success('Tải ảnh lên thành công');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      message.error('Không thể tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName?.trim()) {
      message.warning('Họ và tên là bắt buộc');
      return;
    }
    if (!isValidUrl(profile.avatarUrl?.trim())) {
      message.warning('Avatar URL không hợp lệ');
      return;
    }
    try {
      setSavingProfile(true);
      const payload = {
        fullName: profile.fullName.trim(),
        phoneNumber: profile.phoneNumber?.trim() || null,
        avatarUrl: profile.avatarUrl?.trim() || null,
        bio: profile.bio?.trim() || null,
      };
      await userApi.updateMe(payload);
      
      // Update localStorage to sync with other components like BottomNav
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...user, ...payload }));
      }

      message.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      message.warning('Vui lòng nhập đủ thông tin');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      message.error('Mật khẩu mới không khớp');
      return;
    }
    if (newPassword.length < 6) {
      message.warning('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    try {
      setChangingPassword(true);
      await userApi.changePassword({
        currentPassword,
        newPassword,
      });
      message.success('Đổi mật khẩu thành công');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await authApi.logout({ refreshToken });
        } catch (err) {
          console.warn('Logout API failed, fallback clear local auth:', err);
        }
      }
      clearAllAuth();
      message.success('Đã đăng xuất');
      navigate('/', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 group text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {isMe ? "My Space" : "Member Profile"}
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
                {isMe ? "Manage your habits and stats." : "Viewing user's routine and journey."}
            </p>
          </div>

          <UserHeader user={profile} isMe={isMe} />

          <div className="flex gap-2 p-1 bg-neutral-900 rounded-2xl w-fit border border-white/5">
            {isMe && (
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-neutral-500 hover:text-white'}`}
                >
                    <LayoutDashboard size={18} />
                    Stats
                </button>
            )}
            
            <button
                onClick={() => setActiveTab('routines')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'routines' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-neutral-500 hover:text-white'}`}
            >
                <Archive size={18} />
                Routines
            </button>

            {isMe && (
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-neutral-500 hover:text-white'}`}
                >
                    <Settings size={18} />
                    Settings
                </button>
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && isMe && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatCard 
                 title="Routines" 
                 value={analyticsStats.totalRoutines} 
                 icon={<Target className="text-blue-400" size={24} />} 
                 sub="Active"
               />
               <StatCard 
                 title="Streak" 
                 value={analyticsStats.currentStreak} 
                 icon={<Flame className="text-orange-500" size={24} />} 
                 sub="Days"
               />
               <StatCard 
                 title="Completion" 
                 value={`${analyticsStats.completionPercent}%`} 
                 icon={<Activity className="text-lime-400" size={24} />} 
                 sub="Rate"
               />
               <StatCard 
                 title="Best Streak" 
                 value={analyticsStats.longestStreak} 
                 icon={<Trophy className="text-yellow-400" size={24} />} 
                 sub="Record"
               />
            </div>

            {/* Subscription Status */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 to-black rounded-2xl border border-lime-400/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center">
                        <Crown className="text-lime-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{subscriptionLoading ? 'Đang tải...' : subscriptionPlanName}</h3>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">{subscriptionDescription}</p>
                    </div>
                </div>
                <Link
                  to="/customer/subscriptions"
                  className="px-4 py-2 bg-lime-400 text-black text-xs font-bold rounded-lg hover:bg-lime-500 transition-all"
                >
                  {isPremiumActive ? 'MANAGE PLAN' : 'UPGRADE PRO'}
                </Link>
            </div>

            {/* Placeholder for Heatmap */}
            <div className="p-6 bg-neutral-900 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-2">
                        <Activity size={20} className="text-lime-400" />
                        Activity Log
                    </h3>
                    <span className="text-xs text-neutral-500">Last 12 months</span>
                </div>
                <Heatmap data={heatmapData} />
            </div>
          </div>
        )}

        {activeTab === 'routines' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {routinesLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-lime-400"></div>
              </div>
            ) : routines.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900 rounded-3xl border border-dashed border-white/10">
                <Archive size={48} className="mx-auto text-neutral-800 mb-4" />
                <p className="text-neutral-500 font-medium">
                  {isMe ? 'Chưa có routine nào. Tạo mới nhé!' : 'Thành viên này chưa có routine công khai.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
                    {isMe ? 'Your Routines' : 'Public Routines'}
                  </h3>
                  <span className="text-xs text-neutral-500">{routines.length} mục</span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {routines.map((routine) => (
                  <Link
                    to={`/customer/selfroutin/${routine.id}`}
                    key={routine.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black hover:border-lime-400/60 transition-all active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.22),transparent_45%)]" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-lime-300">
                        <Target size={18} />
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/55 to-transparent">
                      <h3 className="text-xs font-semibold text-white truncate">{routine.title}</h3>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-300">
                        <span>{routine.taskCount} task</span>
                        <span className="truncate ml-2">{repeatLabel(routine.repeatType, routine.repeatDays)}</span>
                      </div>
                      {isMe && (
                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="inline-flex items-center gap-1"><Eye size={10} /> {visibilityLabel(routine.visibility)}</span>
                          {routine.remindTime && <span className="inline-flex items-center gap-1"><Clock3 size={10} /> {routine.remindTime}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && isMe && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form
            onSubmit={handleUpdateProfile}
            className="rounded-2xl bg-neutral-900 p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2"><PencilLine size={18} /> Thông tin cá nhân</h2>
              {loading && <span className="text-xs text-neutral-400">Đang tải...</span>}
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Họ và tên <span className="text-red-400">*</span></span>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
              <p className="text-[11px] text-neutral-500">Field bắt buộc cho PATCH /api/Users/me</p>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Email</span>
              <input
                type="email"
                name="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl bg-neutral-800 px-3 py-3 text-neutral-400 outline-none"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Số điện thoại</span>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleProfileChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Avatar URL</span>
              <input
                type="text"
                name="avatarUrl"
                value={profile.avatarUrl}
                onChange={handleProfileChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="https://..."
              />
              <p className="text-[11px] text-neutral-500">Optional, chấp nhận http/https</p>
            </label>

            <div className="space-y-2 text-sm">
              <span className="text-neutral-300">Tải ảnh đại diện từ máy</span>
              <div className="rounded-xl border border-white/10 bg-neutral-800 p-3 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  disabled={uploadingAvatar}
                  className="w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-lime-400 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black"
                />
                <div className="flex items-center gap-3">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar-preview"
                      className="h-12 w-12 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-neutral-700 border border-white/10" />
                  )}
                  <p className="text-[11px] text-neutral-500">
                    {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Chọn ảnh để tự động upload và điền Avatar URL'}
                  </p>
                </div>
              </div>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Bio</span>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                className="h-28 w-full resize-none rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
              />
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-xl bg-lime-400 py-3 text-sm font-semibold text-black transition-all hover:bg-lime-500 disabled:opacity-70"
            >
              {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl bg-neutral-900 p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2"><KeyRound size={18} /> Đổi mật khẩu</h2>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Mật khẩu hiện tại <span className="text-red-400">*</span></span>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Mật khẩu mới <span className="text-red-400">*</span></span>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
              <p className="text-[11px] text-neutral-500">Tối thiểu 6 ký tự</p>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Xác nhận mật khẩu mới</span>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
            </label>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-70"
            >
              {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>

          <div className="lg:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-red-300">Đăng xuất tài khoản</h3>
                <p className="text-xs text-neutral-400 mt-1">Thoát phiên hiện tại và quay về màn hình đăng nhập.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-70"
              >
                <LogOut size={16} />
                {logoutLoading ? 'Đang đăng xuất...' : 'Logout'}
              </button>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, sub }) => (
    <div className="p-4 bg-neutral-900 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
            {icon}
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-[10px] text-neutral-500 font-medium">{sub}</span>
        </div>
    </div>
);

export default Profile;
