import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Search, Eye, XCircle } from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { extractCollection, formatDate, statusTone } from '../lib/dashboard.js';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await adminApi.requests();
      setRequests(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (!searchQuery.trim()) return filtered;
    const query = searchQuery.toLowerCase();
    return filtered.filter((request) => {
      const clientName = (
        request.client?.display_name ||
        request.client?.name ||
        ''
      ).toLowerCase();
      const serviceTitle = (request.service?.title || '').toLowerCase();
      return clientName.includes(query) || serviceTitle.includes(query);
    });
  }, [requests, searchQuery, statusFilter]);

  const updateStatus = async (requestId, newStatus) => {
    try {
      setFeedback('');
      await adminApi.updateRequestStatus(requestId, newStatus);
      setFeedback(`Request ${newStatus} successfully.`);
      await loadRequests();
    } catch (error) {
      setFeedback(error.message || 'Unable to update request status.');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <DashboardLayout
      title="Service Requests Management"
      subtitle="Monitor and manage all service requests across the platform."
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`rounded-[28px] px-6 py-4 text-sm font-semibold ${
              feedback.includes('Error')
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-100">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {requests.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-yellow-100">
                <ClipboardCheck className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {requests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-green-100">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Completed
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {requests.filter((r) => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Service Requests
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Filter and manage all service requests
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-[18px] border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-[18px] border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading requests...
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {searchQuery.trim() || statusFilter !== 'all'
                  ? 'No requests match your filters.'
                  : 'No service requests yet.'}
              </p>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {request.service?.title || 'Service'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Client:{' '}
                      {request.client?.display_name ||
                        request.client?.name ||
                        'Unknown'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(request.id, 'accepted')}
                          className="rounded-[18px] bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(request.id, 'cancelled')}
                          className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {request.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(request.id, 'completed')}
                        className="rounded-[18px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
