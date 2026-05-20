import {
  Bell,
  BriefcaseBusiness,
  MapPinned,
  MessageCircle,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useAuthStore } from '../../state/authStore.js';
import { useNotificationPolling } from '../../state/notificationStore.js';
import { useUIStore } from '../../state/uiStore.js';
import { ChatWidget } from '../ChatWidget.jsx';
import { ProfileDropdown } from './ProfileDropdownNew.jsx';
import { NotificationModal } from './NotificationModal.jsx';
import { getDashboardPathForRole } from '../../lib/roleRoutes.js';
import { Logo } from '../Logo.jsx';

const navItems = [
  { label: 'Services', to: '/services', icon: BriefcaseBusiness },
  { label: 'Marketplace', to: '/marketplace', icon: ShoppingBag },
  { label: 'Map', to: '/services?view=map', icon: MapPinned },
];

export function AppLayout({ dashboard = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const notifications = useNotificationPolling((state) => state.items);
  const unreadCount = useNotificationPolling((s) => s.unreadCount);
  const fetchNotifications = useNotificationPolling((s) => s.fetch);
  const markAllRead = useNotificationPolling((s) => s.markAllRead);
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);

  const [query, setQuery] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);

  // DEBUG LOGGING
  useEffect(() => {
    console.log('[DEBUG] AppLayout MOUNTED');
    return () => console.log('[DEBUG] AppLayout UNMOUNTED');
  }, []);

  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const newOrderAlerts = useMemo(
    () => notifications.filter((item) => item.type === 'order' && !item.read_at).length,
    [notifications]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

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

  const getNotificationPath = (notification) => {
    const data = notification.data || {};
    switch (notification.type) {
      case 'message':
        return `/chat/${data.conversation_id}`;
      case 'request':
        return `/requests/${data.request_id}`;
      case 'order':
        return `/orders/${data.order_id}`;
      default:
        return '/notifications';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.45),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_35%,_#f8fbff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(30,41,59,0.8),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#1e293b_35%,_#0f172a_100%)] pb-16">
      <header className="sticky top-0 z-40 border-b border-white/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-visible transition-colors duration-300">
        <div className="container-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between overflow-visible">
          <div className="flex items-center gap-3">
            <Logo />
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-3 rounded-full border border-blue-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 shadow-sm lg:mx-8 dark:border-slate-700 dark:bg-slate-800"
          >
            <Search className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search plumbing, tools, electricians, vendors..."
              className="w-full bg-transparent text-sm outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/50"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 z-50 overflow-visible">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            {user && (
              <>
                <IconLink to="/chat" label="Chat" icon={MessageCircle} />

                {/* Notification Bell Button */}
                <button
                  ref={bellRef}
                  type="button"
                  onClick={toggleNotifications}
                  className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                  aria-label="Toggle notifications"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <ProfileDropdown
                  user={user}
                  onLogout={logout}
                  newOrderCount={newOrderAlerts}
                />
              </>
            )}

            {!user && (
              <Link to="/auth" className="button-primary">
                Sign in
              </Link>
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

      <main
        className={clsx(
          'container-shell pt-8',
          dashboard && 'lg:max-w-[1600px]'
        )}
      >
        <Outlet />
      </main>

      <footer className="container-shell mt-16">
        <div className="glass-card flex flex-col gap-4 px-6 py-8 text-sm text-slate-600 dark:text-slate-400 lg:flex-row lg:items-center lg:justify-between dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Built for clients, technicians, companies, vendors, and admins.
            </p>
            <p>
              Search, request, chat, order, track, verify, and manage everything
              from one platform.
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/services">Services</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/chat">Chat</Link>
            <Link to={getDashboardPathForRole(user?.role)}>Dashboard</Link>
          </div>
        </div>
      </footer>

      {user && <ChatWidget />}
    </div>
  );
}



function IconLink({ to, label, icon: Icon, count = 0 }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
      {count > 0 && (
        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      )}
    </NavLink>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-400">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({ children, className = '' }) {
  return <div className={clsx('soft-panel p-5', className)}>{children}</div>;
}

export function StatCard({ label, value, tone = 'blue', hint }) {
  const tones = {
    blue: 'from-blue-600 via-blue-700 to-blue-900',
    sky: 'from-sky-500 via-cyan-500 to-blue-700',
    teal: 'from-teal-500 via-cyan-600 to-slate-900',
    amber: 'from-amber-400 via-orange-500 to-orange-700',
  };

  return (
    <div
      className={clsx(
        'rounded-[24px] bg-gradient-to-br p-5 text-white shadow-lg',
        tones[tone] ?? tones.blue
      )}
    >
      <p className="text-sm capitalize text-white/70">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {hint && <p className="mt-2 text-sm text-white/75">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const colorMap = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    unpaid: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <span
      className={clsx(
        'status-pill capitalize',
        colorMap[status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-blue-200 dark:border-slate-800 bg-blue-50/60 dark:bg-slate-900/60 px-6 py-12 text-center">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
