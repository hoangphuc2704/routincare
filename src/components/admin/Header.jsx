import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import styles from './AdminLayout.module.css';

export default function Header() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    message.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* Left Side - Title */}
      <div>
        <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
      </div>

      {/* Right Side - User Info & Logout */}
      <div className="flex items-center gap-6">
        {user && (
          <div className="text-right border-r border-white/10 pr-6">
            <p className="text-sm font-bold text-white">{user.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <p className="text-xs text-purple-400 font-semibold mt-1">
              {user.roleName || user.role || 'Admin'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
