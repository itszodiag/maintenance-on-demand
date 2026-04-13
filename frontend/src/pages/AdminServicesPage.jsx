import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, Clock3, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import {
  extractCollection,
  formatCompactNumber,
  formatCurrency,
  statusTone,
} from '../lib/dashboard.js';

const serviceStatuses = ['pending', 'active', 'rejected'];

function emptyServiceForm() {
  return {
    title: '',
    description: '',
    category: '',
    price: '',
    city: '',
    status: 'pending',
    provider_role: 'company',
    provider_user_id: '',
    latitude: '',
    longitude: '',
  };
}

export function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyServiceForm());
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [servicesResponse, providersResponse] = await Promise.all([
        adminApi.services(),
        adminApi.users(),
      ]);

      setServices(extractCollection(servicesResponse));
      setProviders(
        extractCollection(providersResponse).filter((user) =>
          ['company', 'technician'].includes(user.role)
        )
      );
    } catch (error) {
      setFeedback(error.message || 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const counts = useMemo(() => {
    return services.reduce(
      (summary, service) => {
        const status = service.status || 'pending';
        summary.total += 1;
        summary[status] = (summary[status] || 0) + 1;
        return summary;
      },
      { total: 0 }
    );
  }, [services]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => provider.role === form.provider_role);
  }, [form.provider_role, providers]);

  const openCreate = () => {
    setEditor({ mode: 'create', serviceId: null });
    setForm(emptyServiceForm());
  };

  const openEdit = (service) => {
    const providerRole = service.provider?.role === 'technician' ? 'technician' : 'company';
    const providerUserId = service.provider?.id ? String(service.provider.id) : '';

    setEditor({ mode: 'edit', serviceId: service.id });
    setForm({
      title: service.title || '',
      description: service.description || '',
      category: service.category || '',
      price: service.price ?? '',
      city: service.city || '',
      status: service.status || 'pending',
      provider_role: providerRole,
      provider_user_id: providerUserId,
      latitude: service.latitude ?? '',
      longitude: service.longitude ?? '',
    });
  };

  const closeEditor = () => {
    setEditor(null);
    setForm(emptyServiceForm());
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveService = async () => {
    try {
      setSaving(true);
      setFeedback('');

      const payload = {
        ...form,
        provider_user_id: Number(form.provider_user_id),
        price: Number(form.price),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };

      const response =
        editor?.mode === 'edit'
          ? await adminApi.updateService(editor.serviceId, payload)
          : await adminApi.createService(payload);

      setFeedback(response.message || 'Service saved successfully.');
      closeEditor();
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to save service.');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (service) => {
    if (!window.confirm(`Delete service "${service.title}"?`)) {
      return;
    }

    try {
      setActionId(service.id);
      setFeedback('');
      const response = await adminApi.deleteService(service.id);
      setFeedback(response.message || 'Service deleted successfully.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to delete service.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="Service Control"
      subtitle="Create, update, moderate, and remove company or technician services."
      searchPlaceholder="Search services, providers, cities..."
    >
      <div className="space-y-6">
        {feedback ? <FeedbackBanner message={feedback} /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BriefcaseBusiness}
            label="All services"
            value={formatCompactNumber(counts.total)}
            hint="Marketplace listings"
            tone="blue"
          />
          <StatCard
            icon={Clock3}
            label="Pending"
            value={formatCompactNumber(counts.pending)}
            hint="Awaiting review"
            tone="mint"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={formatCompactNumber(counts.active)}
            hint="Visible to clients"
            tone="peach"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={formatCompactNumber(counts.rejected)}
            hint="Blocked from listing"
            tone="slate"
          />
        </div>

        <ChartCard
          title="Admin actions"
          description="Service records can now be managed directly from the admin workspace."
          height="h-auto"
        >
          <div className="flex flex-wrap items-center gap-3">
            {serviceStatuses.map((status) => (
              <span
                key={status}
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(status)}`}
              >
                {capitalize(status)}
              </span>
            ))}
            <button
              type="button"
              onClick={openCreate}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Service
            </button>
          </div>
        </ChartCard>

        {loading ? (
          <LoadingPanel label="Loading services..." />
        ) : (
          <DataTable
            title="Managed services"
            columns={[
              'Title',
              'Provider',
              'City',
              'Price',
              'Status',
              'Actions',
            ]}
            data={services.map((service) => ({
              id: service.id,
              Title: service.title,
              Provider:
                service.provider?.display_name ||
                service.provider?.name ||
                'Provider',
              City: service.city || '-',
              Price: formatCurrency(service.price),
              Status: <StatusBadge value={service.status || 'pending'} />,
              Actions: (
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Pencil}
                    onClick={() => openEdit(service)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    tone="danger"
                    onClick={() => deleteService(service)}
                    disabled={actionId === service.id}
                  />
                </div>
              ),
            }))}
            emptyLabel="No services found."
          />
        )}
      </div>

      {editor ? (
        <ServiceEditorModal
          mode={editor.mode}
          form={form}
          providers={filteredProviders}
          onChange={updateForm}
          onClose={closeEditor}
          onSubmit={saveService}
          loading={saving}
        />
      ) : null}
    </DashboardLayout>
  );
}

function ServiceEditorModal({
  mode,
  form,
  providers,
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  const isEdit = mode === 'edit';

  return (
    <ModalShell
      title={isEdit ? 'Update Service' : 'Create Service'}
      subtitle="Attach a service to a company or technician account."
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            value={form.category}
            onChange={(event) => onChange('category', event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Price">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(event) => onChange('price', event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="City">
          <input
            type="text"
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Provider type">
          <select
            value={form.provider_role}
            onChange={(event) => {
              onChange('provider_role', event.target.value);
              onChange('provider_user_id', '');
            }}
            className={inputClassName}
          >
            <option value="company">Company</option>
            <option value="technician">Technician</option>
          </select>
        </Field>
        <Field label="Provider account">
          <select
            value={form.provider_user_id}
            onChange={(event) => onChange('provider_user_id', event.target.value)}
            className={inputClassName}
          >
            <option value="">Select provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.display_name || provider.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(event) => onChange('status', event.target.value)}
            className={inputClassName}
          >
            {serviceStatuses.map((status) => (
              <option key={status} value={status}>
                {capitalize(status)}
              </option>
            ))}
          </select>
        </Field>
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

      <Field label="Description">
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
          className={inputClassName}
        />
      </Field>

      <ModalActions
        loading={loading}
        submitLabel={isEdit ? 'Update Service' : 'Create Service'}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </ModalShell>
  );
}

function ActionButton({ label, icon: Icon, tone = 'default', ...props }) {
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
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(value)}`}
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

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
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
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ loading, submitLabel, onClose, onSubmit }) {
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
        type="button"
        onClick={onSubmit}
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

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';
