import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  ScrollText,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  UserCog,
  UserRoundCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../state/authStore.js';
import { getRoleLabel } from '../../lib/roleRoutes.js';

const navigationByRole = {
  admin: [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Companies', to: '/admin/companies', icon: Building2 },
    { label: 'Services', to: '/admin/services', icon: BriefcaseBusiness },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Requests', to: '/admin/requests', icon: ClipboardCheck },
    { label: 'Orders', to: '/admin/orders', icon: Truck },
    { label: 'Reviews', to: '/admin/reviews', icon: Star },
  ],
  company: [
    { label: 'Overview', to: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Services', to: '/company/services', icon: Wrench },
    { label: 'Requests', to: '/company/requests', icon: ClipboardCheck },
    { label: 'Technicians', to: '/company/technicians', icon: UserRoundCog },
  ],
  vendor: [
    { label: 'Overview', to: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Products', to: '/vendor/products', icon: Package },
    { label: 'Orders', to: '/vendor/orders', icon: Truck },
  ],
  technician: [
    { label: 'Overview', to: '/tech/dashboard', icon: LayoutDashboard },
    { label: 'Services', to: '/tech/services', icon: Wrench },
    { label: 'Tasks', to: '/tech/tasks', icon: ClipboardCheck },
    { label: 'Invitations', to: '/tech/invitations', icon: Mail },
    { label: 'Reports', to: '/tech/reports', icon: ScrollText },
  ],
};

export function DashboardSidebar() {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);

  const links = useMemo(() => navigationByRole[user?.role] ?? [], [user?.role]);
  const roleLabel = getRoleLabel(user?.role);
  const initials = (user?.display_name ?? user?.name ?? 'MOD')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed left-4 top-4 z-[120] flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg lg:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-[110] w-[270px] transform border-r border-white/70 bg-white/90 px-5 pb-6 pt-5 shadow-[0_35px_90px_-45px_rgba(37,99,235,0.55)] backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-500 text-xl font-black text-white shadow-[0_20px_40px_-18px_rgba(37,99,235,0.8)]">
              MOD
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Control Center
              </p>
              <h1 className="text-lg font-black text-slate-900">{roleLabel}</h1>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-500 p-5 text-white shadow-[0_28px_55px_-30px_rgba(59,130,246,0.95)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                  Workspace
                </p>
                <p className="mt-2 text-lg font-bold">
                  {user?.display_name ?? user?.name}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-sm font-black">
                {initials}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-white/70">Role</p>
                <p className="mt-1 font-semibold">{roleLabel}</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-white/70">Status</p>
                <p className="mt-1 font-semibold">
                  {user?.is_verified ? 'Verified' : 'Review'}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm font-semibold transition',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.85)]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-[26px] border border-slate-100 bg-slate-50/90 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                {user?.role === 'admin' ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : user?.role === 'company' ? (
                  <Building2 className="h-5 w-5" />
                ) : user?.role === 'vendor' ? (
                  <BarChart3 className="h-5 w-5" />
                ) : (
                  <Settings2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Focused workspace
                </p>
                <p className="text-xs text-slate-500">
                  Only your role tools are visible here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] bg-slate-950/40 lg:hidden"
        />
      )}
    </>
  );
}
