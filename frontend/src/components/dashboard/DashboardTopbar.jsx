import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function DashboardTopbar({
  title,
  subtitle,
  searchPlaceholder,
  user,
  onLogout,
  unreadNotifications = 0,
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[90] border-b border-slate-200/60 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-500" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 lg:text-xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500 lg:text-sm">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-64 rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100/50 lg:w-80"
            />
          </div>

          <Link
            to="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:scale-105 hover:bg-slate-200"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-lg">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:scale-105 hover:bg-slate-200"
          >
            <Settings className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.display_name ?? user.name}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white ring-2 ring-slate-100">
                  {(user?.display_name ?? user?.name ?? 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {open ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {user?.display_name ?? user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
