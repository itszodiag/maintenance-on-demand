import { useEffect, useMemo, useState } from 'react';
import { ProductForm } from '../components/forms/ProductForm.jsx';
import { productsApi } from '../api/modules.js';
import {
  SectionHeading,
  StatusBadge,
} from '../components/layout/AppLayout.jsx';
import { toFormData } from '../lib/formData.js';

const emptyProductForm = {
  id: null,
  title: '',
  description: '',
  category: '',
  brand: '',
  speciality: '',
  price: '',
  stock: '',
  city: '',
  latitude: '',
  longitude: '',
  images: [],
};

export function DashboardProductsPage() {
  const [products, setProducts] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productsApi.mine();
      setProducts(data.items ?? []);
    } catch (error) {
      setFeedback(error.message || 'Failed to load products.');
    }
  };

  useEffect(() => {
    loadProducts().catch((error) => setFeedback(error.message));
  }, []);

  const openCreateModal = () => {
    setProductForm(emptyProductForm);
    setFeedback('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductForm({ ...product, images: [] });
    setFeedback('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProductForm(emptyProductForm);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = toFormData(productForm);
      const response = productForm.id
        ? await productsApi.update(productForm.id, payload)
        : await productsApi.create(payload);
      setFeedback(response.message || 'Product saved successfully.');
      setIsModalOpen(false);
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const response = await productsApi.remove(id);
      setFeedback(response.message || 'Product deleted successfully.');
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || 'Failed to delete product.');
    }
  };

  const statusCount = useMemo(
    () =>
      products.reduce((acc, product) => {
        const key = product.status || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [products]
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Product Management"
        description="Manage your products with create, edit, and delete convenience."
      />

      {feedback && (
        <div className="rounded-[24px] bg-blue-50 px-5 py-3 text-sm text-blue-700">
          {feedback}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(statusCount).map(([key, value]) => (
            <span
              key={key}
              className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700"
            >
              {key}: {value}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="button-primary"
        >
          Create product
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Title
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Price
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Stock
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan="5"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {product.title}
                    </td>
                    <td className="px-4 py-3">{product.price} MAD</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="button-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="button-secondary"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-3 py-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {productForm.id ? 'Edit product' : 'Create product'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <ProductForm
              form={productForm}
              onChange={(event) =>
                setProductForm((current) => ({
                  ...current,
                  [event.target.name]: event.target.value,
                }))
              }
              onFiles={(event) =>
                setProductForm((current) => ({
                  ...current,
                  images: Array.from(event.target.files ?? []),
                }))
              }
              onSubmit={submitForm}
              loading={loading}
              submitLabel={productForm.id ? 'Update product' : 'Create product'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
