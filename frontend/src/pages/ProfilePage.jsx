import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Heart, Package, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileApi } from '../api/modules.js';
import {
  SectionCard,
  SectionHeading,
  StatusBadge,
} from '../components/layout/AppLayout.jsx';
import { useAuthStore } from '../state/authStore.js';
import { toFormData } from '../lib/formData.js';

export function ProfilePage() {
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    city: '',
    address: '',
    company_name: '',
    speciality: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    const data = await profileApi.get();
    setProfile(data);
    setForm({
      name: data.user.name ?? '',
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

  const saveProfile = async (event) => {
    event.preventDefault();
    const payload = toFormData({ ...form, avatar });
    const response = await profileApi.update(payload);
    setMessage(response.message);
    setSession({ token, user: response.user });
    await loadProfile();
  };

  if (!profile) {
    return (
      <div className="soft-panel p-6 text-slate-500">Loading profile...</div>
    );
  }

  const favorites = [
    ...(profile.favorites.services ?? []).map((item) => ({
      ...item,
      href: `/services/${item.id}`,
      label: item.category,
    })),
    ...(profile.favorites.products ?? []).map((item) => ({
      ...item,
      href: `/products/${item.id}`,
      label: item.brand,
    })),
    ...(profile.favorites.providers ?? []).map((item) => ({
      ...item,
      href: '/profile',
      label: item.role,
    })),
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title={profile.user.display_name}
        description="Edit your public information, then review requests, orders, and favorites from one place."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <SectionCard>
          <form onSubmit={saveProfile} className="grid gap-4">
            <div className="flex items-center gap-4 rounded-[24px] bg-slate-50 p-4">
              {profile.user.avatar ? (
                <img
                  src={profile.user.avatar}
                  alt={profile.user.display_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                  {profile.user.display_name?.slice(0, 2)?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  {profile.user.display_name}
                </p>
                <p className="text-sm text-slate-500">{profile.user.email}</p>
              </div>
            </div>
            <input
              className="field"
              placeholder="Name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
            <input
              className="field"
              placeholder="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
            <input
              className="field"
              placeholder="City"
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({ ...current, city: event.target.value }))
              }
            />
            <input
              className="field"
              placeholder="Address"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
            />
            <input
              className="field"
              placeholder="Company name"
              value={form.company_name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  company_name: event.target.value,
                }))
              }
            />
            <input
              className="field"
              placeholder="Speciality"
              value={form.speciality}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  speciality: event.target.value,
                }))
              }
            />
            <textarea
              className="field"
              rows="4"
              placeholder="Bio"
              value={form.bio}
              onChange={(event) =>
                setForm((current) => ({ ...current, bio: event.target.value }))
              }
            />
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
            />
            <button type="submit" className="button-primary">
              Save profile
            </button>
            {message && (
              <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {message}
              </p>
            )}
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryBox
                label="Orders"
                value={profile.orders.length}
                icon={Package}
              />
              <SummaryBox
                label="Requests"
                value={profile.requests.length}
                icon={Sparkles}
              />
              <SummaryBox
                label="Favorites"
                value={favorites.length}
                icon={Heart}
              />
            </div>
          </SectionCard>

          <SectionCard>
            <h3 id="orders" className="text-xl font-bold">
              Orders
            </h3>
            <div className="mt-4 space-y-3">
              {profile.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[20px] border border-blue-100 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.total} MAD | {order.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.payment_status} />
                    </div>
                  </div>
                  {order.can_pay && (
                    <Link
                      to={`/payments/order/${order.id}`}
                      className="button-secondary mt-4 inline-flex"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay now
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <h3 id="requests" className="text-xl font-bold">
              Requests
            </h3>
            <div className="mt-4 space-y-3">
              {profile.requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[20px] border border-blue-100 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{request.service?.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.address} | {request.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={request.status} />
                      {(request.order || request.can_pay) && (
                        <StatusBadge
                          status={request.order?.payment_status ?? 'pending'}
                        />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {request.description}
                  </p>
                  {request.images?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {request.images.slice(0, 3).map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={request.service?.title}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.status === 'accepted' &&
                      request.conversation_id && (
                        <Link
                          to={`/chat?conversation=${request.conversation_id}`}
                          className="button-secondary inline-flex"
                        >
                          Open Chat
                        </Link>
                      )}

                    {request.order &&
                      request.order.payment_status !== 'paid' && (
                        <Link
                          to={`/payments/order/${request.order.id}`}
                          className="button-secondary inline-flex"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay now
                        </Link>
                      )}

                    {request.status === 'accepted' && !request.order && (
                      <p className="text-sm text-slate-500">
                        Waiting for provider to send payment request.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <h3 id="favorites" className="text-xl font-bold">
              Favorites
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {favorites.map((item) => (
                <Link
                  key={`${item.href}-${item.id}`}
                  to={item.href}
                  className="rounded-[20px] border border-blue-100 p-4 transition hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">
                    {item.title ?? item.display_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[20px] bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-blue-700" />
      </div>
      <p className="mt-2 text-2xl font-black text-blue-800">{value}</p>
    </div>
  );
}
