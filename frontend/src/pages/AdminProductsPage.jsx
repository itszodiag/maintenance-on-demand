import { useEffect, useMemo, useState } from 'react';
import { Boxes, CheckCircle2, Clock3, Package, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
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

const productStatuses = ['pending', 'active', 'rejected'];

function emptyProductForm() {
  return {
    title: '',
    description: '',
    category: '',
    brand: '',
    speciality: '',
    price: '',
    stock: '',
    city: '',
    status: 'pending',
    vendor_user_id: '',
    latitude: '',
    longitude: '',
  };
}

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyProductForm());
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [productsResponse, usersResponse] = await Promise.all([
        adminApi.products(),
        adminApi.users('vendor'),
      ]);

      setProducts(extractCollection(productsResponse));
      setVendors(extractCollection(usersResponse));
    } catch (error) {
      setFeedback(error.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const counts = useMemo(() => {
    return products.reduce(
      (summary, product) => {
        const status = product.status || 'pending';
        summary.total += 1;
        summary[status] = (summary[status] || 0) + 1;
        return summary;
      },
      { total: 0 }
    );
  }, [products]);

  const openCreate = () => {
    setEditor({ mode: 'create', productId: null });
    setForm(emptyProductForm());
  };

  const openEdit = (product) => {
    setEditor({ mode: 'edit', productId: product.id });
    setForm({
      title: product.title || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      speciality: product.speciality || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      city: product.city || '',
      status: product.status || 'pending',
      vendor_user_id: product.vendor?.id ? String(product.vendor.id) : '',
      latitude: product.latitude ?? '',
      longitude: product.longitude ?? '',
    });
  };

  const closeEditor = () => {
    setEditor(null);
    setForm(emptyProductForm());
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      setFeedback('');

      const payload = {
        ...form,
        vendor_user_id: Number(form.vendor_user_id),
        price: Number(form.price),
        stock: Number(form.stock),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };

      const response =
        editor?.mode === 'edit'
          ? await adminApi.updateProduct(editor.productId, payload)
          : await adminApi.createProduct(payload);

      setFeedback(response.message || 'Product saved successfully.');
      closeEditor();
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete product "${product.title}"?`)) {
      return;
    }

    try {
      setActionId(product.id);
      setFeedback('');
      const response = await adminApi.deleteProduct(product.id);
      setFeedback(response.message || 'Product deleted successfully.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to delete product.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="Product Control"
      subtitle="Manage vendor catalog entries with full admin CRUD."
      searchPlaceholder="Search products, vendors, brands..."
    >
      <div className="space-y-6">
        {feedback ? <FeedbackBanner message={feedback} /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="All products"
            value={formatCompactNumber(counts.total)}
            hint="Vendor catalog entries"
            tone="blue"
          />
          <StatCard
            icon={Clock3}
            label="Pending"
            value={formatCompactNumber(counts.pending)}
            hint="Waiting for review"
            tone="mint"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={formatCompactNumber(counts.active)}
            hint="Visible for sale"
            tone="peach"
          />
          <StatCard
            icon={Boxes}
            label="Rejected"
            value={formatCompactNumber(counts.rejected)}
            hint="Blocked from sale"
            tone="slate"
          />
        </div>

        <ChartCard
          title="Catalog actions"
          description="Products can now be created, updated, or removed from the admin dashboard."
          height="h-auto"
        >
          <div className="flex flex-wrap items-center gap-3">
            {productStatuses.map((status) => (
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
              Create Product
            </button>
          </div>
        </ChartCard>

        {loading ? (
          <LoadingPanel label="Loading products..." />
        ) : (
          <DataTable
            title="Managed products"
            columns={[
              'Title',
              'Vendor',
              'Category',
              'Price',
              'Status',
              'Actions',
            ]}
            data={products.map((product) => ({
              id: product.id,
              Title: product.title,
              Vendor:
                product.vendor?.display_name || product.vendor?.name || 'Vendor',
              Category: product.category || '-',
              Price: formatCurrency(product.price),
              Status: <StatusBadge value={product.status || 'pending'} />,
              Actions: (
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Pencil}
                    onClick={() => openEdit(product)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    tone="danger"
                    onClick={() => deleteProduct(product)}
                    disabled={actionId === product.id}
                  />
                </div>
              ),
            }))}
            emptyLabel="No products found."
          />
        )}
      </div>

      {editor ? (
        <ProductEditorModal
          mode={editor.mode}
          form={form}
          vendors={vendors}
          onChange={updateForm}
          onClose={closeEditor}
          onSubmit={saveProduct}
          loading={saving}
        />
      ) : null}
    </DashboardLayout>
  );
}

function ProductEditorModal({
  mode,
  form,
  vendors,
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  const isEdit = mode === 'edit';

  return (
    <ModalShell
      title={isEdit ? 'Update Product' : 'Create Product'}
      subtitle="Assign the product to a vendor account and keep inventory data current."
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
        <Field label="Brand">
          <input
            type="text"
            value={form.brand}
            onChange={(event) => onChange('brand', event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Speciality">
          <input
            type="text"
            value={form.speciality}
            onChange={(event) => onChange('speciality', event.target.value)}
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
        <Field label="Stock">
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => onChange('stock', event.target.value)}
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
        <Field label="Vendor account">
          <select
            value={form.vendor_user_id}
            onChange={(event) => onChange('vendor_user_id', event.target.value)}
            className={inputClassName}
          >
            <option value="">Select vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.display_name || vendor.name}
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
            {productStatuses.map((status) => (
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
        submitLabel={isEdit ? 'Update Product' : 'Create Product'}
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
