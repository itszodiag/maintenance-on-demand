import {
  Bell,
  Search,
  Settings,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationPolling } from '../../state/notificationStore.js';
import { useUIStore } from '../../state/uiStore.js';
import { ProfileDropdown } from '../layout/ProfileDropdownNew.jsx';
import { NotificationModal } from '../layout/NotificationModal.jsx';

export function DashboardTopbar({
  title,
  subtitle,
  searchPlaceholder,
  user,
  onLogout,
}) {
  const notifications = useNotificationPolling((state) => state.items);
  const unreadCount = useNotificationPolling((s) => s.unreadCount);
  const fetchNotifications = useNotificationPolling((s) => s.fetch);
  const markAllRead = useNotificationPolling((s) => s.markAllRead);
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);

  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);

  const newOrderAlerts = useMemo(
    () => notifications.filter((item) => item.type === 'order' && !item.read_at).length,
    [notifications]
  );

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
      setNotificationsOpen(true);
    } else {
      setNotificationsOpen(false);
    }
  }, [showNotifications, fetchNotifications, setNotificationsOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-500" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100 lg:text-xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400 lg:text-sm">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-visible z-50">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-64 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 py-2 pl-9 pr-4 text-sm text-slate-700 dark:text-slate-300 outline-none transition-all focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-blue-100/50 dark:focus:ring-blue-900/50 lg:w-80"
            />
          </div>

          {/* Notification Bell Button */}
          <button
            ref={bellRef}
            type="button"
            onClick={toggleNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:scale-105 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Toggle notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          <Link
            to="/profile#settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:scale-105 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Settings className="h-4 w-4" />
          </Link>

          {user && (
            <ProfileDropdown
              user={user}
              onLogout={onLogout}
              newOrderCount={newOrderAlerts}
            />
          )}
        </div>
      </div>

      {/* Notification Dropdown */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={closeNotifications}
        unreadCount={unreadCount}
        items={notifications}
        onMarkAllRead={markAllRead}
        triggerRef={bellRef}
      />
    </header>
  );
}
