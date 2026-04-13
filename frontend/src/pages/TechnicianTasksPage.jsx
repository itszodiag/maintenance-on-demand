import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Clock3, Wrench } from 'lucide-react';
import { serviceRequestsApi } from '../api/modules.js';
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

const taskStates = ['accepted', 'completed', 'rejected'];

export function TechnicianTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestsApi.list();
      setTasks(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const stats = useMemo(() => {
    return tasks.reduce(
      (summary, task) => {
        const status = task.status || 'pending';
        summary.total += 1;
        summary[status] = (summary[status] || 0) + 1;
        return summary;
      },
      { total: 0 }
    );
  }, [tasks]);

  const updateStatus = async (taskId, status) => {
    try {
      setActionId(taskId);
      setFeedback('');
      const response = await serviceRequestsApi.updateStatus(taskId, status);
      setFeedback(response.message || 'Task updated successfully.');
      await loadTasks();
    } catch (error) {
      setFeedback(error.message || 'Unable to update task.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="Task Board"
      subtitle="Manage assigned service work and update progress from one queue."
      searchPlaceholder="Search tasks, services, clients..."
    >
      <div className="space-y-6">
        {feedback && <FeedbackBanner message={feedback} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Wrench}
            label="All tasks"
            value={formatCompactNumber(stats.total)}
            hint="Requests assigned to you"
            tone="blue"
          />
          <StatCard
            icon={Clock3}
            label="Pending"
            value={formatCompactNumber(stats.pending)}
            hint="Waiting for response"
            tone="mint"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Accepted"
            value={formatCompactNumber(stats.accepted)}
            hint="Ready to execute"
            tone="peach"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={formatCompactNumber(stats.completed)}
            hint="Delivered successfully"
            tone="slate"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading task board..." />
        ) : (
          <>
            <ChartCard
              title="Task actions"
              description="Update request progress using the existing service request status endpoint."
              height="h-auto"
            >
              <p className="text-sm leading-6 text-slate-500">
                Accept requests, mark them complete, or reject them when the job
                cannot be fulfilled. Clients continue to receive the standard
                backend updates.
              </p>
            </ChartCard>

            <DataTable
              title="Assigned tasks"
              columns={[
                'Task',
                'Service',
                'Client',
                'Scheduled',
                'Status',
                'Actions',
              ]}
              data={tasks.map((task) => ({
                id: task.id,
                Task: `#${task.id}`,
                Service: task.service?.title || 'Service request',
                Client: task.client?.display_name || task.client?.name || 'Client',
                Scheduled: formatDate(task.requested_for || task.created_at),
                Status: <StatusBadge value={task.status || 'pending'} />,
                Actions: (
                  <div className="flex flex-wrap gap-2">
                    {taskStates.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(task.id, status)}
                        disabled={actionId === task.id}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          task.status === status
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {actionId === task.id ? 'Saving...' : capitalize(status)}
                      </button>
                    ))}
                  </div>
                ),
              }))}
              emptyLabel="No tasks assigned yet."
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

function LoadingPanel({ label }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_35px_80px_-45px_rgba(37,99,235,0.55)]">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
