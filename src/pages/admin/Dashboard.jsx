import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useCategories from '../../hooks/useCategories';
import useUsers from '../../hooks/useUsers';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`text-4xl opacity-20`}>{icon}</div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-900 border border-white/10 hover:border-purple-600 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-purple-600/20"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-white font-semibold">{label}</p>
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
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-gray-400 text-lg">
          Manage your application settings, users, and content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="text-blue-400" />
        <StatCard title="Active Users" value={stats.activeUsers} icon="✅" color="text-green-400" />
        <StatCard
          title="Total Categories"
          value={stats.totalCategories}
          icon="📁"
          color="text-purple-400"
        />
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionButton
            label="Manage Users"
            icon="👤"
            onClick={() => navigate('/admin/users')}
          />
          <QuickActionButton
            label="Manage Categories"
            icon="📂"
            onClick={() => navigate('/admin/categories')}
          />
          <QuickActionButton
            label="Revenue Analytics"
            icon="💹"
            onClick={() => navigate('/admin/revenue')}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>Total Users Created</span>
            <span className="font-semibold text-white">{stats.totalUsers}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>Categories Available</span>
            <span className="font-semibold text-white">{stats.totalCategories}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Active Users</span>
            <span className="font-semibold text-green-400">{stats.activeUsers}</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-200 text-sm">
          💡 <strong>Pro Tip:</strong> Use the sidebar navigation to access Users, Categories, and
          other admin features. All changes are logged and saved automatically.
        </p>
      </div>
    </div>
  );
}
