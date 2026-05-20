import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Edit3,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileApi } from '../api/modules.js';
import {
  EmptyState,
  SectionCard,
  SectionHeading,
  StatusBadge,
} from '../components/layout/AppLayout.jsx';
import { useAuthStore } from '../state/authStore.js';
import { toFormData } from '../lib/formData.js';

const tabs = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];

const statusFilters = {
  All: () => true,
  Pending: (order) => ['pending', 'created', 'pending_payment'].includes((order.status || '').toLowerCase()),
  Accepted: (order) => ['accepted', 'confirmed'].includes((order.status || '').toLowerCase()),
  'In Progress': (order) => ['in_progress', 'processing', 'ongoing'].includes((order.status || '').toLowerCase()),
  Completed: (order) => ['completed', 'done'].includes((order.status || '').toLowerCase()),
  Cancelled: (order) => ['cancelled', 'rejected'].includes((order.status || '').toLowerCase()),
};

export function ProfilePage() {
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    display_name: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    address: '',
    company_name: '',
    speciality: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const loadProfile = useCallback(async () => {
    const data = await profileApi.get();
    setProfile(data);
    setForm({
      display_name: data.user.display_name ?? '',
      name: data.user.name ?? '',
      email: data.user.email ?? '',
      phone: data.user.phone ?? '',
      bio: data.user.bio ?? '',
      city: data.user.city ?? '',
      address: data.user.address ?? '',
      company_name: data.user.company_name ?? '',
      speciality: data.user.speciality ?? '',
    });
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const completion = useMemo(() => {
    if (!profile) {
      return 0;
    }
    const fields = ['display_name', 'name', 'email', 'phone', 'address', 'city', 'bio'];
    const filled = fields.filter((field) => Boolean(profile.user[field])).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const filteredOrders = useMemo(() => {
    if (!profile) {
      return [];
    }
    return (profile.orders ?? []).filter(statusFilters[activeTab]);
  }, [profile, activeTab]);

  const activity = useMemo(() => {
    if (!profile) {
      return [];
    }
    const orderEvents = (profile.orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      title: `Order #${order.id} ${order.status ?? 'updated'}`,
      meta: `${order.total || order.total_price || 'N/A'} MAD`,
      date: order.updated_at || order.created_at,
      icon: Package,
    }));

    const requestEvents = (profile.requests ?? []).map((request) => ({
      id: `request-${request.id}`,
      title: `${request.service?.title || 'Request'} ${request.status ?? 'updated'}`,
      meta: request.city || request.address || '',
      date: request.updated_at || request.created_at,
      icon: Sparkles,
    }));

    return [...orderEvents, ...requestEvents]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [profile]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const payload = toFormData({ ...form, avatar });
    const response = await profileApi.update(payload);
    setMessage(response.message || 'Profile updated successfully.');
    setSession({ token, user: response.user });
    await loadProfile();
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="soft-panel p-6 text-slate-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  const favorites = [
    ...(profile.favorites.services ?? []).map((item) => ({
      ...item,
      href: `/services/${item.id}`,
      label: item.category,
      title: item.title,
    })),
    ...(profile.favorites.products ?? []).map((item) => ({
      ...item,
      href: `/products/${item.id}`,
      label: item.brand,
      title: item.name,
    })),
    ...(profile.favorites.providers ?? []).map((item) => ({
      ...item,
      href: '/profile',
      label: item.role,
      title: item.display_name || item.name,
    })),
  ];

  const userRole = profile.user.role || 'client';
  const roleLabel =
    userRole === 'admin'
      ? 'Administrator'
      : userRole === 'company'
      ? 'Company'
      : userRole === 'vendor'
      ? 'Vendor'
      : userRole === 'technician'
      ? 'Technician'
      : 'Client';

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title={profile.user.display_name || profile.user.name}
        description="Your complete profile summary is here. Edit settings, manage orders, and track recent activity all from one page."
        action={
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="button-primary inline-flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit profile
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <SectionCard>
            <div className="grid gap-6 lg:grid-cols-[0.95fr,0.55fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)]">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-5">
                      {profile.user.avatar ? (
                        <img
                          src={profile.user.avatar}
                          alt={profile.user.display_name}
                          className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/20"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black text-white">
                          {profile.user.display_name?.slice(0, 2)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-300/80">Profile summary</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight">
                          {profile.user.display_name || profile.user.name}
                        </h1>
                        <p className="mt-2 text-sm text-slate-300/80">{profile.user.email}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:justify-items-end">
                      <div className="rounded-3xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">Role</p>
                        <p className="mt-2 text-base font-bold">{roleLabel}</p>
                      </div>
                      <div className="rounded-3xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">Status</p>
                        <p className="mt-2 text-base font-bold">
                          {profile.user.is_verified ? 'Verified' : 'Pending review'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard icon={Phone} label="Phone" value={profile.user.phone || 'Not set'} />
                  <InfoCard icon={MapPin} label="Location" value={profile.user.address ? `${profile.user.address}, ${profile.user.city || ''}` : 'Not set'} />
                  <InfoCard icon={Briefcase} label="Company" value={profile.user.company_name || 'N/A'} />
                  <InfoCard icon={Sparkles} label="Speciality" value={profile.user.speciality || 'N/A'} />
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Completion</p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{completion}%</p>
                  <div className="mt-4 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <StatTile icon={Package} label="Orders" value={(profile.orders ?? []).length} />
                  <StatTile icon={Sparkles} label="Requests" value={(profile.requests ?? []).length} />
                  <StatTile icon={Heart} label="Favorites" value={favorites.length} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="orders">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Manage order status from a single unified view.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const count = (profile.orders ?? []).filter(statusFilters[tab]).length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeTab === tab
                          ? 'bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab}
                      <span className="ml-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-slate-900 dark:text-blue-300">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {(filteredOrders.length > 0 ? filteredOrders : []).map((order) => (
                <div
                  key={order.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Order #{order.id}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {order.client?.display_name || order.client?.name || 'Client'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {order.city || order.address} • {order.total || order.total_price} MAD
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status ?? 'pending'} />
                      <StatusBadge status={order.payment_status ?? 'pending'} />
                      {order.can_pay && (
                        <Link
                          to={`/payments/order/${order.id}`}
                          className="button-secondary inline-flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <EmptyState
                  title="No orders in this view"
                  description="Switch tabs to see orders by their current status."
                />
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <h2 className="text-xl font-bold">Recent activity</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              A quick snapshot of the latest order and request updates.
            </p>
            <div className="mt-6 space-y-3">
              {activity.length > 0 ? (
                activity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.meta}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Now'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  No recent activity yet.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account overview</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Work smarter today</h2>
              </div>
              <ShieldCheck className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Account</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{profile.user.email}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Verification</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                  {profile.user.is_verified ? 'Verified' : 'Awaiting review'}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="settings">
            <h2 className="text-xl font-bold">Settings</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Use the edit panel to update your profile details, photo, and contact information.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Profile visibility</p>
                <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">Shared with trusted vendors and companies.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Support</p>
                <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">Need help? Visit the support center or chat with us.</p>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-2xl shadow-slate-950/50">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Edit profile</p>
                <h2 className="mt-2 text-2xl font-bold">Update your account details</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-6">
              <form onSubmit={saveProfile} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Full name
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Email
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.email}
                      type="email"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Phone
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    City
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.city}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, city: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Address
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.address}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, address: event.target.value }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Company
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.company_name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, company_name: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Speciality
                    <input
                      className="field bg-slate-900 text-white"
                      value={form.speciality}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, speciality: event.target.value }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Profile image
                    <input
                      className="field bg-slate-900 text-white"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-300">
                  Bio
                  <textarea
                    className="field bg-slate-900 text-white"
                    rows="4"
                    value={form.bio}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bio: event.target.value }))
                    }
                  />
                </label>
              </form>
            </div>
            <div className="border-t border-slate-800 bg-slate-950/95 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-400">
                  Cliquez sur "Enregistrer" pour sauvegarder votre profil.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="button-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    onClick={saveProfile}
                    className="button-primary inline-flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
              {message && (
                <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] bg-slate-950/90 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-300">{label}</p>
          <p className="mt-1 text-2xl font-black">{value}</p>
        </div>
      </div>
    </div>
  );
}
