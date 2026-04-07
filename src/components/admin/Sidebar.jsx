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
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
