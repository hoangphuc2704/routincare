import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { message } from 'antd';
import userApi from '../../../api/userApi';
import analyticsApi from '../../../api/analyticsApi';
import { Activity, Flame, Target, Trophy, Settings, LayoutDashboard, Crown, Archive } from 'lucide-react';
import Heatmap from '../../../components/Heatmap';
import UserHeader from '../../../components/UserHeader';

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = userId ? await userApi.getById(userId) : await userApi.getMe();
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
        const res = await analyticsApi.getHeatmap();
        const data = res.data?.data || res.data;
        setHeatmapData(data);
      } catch (err) {
        console.error('Failed to fetch heatmap:', err);
      }
    };

    if (isMe) {
        fetchAnalytics();
        fetchHeatmap();
    }
    fetchUser();
  }, [userId, isMe]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const payload = {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
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
                 value={analytics?.totalRoutines || 0} 
                 icon={<Target className="text-blue-400" size={24} />} 
                 sub="Active"
               />
               <StatCard 
                 title="Streak" 
                 value={analytics?.currentStreak || 0} 
                 icon={<Flame className="text-orange-500" size={24} />} 
                 sub="Days"
               />
               <StatCard 
                 title="Completion" 
                 value={`${Math.round((analytics?.completionRate || 0) * 100)}%`} 
                 icon={<Activity className="text-lime-400" size={24} />} 
                 sub="Rate"
               />
               <StatCard 
                 title="Best Streak" 
                 value={analytics?.longestStreak || 0} 
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
                        <h3 className="font-bold text-sm">Free Plan</h3>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">Your current subscription</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-lime-400 text-black text-xs font-bold rounded-lg hover:bg-lime-500 transition-all">
                    UPGRADE PRO
                </button>
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
                <div className="text-center py-20 bg-neutral-900 rounded-3xl border border-dashed border-white/10">
                    <Archive size={48} className="mx-auto text-neutral-800 mb-4" />
                    <p className="text-neutral-500 font-medium">Public routines will appear here.</p>
                </div>
            </div>
        )}

        {activeTab === 'settings' && isMe && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form
            onSubmit={handleUpdateProfile}
            className="rounded-2xl bg-neutral-900 p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
              {loading && <span className="text-xs text-neutral-400">Đang tải...</span>}
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Họ và tên</span>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
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
              />
            </label>

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
              <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-neutral-300">Mật khẩu hiện tại</span>
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
              <span className="text-neutral-300">Mật khẩu mới</span>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
                required
              />
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
