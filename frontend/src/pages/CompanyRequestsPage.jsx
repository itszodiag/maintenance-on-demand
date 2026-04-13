import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck2,
  ClipboardCheck,
  ListTodo,
  UserRoundCog,
} from 'lucide-react';
import { companyApi, serviceRequestsApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import {
  extractCollection,
  formatCompactNumber,
  formatDate,
  statusTone,
} from '../lib/dashboard.js';

export function CompanyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionKey, setActionKey] = useState('');

  const loadPage = async () => {
    try {
      setLoading(true);
      const [requestsResponse, techniciansResponse, assignmentsResponse] =
        await Promise.all([
          serviceRequestsApi.list(),
          companyApi.technicians(),
          companyApi.assignments(),
        ]);

      setRequests(extractCollection(requestsResponse));
      setTechnicians(extractCollection(techniciansResponse));
      setAssignments(extractCollection(assignmentsResponse));
    } catch (error) {
      setFeedback(error.message || 'Unable to load company requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const stats = useMemo(() => {
    return requests.reduce(
      (summary, request) => {
        const status = request.status || 'pending';
        summary.total += 1;
        summary[status] = (summary[status] || 0) + 1;
        return summary;
      },
      { total: 0 }
    );
  }, [requests]);

  const updateStatus = async (requestId, status) => {
    try {
      setActionKey(`status-${requestId}-${status}`);
      setFeedback('');
      const response = await serviceRequestsApi.updateStatus(requestId, status);
      setFeedback(response.message || 'Request status updated.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to update request status.');
    } finally {
      setActionKey('');
    }
  };

  const assignTechnician = async (requestId) => {
    const technicianId = selectedTechnicians[requestId];

    if (!technicianId) {
      setFeedback('Select a technician before assigning the job.');
      return;
    }

    try {
      setActionKey(`assign-${requestId}`);
      setFeedback('');
      const response = await companyApi.assign({
        service_request_id: requestId,
        technician_id: Number(technicianId),
      });
      setFeedback(response.message || 'Technician assigned successfully.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to assign technician.');
    } finally {
      setActionKey('');
    }
  };

  const technicianOptions = technicians.map((entry) => ({
    id: entry.technician?.user?.id,
    name:
      entry.technician?.user?.display_name ||
      entry.technician?.user?.name ||
      'Technician',
  }));

  return (
    <DashboardLayout
      title="Service Requests"
      subtitle="Track incoming jobs, update request status, and assign field staff."
      searchPlaceholder="Search requests, clients, services..."
    >
      <div className="space-y-6">
        {feedback && <FeedbackBanner message={feedback} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ListTodo}
            label="All requests"
            value={formatCompactNumber(stats.total)}
            hint="Visible to your company"
            tone="blue"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Accepted"
            value={formatCompactNumber(stats.accepted)}
            hint="Ready for delivery"
            tone="mint"
          />
          <StatCard
            icon={CalendarCheck2}
            label="Completed"
            value={formatCompactNumber(stats.completed)}
            hint="Finished interventions"
            tone="peach"
          />
          <StatCard
            icon={UserRoundCog}
            label="Assignments"
            value={formatCompactNumber(assignments.length)}
            hint="Jobs linked to technicians"
            tone="slate"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading request queue..." />
        ) : (
          <>
            <ChartCard
              title="Request queue"
              description="Manage request status and assign technicians using the existing backend actions."
              height="h-auto"
            >
              <div className="space-y-4">
                {requests.length === 0 && (
                  <EmptyBlock message="No service requests found for your company." />
                )}

                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-[28px] border border-slate-100 bg-slate-50/80 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            #{request.id} {request.service?.title || 'Service request'}
                          </h3>
                          <StatusBadge value={request.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                          Client:{' '}
                          <span className="font-semibold text-slate-700">
                            {request.client?.display_name ||
                              request.client?.name ||
                              'Client'}
                          </span>
                        </p>
                        <p className="text-sm text-slate-500">
                          Requested for {formatDate(request.requested_for || request.created_at)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.city || request.address || 'No location provided'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 xl:min-w-[420px]">
                        <div className="flex flex-wrap gap-2">
                          {['accepted', 'completed', 'rejected'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateStatus(request.id, status)}
                              disabled={actionKey === `status-${request.id}-${status}`}
                              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                                request.status === status
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100'
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {actionKey === `status-${request.id}-${status}`
                                ? 'Saving...'
                                : capitalize(status)}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <select
                            value={selectedTechnicians[request.id] || ''}
                            onChange={(event) =>
                              setSelectedTechnicians((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                            className="min-w-0 flex-1 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Select technician</option>
                            {technicianOptions.map((technician) => (
                              <option key={technician.id} value={technician.id}>
                                {technician.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => assignTechnician(request.id)}
                            disabled={actionKey === `assign-${request.id}`}
                            className="rounded-[18px] bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionKey === `assign-${request.id}`
                              ? 'Assigning...'
                              : 'Assign technician'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <DataTable
              title="Recent assignments"
              columns={['Request', 'Technician', 'Status', 'Client']}
              data={assignments.slice(0, 6).map((assignment) => ({
                id: assignment.id,
                Request: `#${assignment.service_request_id}`,
                Technician:
                  assignment.technician?.user?.display_name ||
                  assignment.technician?.user?.name ||
                  'Technician',
                Status: <StatusBadge value={assignment.status || 'assigned'} />,
                Client:
                  assignment.service_request?.client?.display_name ||
                  assignment.serviceRequest?.client?.display_name ||
                  assignment.serviceRequest?.client?.name ||
                  'Client',
              }))}
              emptyLabel="No assignments created yet."
            />
          </>
        )}
      </div>
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(value)}`}
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
    <div className="rounded-[24px] bg-white px-5 py-8 text-center text-sm text-slate-500">
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
