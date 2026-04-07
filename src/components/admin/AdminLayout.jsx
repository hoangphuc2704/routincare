import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  return (
    <div className={styles.admin}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className={styles.main}>
        {/* Header */}
        <Header />

        {/* Page Content - Scrollable */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
