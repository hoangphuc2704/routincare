import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import useUsers from '../../../hooks/useUsers';

const ROLES = [
  { value: 'User', label: 'Người dùng' },
  { value: 'Admin', label: 'Quản trị viên' },
  { value: 'Moderator', label: 'Điều hành viên' },
];

export default function UserForm({ onClose, user }) {
  const { createUser, updateUser, loading } = useUsers();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'User',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.fullName || user.name || '',
        role: user.role || user.roleName || 'User',
        password: '',
      });
    } else {
      setFormData({ email: '', fullName: '', role: 'User', password: '' });
    }
    setErrors({});
  }, [user]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc với người dùng mới';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSubmit = { ...formData };

      // Don't send empty password on update
      if (user && !formData.password) {
        delete dataToSubmit.password;
      }

      if (user?.id) {
        await updateUser(user.id, dataToSubmit);
      } else {
        await createUser(dataToSubmit);
      }
      onClose();
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <Modal
      title={user ? 'Sửa người dùng' : 'Thêm người dùng mới'}
      open={true}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="admin-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
            disabled={!!user}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vai trò *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Password Field - Only for new users */}
        {!user && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {loading ? 'Đang xử lý...' : user ? 'Cập nhật người dùng' : 'Tạo người dùng'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
