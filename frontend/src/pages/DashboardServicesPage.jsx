import { useEffect, useMemo, useState } from 'react';
import { ServiceForm } from '../components/forms/ServiceForm.jsx';
import { servicesApi } from '../api/modules.js';
import {
  SectionHeading,
  StatusBadge,
} from '../components/layout/AppLayout.jsx';
import { toFormData } from '../lib/formData.js';

const emptyServiceForm = {
  id: null,
  title: '',
  description: '',
  category: '',
  price: '',
  city: '',
  latitude: '',
  longitude: '',
  images: [],
};

export function DashboardServicesPage() {
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    try {
      const data = await servicesApi.mine();
      setServices(data.items ?? []);
    } catch (error) {
      setFeedback(error.message || 'Failed to load services.');
    }
  };

  useEffect(() => {
    loadServices().catch((error) => setFeedback(error.message));
  }, []);

  const openCreateModal = () => {
    setServiceForm(emptyServiceForm);
    setFeedback('');
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setServiceForm({ ...service, images: [] });
    setFeedback('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setServiceForm(emptyServiceForm);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = toFormData(serviceForm);
      const response = serviceForm.id
        ? await servicesApi.update(serviceForm.id, payload)
        : await servicesApi.create(payload);
      setFeedback(response.message || 'Service saved successfully.');
      setIsModalOpen(false);
      await loadServices();
    } catch (error) {
      setFeedback(error.message || 'Failed to save service.');
    } finally {
      setLoading(false);
    }
  };

  const removeService = async (id) => {
    if (!window.confirm('Delete this service?')) {
      return;
    }

    try {
      const response = await servicesApi.remove(id);
      setFeedback(response.message || 'Service deleted successfully.');
      await loadServices();
    } catch (error) {
      setFeedback(error.message || 'Failed to delete service.');
    }
  };

  const statusCount = useMemo(
    () =>
      services.reduce((acc, service) => {
        const key = service.status || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [services]
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Service Management"
        description="Manage your services with create, edit, and delete support. Click entries to edit."
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
          Create service
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
                  Status
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  City
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan="5"
                  >
                    No services found.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {service.title}
                    </td>
                    <td className="px-4 py-3">{service.price} MAD</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={service.status} />
                    </td>
                    <td className="px-4 py-3">{service.city}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="button-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeService(service.id)}
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
                {serviceForm.id ? 'Edit service' : 'Create service'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <ServiceForm
              form={serviceForm}
              onChange={(event) =>
                setServiceForm((current) => ({
                  ...current,
                  [event.target.name]: event.target.value,
                }))
              }
              onFiles={(event) =>
                setServiceForm((current) => ({
                  ...current,
                  images: Array.from(event.target.files ?? []),
                }))
              }
              onSubmit={submitForm}
              loading={loading}
              submitLabel={serviceForm.id ? 'Update service' : 'Create service'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
