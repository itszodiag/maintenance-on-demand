import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore.js';
import { useNotificationPolling } from '../../state/notificationStore.js';
import { DashboardSidebar } from './DashboardSidebar.jsx';
import { DashboardTopbar } from './DashboardTopbar.jsx';

export function DashboardLayout({
  title,
  subtitle,
  children,
  searchPlaceholder = 'Search dashboards, users, requests...',
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unreadNotifications = useNotificationPolling((state) => state.unreadCount);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#f7f8fd_45%,#eef3ff_100%)]">
      <DashboardSidebar />

      <div className="min-h-screen lg:pl-[290px]">
        <DashboardTopbar
          title={title}
          subtitle={subtitle}
          searchPlaceholder={searchPlaceholder}
          user={user}
          onLogout={handleLogout}
          unreadNotifications={unreadNotifications}
        />

        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
