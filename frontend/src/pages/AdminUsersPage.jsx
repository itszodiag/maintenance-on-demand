import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import {
  extractCollection,
  formatCompactNumber,
  statusTone,
} from '../lib/dashboard.js';

const filters = ['all', 'admin', 'company', 'vendor', 'technician', 'client'];
const roles = ['admin', 'company', 'vendor', 'technician', 'client'];

function emptyUserForm() {
  return {
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    company_name: '',
    bio: '',
    location: '',
    latitude: '',
    longitude: '',
    city: '',
    address: '',
    experience_years: '',
  };
}

function sanitizeUserPayload(form, mode) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    role: form.role,
    phone: form.phone.trim(),
    company_name: form.company_name.trim(),
    bio: form.bio.trim(),
    location: form.location.trim(),
    latitude: form.latitude === '' ? null : Number(form.latitude),
    longitude: form.longitude === '' ? null : Number(form.longitude),
    city: form.city.trim(),
    address: form.address.trim(),
    experience_years:
      form.experience_years === '' ? null : Number(form.experience_years),
  };

  if (!['company', 'vendor'].includes(payload.role)) {
    payload.company_name = '';
  }

  if (payload.role !== 'technician') {
    payload.experience_years = null;
  }

  if (payload.role !== 'client') {
    payload.address = '';
  }

  if (mode === 'edit' && !payload.password) {
    delete payload.password;
  }

  return payload;
}

function validateUserForm(form, mode) {
  if (!form.name.trim()) {
    return 'Full name is required.';
  }

  if (!form.email.trim()) {
    return 'Email is required.';
  }

  if (mode === 'create' && !form.password) {
    return 'Password is required.';
  }

  if (form.password && form.password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (['company', 'vendor'].includes(form.role) && !form.company_name.trim()) {
    return form.role === 'company'
      ? 'Company name is required.'
      : 'Store name is required.';
  }

  return '';
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyUserForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users();
      setUsers(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (activeFilter === 'all') {
      return users;
    }

    return users.filter((user) => user.role === activeFilter);
  }, [activeFilter, users]);

  const counts = useMemo(() => {
    return users.reduce(
      (summary, user) => {
        summary.total += 1;
        summary[user.role] = (summary[user.role] || 0) + 1;
        if (user.is_verified) {
          summary.verified += 1;
        }
        return summary;
      },
      { total: 0, verified: 0 }
    );
  }, [users]);

  const openCreate = () => {
    setEditor({ mode: 'create', userId: null });
    setForm(emptyUserForm());
    setFormError('');
  };

  const openEdit = (user) => {
    setEditor({ mode: 'edit', userId: user.id });
    setFormError('');
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'client',
      phone: user.phone || '',
      company_name: user.company_name || user.speciality || '',
      bio: user.bio || '',
      location: user.location || '',
      latitude: user.latitude ?? '',
      longitude: user.longitude ?? '',
      city: user.city || '',
      address: user.address || '',
      experience_years: user.experience_years ?? '',
    });
  };

  const closeEditor = () => {
    setEditor(null);
    setForm(emptyUserForm());
    setFormError('');
  };

  const updateForm = (field, value) => {
    setFormError('');
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === 'role') {
        if (!['company', 'vendor'].includes(value)) {
          next.company_name = '';
        }
        if (value !== 'technician') {
          next.experience_years = '';
        }
        if (value !== 'client') {
          next.address = '';
        }
      }

      return next;
    });
  };

  const saveUser = async () => {
    const validationError = validateUserForm(form, editor?.mode);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFeedback('');
      setFormError('');

      const payload = sanitizeUserPayload(form, editor?.mode);

      const response =
        editor?.mode === 'edit'
          ? await adminApi.updateUser(editor.userId, payload)
          : await adminApi.createUser(payload);

      setFeedback(response.message || 'User saved successfully.');
      closeEditor();
      await loadUsers();
    } catch (error) {
      setFeedback(error.message || 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.display_name || user.name}?`)) {
      return;
    }

    try {
      setActionId(user.id);
      setFeedback('');
      const response = await adminApi.deleteUser(user.id);
      setFeedback(response.message || 'User deleted successfully.');
      await loadUsers();
    } catch (error) {
      setFeedback(error.message || 'Unable to delete user.');
    } finally {
      setActionId(null);
    }
  };

  const toggleVerification = async (user) => {
    try {
      setActionId(user.id);
      setFeedback('');
      const response = await adminApi.verify(user.id, !user.is_verified);
      setFeedback(response.message || 'User verification updated.');
      await loadUsers();
    } catch (error) {
      setFeedback(error.message || 'Unable to update verification.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Create, update, verify, and remove platform members."
      searchPlaceholder="Search users, roles, cities..."
    >
      <div className="space-y-6">
        {feedback ? <FeedbackBanner message={feedback} /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total users"
            value={formatCompactNumber(counts.total)}
            hint="All registered accounts"
            tone="blue"
          />
          <StatCard
            icon={ShieldCheck}
            label="Verified"
            value={formatCompactNumber(counts.verified)}
            hint="Approved identities"
            tone="mint"
          />
          <StatCard
            icon={Building2}
            label="Companies"
            value={formatCompactNumber(counts.company)}
            hint="Managed business accounts"
            tone="peach"
          />
          <StatCard
            icon={UserRoundCog}
            label="Technicians"
            value={formatCompactNumber(counts.technician)}
            hint="Field specialists"
            tone="slate"
          />
        </div>

        <ChartCard
          title="Role filters"
          description="Switch between account groups and launch admin actions."
          height="h-auto"
        >
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-[0_20px_40px_-25px_rgba(37,99,235,0.9)]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'All roles' : capitalize(filter)}
              </button>
            ))}
            <button
              type="button"
              onClick={openCreate}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </ChartCard>

        {loading ? (
          <LoadingPanel label="Loading users..." />
        ) : (
          <DataTable
            title="Platform users"
            columns={[
              'Name',
              'Role',
              'Email',
              'City',
              'Verification',
              'Actions',
            ]}
            data={filteredUsers.map((user) => ({
              id: user.id,
              Name: user.display_name || user.name,
              Role: capitalize(user.role),
              Email: user.email,
              City: user.city || user.location || '-',
              Verification: (
                <StatusBadge value={user.is_verified ? 'verified' : 'review'} />
              ),
              Actions: (
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Pencil}
                    onClick={() => openEdit(user)}
                  />
                  <ActionButton
                    label={user.is_verified ? 'Unverify' : 'Verify'}
                    onClick={() => toggleVerification(user)}
                    disabled={actionId === user.id}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    tone="danger"
                    onClick={() => deleteUser(user)}
                    disabled={actionId === user.id}
                  />
                </div>
              ),
            }))}
            emptyLabel="No users matched this filter."
          />
        )}
      </div>

      {editor ? (
        <UserEditorModal
          mode={editor.mode}
          form={form}
          error={formError}
          onChange={updateForm}
          onClose={closeEditor}
          onSubmit={saveUser}
          loading={saving}
        />
      ) : null}
    </DashboardLayout>
  );
}

function UserEditorModal({
  mode,
  form,
  error,
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  const isEdit = mode === 'edit';
  const roleMeta = getRoleMeta(form.role);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <ModalShell
      title={isEdit ? 'Update User' : 'Create User'}
      subtitle={
        isEdit
          ? 'Adjust account information and profile details.'
          : 'Add a new platform user quickly.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">{roleMeta.title}</p>
          <p className="mt-1 text-sm text-slate-600">{roleMeta.description}</p>
        </div>

        {error ? (
          <div className="rounded-[20px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <Section title="Main Info">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <input
                type="text"
                value={form.name}
                onChange={(event) => onChange('name', event.target.value)}
                className={inputClassName}
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                className={inputClassName}
                required
              />
            </Field>
            <Field label={isEdit ? 'New password' : 'Password'}>
              <input
                type="password"
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
                className={inputClassName}
                placeholder={isEdit ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                required={!isEdit}
              />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(event) => onChange('role', event.target.value)}
                className={inputClassName}
                disabled={isEdit}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {capitalize(role)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input
                type="text"
                value={form.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                className={inputClassName}
              />
            </Field>
            {['company', 'vendor'].includes(form.role) ? (
              <Field label={form.role === 'company' ? 'Company name' : 'Store name'}>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(event) => onChange('company_name', event.target.value)}
                  className={inputClassName}
                  required
                />
              </Field>
            ) : null}

            {form.role === 'technician' ? (
              <Field label="Experience years">
                <input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(event) =>
                    onChange('experience_years', event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
            ) : null}

            <Field label="City">
              <input
                type="text"
                value={form.city}
                onChange={(event) => onChange('city', event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>
        </Section>

        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Optional Details
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Bio, location, coordinates, and address.
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvanced ? (
            <div className="space-y-4 border-t border-slate-100 px-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                {form.role !== 'admin' ? (
                  <Field label="Location">
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => onChange('location', event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                ) : null}

                <Field label="Latitude">
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) => onChange('latitude', event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Longitude">
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) => onChange('longitude', event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>

              {form.role !== 'client' && form.role !== 'admin' ? (
                <Field label="Bio / description">
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(event) => onChange('bio', event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              ) : null}

              {form.role === 'client' ? (
                <Field label="Full address">
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(event) => onChange('address', event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              ) : null}
            </div>
          ) : null}
        </div>

        <ModalActions
          loading={loading}
          submitLabel={isEdit ? 'Update User' : 'Create User'}
          onClose={onClose}
        />
      </form>
    </ModalShell>
  );
}

function ActionButton({
  label,
  icon: Icon = null,
  tone = 'default',
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        tone === 'danger'
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
        value
      )}`}
    >
      {capitalize(value)}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ loading, submitLabel, onClose }) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onClose}
        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}

function FeedbackBanner({ message }) {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-700">
      {message}
    </div>
  );
}

function LoadingPanel({ label }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_35px_80px_-45px_rgba(37,99,235,0.55)]">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRoleMeta(role) {
  switch (role) {
    case 'admin':
      return {
        title: 'Admin account',
        description: 'Full platform access for supervision, moderation, and management.',
      };
    case 'company':
      return {
        title: 'Company account',
        description: 'Manages service requests, technicians, and company operations.',
      };
    case 'vendor':
      return {
        title: 'Vendor account',
        description: 'Manages product catalog, stock, and sales activity.',
      };
    case 'technician':
      return {
        title: 'Technician account',
        description: 'Handles services, assignments, certifications, and availability.',
      };
    default:
      return {
        title: 'Client account',
        description: 'Books services, places orders, and tracks personal requests.',
      };
  }
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';
