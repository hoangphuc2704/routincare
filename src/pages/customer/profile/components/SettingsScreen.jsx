import React from 'react';
import { KeyRound, PencilLine, LogOut } from 'lucide-react';

export default function SettingsScreen({
  handleUpdateProfile,
  loading,
  profile,
  handleProfileChange,
  handleAvatarFileUpload,
  uploadingAvatar,
  savingProfile,
  handleChangePassword,
  passwordForm,
  handlePasswordChange,
  changingPassword,
  handleLogout,
  logoutLoading,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleUpdateProfile} className="rounded-2xl bg-neutral-900 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PencilLine size={18} /> Thông tin cá nhân
          </h2>
          {loading && <span className="text-xs text-neutral-400">Đang tải...</span>}
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-neutral-300">
            Họ và tên <span className="text-red-400">*</span>
          </span>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleProfileChange}
            className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
            required
          />
          <p className="text-[11px] text-neutral-500">Trường bắt buộc cho API PATCH /api/Users/me</p>
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
          <span className="text-neutral-300">URL ảnh đại diện</span>
          <input
            type="text"
            name="avatarUrl"
            value={profile.avatarUrl}
            onChange={handleProfileChange}
            className="w-full rounded-xl bg-neutral-800 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="https://..."
          />
          <p className="text-[11px] text-neutral-500">Không bắt buộc, chấp nhận http/https</p>
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
                  alt="xem-trước-avatar"
                  className="h-12 w-12 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-neutral-700 border border-white/10" />
              )}
              <p className="text-[11px] text-neutral-500">
                {uploadingAvatar
                  ? 'Đang tải ảnh lên...'
                  : 'Chọn ảnh để tự động tải lên và điền URL ảnh đại diện'}
              </p>
            </div>
          </div>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-neutral-300">Giới thiệu</span>
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

      <form onSubmit={handleChangePassword} className="rounded-2xl bg-neutral-900 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <KeyRound size={18} /> Đổi mật khẩu
          </h2>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-neutral-300">
            Mật khẩu hiện tại <span className="text-red-400">*</span>
          </span>
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
          <span className="text-neutral-300">
            Mật khẩu mới <span className="text-red-400">*</span>
          </span>
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
            <p className="text-xs text-neutral-400 mt-1">
              Thoát phiên hiện tại và quay về màn hình đăng nhập.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-70"
          >
            <LogOut size={16} />
            {logoutLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </div>
    </div>
  );
}
