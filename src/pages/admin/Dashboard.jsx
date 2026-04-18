import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useCategories from '../../hooks/useCategories';
import useUsers from '../../hooks/useUsers';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div
      className="border rounded-lg p-6"
      style={{
        backgroundColor: 'var(--admin-card)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, icon, onClick }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(170, 59, 255, 0.15)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--admin-border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-lg p-6 text-center transition-all duration-200"
      style={{
        backgroundColor: 'var(--admin-card)',
        borderColor: 'var(--admin-border)',
        border: '1px solid',
      }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>
        {label}
      </p>
    </button>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const { users, loading: usersLoading } = useUsers();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalCategories: categories.length,
      activeUsers: users.filter((u) => {
        const status = (u.status || 'active').toLowerCase();
        return status === 'active' || status === 'true' || u.status === true;
      }).length,
    });
  }, [users, categories]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--admin-text)' }}>
          Welcome to Admin Dashboard
        </h1>
        <p className="text-lg" style={{ color: 'var(--admin-text-secondary)' }}>
          Manage your application settings, users, and content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="var(--accent)" />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon="✅"
          color="var(--admin-success)"
        />
        <StatCard
          title="Tổng danh mục"
          value={stats.totalCategories}
          icon="📁"
          color="var(--accent)"
        />
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--admin-text)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionButton
            label="Quản lý người dùng"
            icon="👤"
            onClick={() => navigate('/admin/users')}
          />
          <QuickActionButton
            label="Quản lý danh mục"
            icon="📂"
            onClick={() => navigate('/admin/categories')}
          />
          <QuickActionButton
            label="Phân tích doanh thu"
            icon="💹"
            onClick={() => navigate('/admin/revenue')}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Tổng quan hệ thống</h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>Tổng người dùng đã tạo</span>
            <span className="font-semibold text-white">{stats.totalUsers}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>Danh mục hiện có</span>
            <span className="font-semibold text-white">{stats.totalCategories}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Người dùng hoạt động</span>
            <span className="font-semibold text-green-400">{stats.activeUsers}</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-200 text-sm">
          💡 <strong>Mẹo:</strong> Dùng thanh điều hướng bên trái để truy cập Người dùng, Danh mục
          và các tính năng quản trị khác. Mọi thay đổi đều được ghi nhận và lưu tự động.
        </p>
      </div>
    </div>
  );
}
