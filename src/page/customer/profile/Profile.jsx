import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, LayoutDashboard, Archive } from 'lucide-react';
import { message } from 'antd';
import userApi from '../../../api/userApi';
import authApi from '../../../api/authApi';
import analyticsApi from '../../../api/analyticsApi';
import routineApi from '../../../api/routineApi';
import mediaApi from '../../../api/mediaApi';

import subscriptionApi from '../../../api/subscriptionApi';

// import {} from 'lucide-react';

import { clearAllAuth, getRefreshToken } from '../../../utils/tokenService';
import UserHeader from '../../../components/UserHeader';
import DashboardScreen from './components/DashboardScreen';
import RoutinesScreen from './components/RoutinesScreen';
import SettingsScreen from './components/SettingsScreen';
import {
  formatSubscriptionDate,
  getCompletionPercent,
  isValidUrl,
  normalizeSubscriptionStatus,
  toNumber,
} from './utils/profileHelpers';

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

    // Listen for friend status changes to refresh profile
    const handleFriendStatusChange = () => {
      if (!isMe) {
        setTimeout(() => fetchUser(), 200);
      }
    };

    window.addEventListener('friendStatusChanged', handleFriendStatusChange);
    return () => window.removeEventListener('friendStatusChanged', handleFriendStatusChange);
  }, [userId, isMe, navigate]);

  const subscriptionStatus = normalizeSubscriptionStatus(currentSubscription?.status);
  const subscriptionPlanName =
    currentSubscription?.planName ||
    currentSubscription?.name ||
    (subscriptionStatus === 'Active' ? 'Premium Plan' : 'Free Plan');
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
          // Strategy 1: Public routines endpoint - /api/users/:id/routines/public
          try {
            const res = await userApi.getPublicRoutines(userId, { page: 1, pageSize: 100 });
            const raw = res.data?.data || res.data;
            data = raw?.items || raw?.records || (Array.isArray(raw) ? raw : []);
          } catch (err) {
            console.warn('getPublicRoutines not available:', err);
          }

          // Strategy 2: dedicated user routines endpoint
          if (data.length === 0) {
            try {
              const res = await routineApi.getPublicByUser(userId);
              const raw = res.data?.data || res.data;
              data = raw?.items || raw?.records || (Array.isArray(raw) ? raw : []);
            } catch (err) {
              console.warn('getPublicByUser not available:', err);
            }
          }

          // Strategy 3: search with userId filter
          if (data.length === 0) {
            try {
              const searchRes = await routineApi.searchPublic({ userId, pageSize: 100 });
              const searchData = searchRes.data?.data || searchRes.data;
              const allRoutines =
                searchData?.items ||
                searchData?.records ||
                (Array.isArray(searchData) ? searchData : []);
              data = allRoutines.filter((item) => {
                const ownerId =
                  item.userId ||
                  item.ownerId ||
                  item.createdBy ||
                  item.user?.id ||
                  item.user?.userId;
                return !ownerId || String(ownerId).toLowerCase() === String(userId).toLowerCase();
              });
            } catch (err) {
              console.warn('Search public routines failed:', err);
            }
          }

          // Strategy 4: public profile response
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

  const analyticsStats = {
    totalRoutines: toNumber(analytics?.totalRoutines ?? analytics?.total_routines),
    currentStreak: toNumber(analytics?.currentStreak ?? analytics?.current_streak),
    longestStreak: toNumber(analytics?.longestStreak ?? analytics?.longest_streak),
    completionPercent: getCompletionPercent(analytics),
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

      if (
        !signData?.uploadUrl ||
        !signData?.apiKey ||
        !signData?.timestamp ||
        !signData?.signature
      ) {
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
              {isMe ? 'My Space' : 'Member Profile'}
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              {isMe ? 'Manage your habits and stats.' : "Viewing user's routine and journey."}
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
          <DashboardScreen
            analyticsStats={analyticsStats}
            subscriptionLoading={subscriptionLoading}
            subscriptionPlanName={subscriptionPlanName}
            subscriptionDescription={subscriptionDescription}
            isPremiumActive={isPremiumActive}
            heatmapData={heatmapData}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesScreen routinesLoading={routinesLoading} routines={routines} isMe={isMe} />
        )}

        {activeTab === 'settings' && isMe && (
          <SettingsScreen
            handleUpdateProfile={handleUpdateProfile}
            loading={loading}
            profile={profile}
            handleProfileChange={handleProfileChange}
            handleAvatarFileUpload={handleAvatarFileUpload}
            uploadingAvatar={uploadingAvatar}
            savingProfile={savingProfile}
            handleChangePassword={handleChangePassword}
            passwordForm={passwordForm}
            handlePasswordChange={handlePasswordChange}
            changingPassword={changingPassword}
            handleLogout={handleLogout}
            logoutLoading={logoutLoading}
          />
        )}
      </div>
    </div>
  );
}

export default Profile;
