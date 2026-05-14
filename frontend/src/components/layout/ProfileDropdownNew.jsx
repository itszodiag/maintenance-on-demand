import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Pencil,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const menuItems = [
  {
    id: 'view-profile',
    label: 'View Profile',
    icon: User,
    href: '/profile',
  },
  {
    id: 'edit-profile',
    label: 'Edit Profile',
    icon: Pencil,
    href: '/profile#edit',
  },
  {
    id: 'my-orders',
    label: 'My Orders',
    icon: ShoppingBag,
    href: '/profile#orders',
  },
  {
    id: 'order-status',
    label: 'Order Status',
    icon: ClipboardList,
    href: '/profile#order-status',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/profile#settings',
  },
];

export function ProfileDropdown({ user, onLogout }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const initials = (user?.display_name ?? user?.name ?? 'MOD')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Click-outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  const handleLogout = async () => {
    close();
    await onLogout();
    navigate('/');
  };

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : user?.role === 'company'
        ? 'Company'
        : user?.role === 'vendor'
          ? 'Vendor'
          : user?.role === 'technician'
            ? 'Technician'
            : 'Client';

  return (
    <div className="relative z-[100]">
      {/* ── Trigger Button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={clsx(
          'group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 pointer-events-auto',
          'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:shadow-md',
          isOpen && 'ring-2 ring-blue-400/50 shadow-md dark:ring-cyan-400/40'
        )}
      >
        <span className="relative">
          {user?.avatar && !avatarFailed ? (
            <img
              src={user.avatar}
              alt={user.display_name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-100 dark:ring-cyan-900/50"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white ring-2 ring-blue-100 dark:from-teal-500 dark:to-cyan-600 dark:ring-cyan-900/50">
              {initials}
            </span>
          )}
          <span
            className={clsx(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900',
              user?.is_online ? 'bg-emerald-500' : 'bg-slate-400'
            )}
          />
        </span>

        <span className="hidden text-left lg:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {user?.display_name}
          </span>
          <span className="block max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400">
            {user?.email}
          </span>
        </span>

        <ChevronDown
          className={clsx(
            'h-4 w-4 text-slate-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-3 w-80 origin-top-right rounded-[24px] border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none shadow-blue-200/50 overflow-hidden z-[100]"
        >
          {/* User Info Header */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-teal-700 dark:to-cyan-900 p-4">
            <div className="flex items-center gap-3">
              <span className="relative shrink-0">
                {user?.avatar && !avatarFailed ? (
                  <img
                    src={user.avatar}
                    alt={user.display_name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/50"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-black text-white backdrop-blur">
                    {initials}
                  </span>
                )}
                <span
                  className={clsx(
                    'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-blue-600 dark:border-teal-800',
                    user?.is_online ? 'bg-emerald-400' : 'bg-slate-400'
                  )}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {user?.display_name}
                </p>
                <p className="truncate text-xs text-blue-100/90 dark:text-cyan-100/90">
                  {user?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      user?.is_online
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'bg-slate-400/20 text-slate-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        user?.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      )}
                    />
                    {user?.is_online ? 'Online' : 'Offline'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-blue-50/50 text-blue-600 dark:bg-slate-800 dark:text-cyan-400 group-hover:bg-blue-100 dark:group-hover:bg-cyan-900/30">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <LogOut className="h-4 w-4" />
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

