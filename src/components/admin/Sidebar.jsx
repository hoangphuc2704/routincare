import { Link, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import styles from './AdminLayout.module.css';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Revenue Analytics', path: '/admin/revenue' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    message.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo / Title */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--admin-border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          Admin Panel
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-colors duration-200`}
                style={
                  isActive(item.path)
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: 'var(--admin-text)',
                        fontWeight: '600',
                      }
                    : {
                        color: 'var(--admin-text-secondary)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.color = 'var(--admin-text)';
                    e.target.style.backgroundColor = 'var(--admin-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.color = 'var(--admin-text-secondary)';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg transition-colors duration-200"
          style={{
            backgroundColor: 'var(--admin-error)',
            color: 'white',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
