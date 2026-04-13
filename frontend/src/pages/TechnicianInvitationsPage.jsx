import { useEffect, useState } from 'react';
import { CheckCircle, Mail, XCircle } from 'lucide-react';
import { technicianApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { extractCollection, formatDate } from '../lib/dashboard.js';

export function TechnicianInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadPage = async () => {
    try {
      setLoading(true);
      const response = await technicianApi.invitations();
      setInvitations(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleAccept = async (companyId) => {
    try {
      setActionId(`accept-${companyId}`);
      setFeedback('');
      await technicianApi.acceptInvitation(companyId);
      setFeedback('Invitation accepted! You are now part of the team.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to accept invitation.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (companyId) => {
    try {
      setActionId(`reject-${companyId}`);
      setFeedback('');
      await technicianApi.rejectInvitation(companyId);
      setFeedback('Invitation rejected.');
      await loadPage();
    } catch (error) {
      setFeedback(error.message || 'Unable to reject invitation.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="Team Invitations"
      subtitle="Manage your company team invitations and memberships."
      searchPlaceholder="Search invitations..."
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

        {loading ? (
          <div className="rounded-[30px] border border-white/70 bg-white/90 p-10 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading invitations...
            </p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <Mail className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-900">
              No invitations yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Companies will send you invitations to join their team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {invitation.company?.user?.display_name ||
                        invitation.company?.user?.name ||
                        'Company'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {invitation.company?.description ||
                        'No description available'}
                    </p>

                    {invitation.message && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">
                          {invitation.message}
                        </p>
                      </div>
                    )}

                    {invitation.file && (
                      <div className="mt-3">
                        <a
                          href={`/storage/${invitation.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <Mail className="h-4 w-4" />
                          View Attachment
                        </a>
                      </div>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      Invited on {formatDate(invitation.created_at)}
                    </p>
                    <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1">
                      <span className="text-xs font-semibold text-slate-700 capitalize">
                        {invitation.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {invitation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(invitation.company_id)}
                          disabled={actionId !== null}
                          className="flex items-center gap-2 rounded-[18px] bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(invitation.company_id)}
                          disabled={actionId !== null}
                          className="rounded-[18px] border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {invitation.status === 'active' && (
                      <button
                        onClick={() => handleReject(invitation.company_id)}
                        disabled={actionId !== null}
                        className="flex items-center gap-2 rounded-[18px] bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Leave Team
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
