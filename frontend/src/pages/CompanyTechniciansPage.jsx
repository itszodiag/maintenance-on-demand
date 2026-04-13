import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react';
import { companyApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import {
  extractCollection,
  formatCompactNumber,
  statusTone,
} from '../lib/dashboard.js';

export function CompanyTechniciansPage() {
  const [team, setTeam] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    message: '',
    file: null,
  });
  const [inviting, setInviting] = useState(false);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [teamResponse, discoverResponse] = await Promise.all([
        companyApi.technicians(),
        companyApi.discoverTechnicians(),
      ]);

      setTeam(extractCollection(teamResponse));
      setDiscover(extractCollection(discoverResponse));
    } catch (error) {
      setFeedback(error.message || 'Unable to load technicians.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const attachedIds = useMemo(
    () =>
      new Set(team.map((entry) => entry.technician?.user?.id).filter(Boolean)),
    [team]
  );

  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return team;
    const query = searchQuery.toLowerCase();
    return team.filter((entry) => {
      const name = (
        entry.technician?.user?.display_name ||
        entry.technician?.user?.name ||
        ''
      ).toLowerCase();
      const email = (entry.technician?.user?.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [team, searchQuery]);

  const removeTechnician = async (technicianId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this technician from the team?'
      )
    ) {
      return;
    }
    try {
      setActionId(`remove-${technicianId}`);
      setFeedback('');
      await companyApi.removeTechnician(technicianId);
      setFeedback('Technician removed from team successfully.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to remove technician.');
    } finally {
      setActionId(null);
    }
  };

  const openInviteModal = (technician) => {
    setSelectedTechnician(technician);
    setInviteForm({ message: '', file: null });
    setFeedback('');
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedTechnician(null);
    setInviteForm({ message: '', file: null });
  };

  const inviteTechnician = async () => {
    if (!selectedTechnician) return;

    try {
      setInviting(true);
      setFeedback('');

      const response = await companyApi.sendInvitation(
        selectedTechnician.id,
        inviteForm.message,
        inviteForm.file
      );
      setFeedback(response.message || 'Invitation sent successfully.');
      setShowInviteModal(false);
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const discoverable = discover.filter((user) => !attachedIds.has(user.id));

  return (
    <DashboardLayout
      title="Technician Management"
      subtitle="Grow your technician network and keep the company team organized."
      searchPlaceholder="Search technicians, cities, specialties..."
    >
      <div className="space-y-6">
        {feedback && <FeedbackBanner message={feedback} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Attached technicians"
            value={formatCompactNumber(team.length)}
            hint="Assigned to your company"
            tone="blue"
          />
          <StatCard
            icon={ShieldCheck}
            label="Verified candidates"
            value={formatCompactNumber(discover.length)}
            hint="Available to attach"
            tone="mint"
          />
          <StatCard
            icon={BriefcaseBusiness}
            label="Active members"
            value={formatCompactNumber(
              team.filter((entry) => entry.status === 'active').length
            )}
            hint="Currently active"
            tone="peach"
          />
          <StatCard
            icon={UserRoundCog}
            label="Open matches"
            value={formatCompactNumber(discoverable.length)}
            hint="Not yet attached"
            tone="slate"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading technicians..." />
        ) : (
          <>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Current team
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and manage your technicians
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-[18px] border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 space-y-3">
                {filteredTeam.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {searchQuery.trim()
                      ? 'No technicians match your search.'
                      : 'No technicians joined yet.'}
                  </p>
                ) : (
                  filteredTeam.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.technician?.user?.display_name ||
                            entry.technician?.user?.name ||
                            'Technician'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {entry.technician?.user?.email || '-'}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {entry.technician?.experience_years || 0} yrs
                          </span>
                          <StatusBadge value={entry.status || 'active'} />
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          removeTechnician(entry.technician?.user?.id)
                        }
                        disabled={actionId !== null}
                        className="flex items-center gap-2 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <ChartCard
              title="Discover and attach technicians"
              description="Browse verified technicians and build your team."
              height="h-auto"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {discoverable.map((technician) => (
                  <div
                    key={technician.id}
                    className="rounded-[28px] border border-slate-100 bg-slate-50/80 p-5"
                  >
                    <p className="text-lg font-bold text-slate-900">
                      {technician.display_name || technician.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {technician.email}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {technician.city || 'No city'}
                      </span>
                      <StatusBadge
                        value={technician.is_verified ? 'verified' : 'review'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openInviteModal(technician)}
                      disabled={actionId !== null}
                      className="mt-5 inline-flex items-center gap-2 rounded-[18px] bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-4 w-4" />
                      Send Invitation
                    </button>
                  </div>
                ))}

                {discoverable.length === 0 && (
                  <EmptyBlock message="All available technicians are already attached." />
                )}
              </div>
            </ChartCard>
          </>
        )}
      </div>

      {showInviteModal && selectedTechnician && (
        <InviteTechnicianModal
          technician={selectedTechnician}
          form={inviteForm}
          onChange={(field, value) =>
            setInviteForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={inviteTechnician}
          onClose={closeInviteModal}
          loading={inviting}
        />
      )}
    </DashboardLayout>
  );
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
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

function FeedbackBanner({ message }) {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-700">
      {message}
    </div>
  );
}

function EmptyBlock({ message }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
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

function InviteTechnicianModal({
  technician,
  form,
  onChange,
  onSubmit,
  onClose,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-[30px] border border-white/70 bg-white/95 p-8 shadow-[0_35px_80px_-45px_rgba(37,99,235,0.55)] backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            Invite Technician
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-[24px] bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            {technician.display_name || technician.name}
          </p>
          <p className="text-sm text-slate-500">{technician.email}</p>
          <p className="mt-2 text-xs text-slate-400">
            {technician.city || 'No city specified'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Invitation Message (Optional)
            </label>
            <textarea
              value={form.message}
              onChange={(e) => onChange('message', e.target.value)}
              rows={4}
              placeholder="Add a personal message to your invitation..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attach File (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => onChange('file', e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (max 5MB)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
