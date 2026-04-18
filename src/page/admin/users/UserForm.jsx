import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import useUsers from '../../../hook/useUsers';

const ROLES = ['User', 'Admin', 'Moderator'];

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
        role: user.roleName || user.role || 'User',
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
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      title={user ? 'Edit User' : 'Add New User'}
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
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            disabled={!!user}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white disabled:opacity-50 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: '#3a3a3a',
              color: 'white',
              borderColor: errors.email ? '#ef4444' : 'var(--admin-border)',
            }}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: '#3a3a3a',
              color: 'white',
              borderColor: errors.fullName ? '#ef4444' : 'var(--admin-border)',
            }}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
            style={{
              backgroundColor: '#3a3a3a',
              color: 'white',
              borderColor: 'var(--admin-border)',
            }}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Password Field - Only for new users */}
        {!user && (
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                backgroundColor: '#3a3a3a',
                color: 'white',
                borderColor: errors.password ? '#ef4444' : 'var(--admin-border)',
              }}
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {loading ? 'Processing...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
