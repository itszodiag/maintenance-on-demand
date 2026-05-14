import {
  Bell,
  BriefcaseBusiness,
  MapPinned,
  MessageCircle,
  Moon,
  Search,
  ShoppingBag,
  Sun,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { useAuthStore } from '../../state/authStore.js';
import { useThemeStore } from '../../state/themeStore.js';
import { useNotificationPolling } from '../../state/notificationStore.js';
import { ChatWidget } from '../ChatWidget.jsx';
import { ProfileDropdown } from './ProfileDropdownNew.jsx';
import { getDashboardPathForRole } from '../../lib/roleRoutes.js';

const navItems = [
  { label: 'Services', to: '/services', icon: BriefcaseBusiness },
  { label: 'Marketplace', to: '/marketplace', icon: ShoppingBag },
  { label: 'Map', to: '/services?view=map', icon: MapPinned },
];

export function AppLayout({ dashboard = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const notifications = useNotificationPolling((state) => state.items);
  const unreadCount = useNotificationPolling((state) => state.unreadCount);
  const [query, setQuery] = useState('');

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // DEBUG LOGGING
  useEffect(() => {
    console.log('[DEBUG] AppLayout MOUNTED');
    return () => console.log('[DEBUG] AppLayout UNMOUNTED');
  }, []);

  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    setNotificationsOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

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
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-lg font-black text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                MOD
              </div>
            </Link>
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

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>

                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen((current) => !current);
                    }}
                    className="relative inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div
                      className="absolute right-0 top-full z-9999 mt-2 w-[340px] rounded-[24px] border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl shadow-blue-100/60 dark:shadow-none"
                      style={{ position: 'absolute', right: 0, top: '100%' }}
                    >
                      <div className="flex items-center justify-between px-2 pb-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Notifications
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Messages, requests, and payment updates.
                          </p>
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-sm font-semibold text-blue-700 dark:text-blue-400"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="space-y-2">
                        {recentNotifications.length ? (
                          recentNotifications.map((item) => (
                            <Link
                              key={item.id}
                              to={getNotificationPath(item)}
                              onClick={() => setNotificationsOpen(false)}
                              className={clsx(
                                'block rounded-[20px] px-4 py-3 transition hover:bg-blue-50',
                                !item.read_at && 'bg-blue-50/70 dark:bg-slate-800/70'
                              )}
                            >
                              <p className="text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-blue-400">
                                {item.type}
                              </p>
                              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {item.data?.title ??
                                  item.data?.sender_name ??
                                  'New activity'}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {item.data?.message}
                              </p>
                            </Link>
                          ))
                        ) : (
                          <div className="rounded-[20px] bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:bg-slate-700 dark:text-slate-400">
                            You&apos;re all caught up.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <ProfileDropdown
                  user={user}
                  onLogout={logout}
                  avatarFailed={avatarFailed}
                  setAvatarFailed={setAvatarFailed}
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
