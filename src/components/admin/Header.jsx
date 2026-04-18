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
    message.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* Left Side - Title */}
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>
          Admin Dashboard
        </h2>
      </div>

      {/* Right Side - User Info & Logout */}
      <div className="flex items-center gap-6">
        {user && (
          <div className="text-right border-r pr-6" style={{ borderColor: 'var(--admin-border)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>
              {user.fullName || 'Admin'}
            </p>
            <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
              {user.email}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--accent)' }}>
              {user.roleName || user.role || 'Admin'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
          style={{
            backgroundColor: 'var(--admin-border)',
            color: 'var(--admin-text)',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
