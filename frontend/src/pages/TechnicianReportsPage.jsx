import { useEffect, useState } from 'react';
import { CalendarClock, FileBadge2, Upload, X } from 'lucide-react';
import { technicianApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import { extractCollection, formatCompactNumber, formatDate } from '../lib/dashboard.js';

const initialAvailability = {
  starts_at: '',
  ends_at: '',
  is_available: true,
};

const initialCertification = {
  title: '',
  organization: '',
  year: '',
  file: null,
};

export function TechnicianReportsPage() {
  const [availability, setAvailability] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailability);
  const [certificationForm, setCertificationForm] = useState(initialCertification);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState('');

  const loadPage = async () => {
    try {
      setLoading(true);
      const [availabilityResponse, certificationsResponse] = await Promise.all([
        technicianApi.availability(),
        technicianApi.certifications(),
      ]);

      setAvailability(extractCollection(availabilityResponse));
      setCertifications(extractCollection(certificationsResponse));
    } catch (error) {
      setFeedback(error.message || 'Unable to load reports workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const submitAvailability = async (event) => {
    event.preventDefault();

    try {
      setSubmitting('availability');
      setFeedback('');
      const response = await technicianApi.createAvailability(availabilityForm);
      setFeedback(response.message || 'Availability slot created.');
      setAvailabilityForm(initialAvailability);
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to create availability slot.');
    } finally {
      setSubmitting('');
    }
  };

  const removeAvailability = async (slotId) => {
    try {
      setSubmitting(`remove-${slotId}`);
      setFeedback('');
      const response = await technicianApi.removeAvailability(slotId);
      setFeedback(response.message || 'Availability slot deleted.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to delete availability slot.');
    } finally {
      setSubmitting('');
    }
  };

  const submitCertification = async (event) => {
    event.preventDefault();

    if (!certificationForm.file) {
      setFeedback('Please select a certification file before uploading.');
      return;
    }

    const payload = new FormData();
    payload.append('title', certificationForm.title);
    if (certificationForm.organization) {
      payload.append('organization', certificationForm.organization);
    }
    if (certificationForm.year) {
      payload.append('year', certificationForm.year);
    }
    payload.append('file', certificationForm.file);

    try {
      setSubmitting('certification');
      setFeedback('');
      const response = await technicianApi.uploadCertification(payload);
      setFeedback(response.message || 'Certification uploaded.');
      setCertificationForm(initialCertification);
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to upload certification.');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <DashboardLayout
      title="Reports & Qualifications"
      subtitle="Manage the documents and schedule data that support your technician profile."
      searchPlaceholder="Search certifications, availability..."
    >
      <div className="space-y-6">
        {feedback && <FeedbackBanner message={feedback} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={CalendarClock}
            label="Availability slots"
            value={formatCompactNumber(availability.length)}
            hint="Published work windows"
            tone="blue"
          />
          <StatCard
            icon={FileBadge2}
            label="Certifications"
            value={formatCompactNumber(certifications.length)}
            hint="Documents on file"
            tone="mint"
          />
          <StatCard
            icon={Upload}
            label="Uploads ready"
            value={formatCompactNumber(certifications.filter((item) => item.file).length)}
            hint="With attached proof"
            tone="peach"
          />
          <StatCard
            icon={CalendarClock}
            label="Upcoming coverage"
            value={formatCompactNumber(
              availability.filter((slot) => slot.is_available !== false).length
            )}
            hint="Available slots"
            tone="slate"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading reports workspace..." />
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Add availability"
                description="Create availability slots using the existing technician API."
                height="h-auto"
              >
                <form className="space-y-4" onSubmit={submitAvailability}>
                  <label className="block text-sm font-semibold text-slate-700">
                    Starts at
                    <input
                      type="datetime-local"
                      value={availabilityForm.starts_at}
                      onChange={(event) =>
                        setAvailabilityForm((current) => ({
                          ...current,
                          starts_at: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Ends at
                    <input
                      type="datetime-local"
                      value={availabilityForm.ends_at}
                      onChange={(event) =>
                        setAvailabilityForm((current) => ({
                          ...current,
                          ends_at: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submitting === 'availability'}
                    className="rounded-[18px] bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting === 'availability' ? 'Saving...' : 'Add availability'}
                  </button>
                </form>
              </ChartCard>

              <ChartCard
                title="Upload certification"
                description="Store supporting documents for your technician profile."
                height="h-auto"
              >
                <form className="space-y-4" onSubmit={submitCertification}>
                  <label className="block text-sm font-semibold text-slate-700">
                    Title
                    <input
                      type="text"
                      value={certificationForm.title}
                      onChange={(event) =>
                        setCertificationForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Organization
                      <input
                        type="text"
                        value={certificationForm.organization}
                        onChange={(event) =>
                          setCertificationForm((current) => ({
                            ...current,
                            organization: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Year
                      <input
                        type="number"
                        value={certificationForm.year}
                        onChange={(event) =>
                          setCertificationForm((current) => ({
                            ...current,
                            year: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-semibold text-slate-700">
                    File
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        setCertificationForm((current) => ({
                          ...current,
                          file: event.target.files?.[0] || null,
                        }))
                      }
                      className="mt-2 block w-full text-sm text-slate-600"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submitting === 'certification'}
                    className="rounded-[18px] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting === 'certification' ? 'Uploading...' : 'Upload certification'}
                  </button>
                </form>
              </ChartCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataTable
                title="Availability schedule"
                columns={['Starts', 'Ends', 'Status', 'Action']}
                data={availability.map((slot) => ({
                  id: slot.id,
                  Starts: formatDate(slot.starts_at, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  Ends: formatDate(slot.ends_at, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  Status: slot.is_available === false ? 'Unavailable' : 'Available',
                  Action: (
                    <button
                      type="button"
                      onClick={() => removeAvailability(slot.id)}
                      disabled={submitting === `remove-${slot.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      {submitting === `remove-${slot.id}` ? 'Removing...' : 'Remove'}
                    </button>
                  ),
                }))}
                emptyLabel="No availability slots created yet."
              />

              <DataTable
                title="Certification files"
                columns={['Title', 'Organization', 'Year', 'File']}
                data={certifications.map((certification) => ({
                  id: certification.id,
                  Title: certification.title,
                  Organization: certification.organization || 'Independent',
                  Year: certification.year || '-',
                  File: certification.file ? (
                    <a
                      href={certification.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Open file
                    </a>
                  ) : (
                    'No file'
                  ),
                }))}
                emptyLabel="No certifications uploaded yet."
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
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
