import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileBadge2,
  Wrench,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { serviceRequestsApi, technicianApi } from '../../api/modules.js';
import dashboardApi from '../../api/dashboardApi.js';
import {
  extractCollection,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  statusTone,
} from '../../lib/dashboard.js';
import { ChartCard } from './ChartCard.jsx';
import { DataTable } from './DataTable.jsx';
import { StatCard } from './StatCard.jsx';

export function TechnicianDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const [
          analyticsResponse,
          requestsResponse,
          availabilityResponse,
          certificationsResponse,
        ] = await Promise.all([
          dashboardApi.getTechAnalytics(),
          serviceRequestsApi.list(),
          technicianApi.availability(),
          technicianApi.certifications(),
        ]);

        setAnalytics(analyticsResponse);
        setRequests(extractCollection(requestsResponse));
        setAvailability(extractCollection(availabilityResponse));
        setCertifications(extractCollection(certificationsResponse));
      } catch (loadError) {
        setError(loadError.message || 'Unable to load technician workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, []);

  const requestStats = useMemo(() => {
    return requests.reduce(
      (summary, request) => {
        const status = (request.status || '').toLowerCase();
        summary.total += 1;
        if (status === 'pending') {
          summary.pending += 1;
        }
        if (status === 'accepted') {
          summary.accepted += 1;
        }
        if (status === 'completed') {
          summary.completed += 1;
        }
        return summary;
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
      }
    );
  }, [requests]);

  const taskBreakdown = [
    { label: 'Pending', count: requestStats.pending },
    { label: 'Accepted', count: requestStats.accepted },
    { label: 'Completed', count: requestStats.completed },
  ];

  const monthlyJobs = useMemo(
    () =>
      extractCollection(analytics?.charts?.jobs_monthly).map((item) => ({
        ...item,
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(item.month)
        ),
      })),
    [analytics]
  );

  const monthlyEarnings = useMemo(
    () =>
      extractCollection(analytics?.charts?.earnings_monthly).map((item) => ({
        ...item,
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(item.month)
        ),
      })),
    [analytics]
  );

  const topServices = extractCollection(analytics?.recent?.services);

  const recentTasks = requests.map((request) => ({
    id: request.id,
    Task: `#${request.id}`,
    Service: request.service?.title || 'Service request',
    Client: request.client?.display_name || request.client?.name || 'Client',
    Status: request.status,
    Date: formatDate(request.requested_for || request.created_at),
  }));

  const recentAvailability = availability.map((slot) => ({
    id: slot.id,
    Day: slot.day || slot.date || 'Scheduled',
    Start: slot.start_time || slot.start || '-',
    End: slot.end_time || slot.end || '-',
  }));

  if (loading) {
    return <DashboardLoading label="Loading technician workspace..." />;
  }

  if (error) {
    return <DashboardError message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[34px] bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_35px_80px_-40px_rgba(59,130,246,0.9)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                Field ops
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Stay ready for every assigned intervention
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Track active requests, keep your schedule up to date, and manage
                qualifications from one workspace.
              </p>
            </div>

            <div className="grid min-w-[250px] gap-3 sm:grid-cols-2">
              <MetricTile
                label="Total services"
                value={formatCompactNumber(
                  analytics?.stats?.total_services || 0
                )}
              />
              <MetricTile
                label="Active jobs"
                value={formatCompactNumber(
                  analytics?.stats?.active_requests || 0
                )}
              />
              <MetricTile
                label="Completed jobs"
                value={formatCompactNumber(
                  analytics?.stats?.completed_jobs || 0
                )}
              />
              <MetricTile
                label="Total earnings"
                value={formatCurrency(analytics?.stats?.earnings || 0)}
              />
            </div>
          </div>
        </section>

        <ChartCard
          title="Quick actions"
          description="Daily technician workflows"
          height="h-auto"
        >
          <div className="grid gap-3">
            <ActionLink
              to="/tech/services"
              icon={Wrench}
              title="Manage services"
              description="Update your service catalog and pricing."
            />
            <ActionLink
              to="/tech/tasks"
              icon={ClipboardCheck}
              title="Open tasks"
              description="Update request status and monitor task flow."
            />
            <ActionLink
              to="/tech/reports"
              icon={FileBadge2}
              title="Manage profile"
              description="Update certifications and availability slots."
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wrench}
          label="Services offered"
          value={formatCompactNumber(analytics?.stats?.total_services || 0)}
          hint="Active service listings"
          delta={6}
          tone="blue"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Active jobs"
          value={formatCompactNumber(analytics?.stats?.active_requests || 0)}
          hint="Currently working on"
          delta={5}
          tone="mint"
        />
        <StatCard
          icon={CheckCircle2}
          label="Jobs completed"
          value={formatCompactNumber(analytics?.stats?.completed_jobs || 0)}
          hint="Successfully delivered"
          delta={12}
          tone="peach"
        />
        <StatCard
          icon={CalendarClock}
          label="Total earnings"
          value={formatCurrency(analytics?.stats?.earnings || 0)}
          hint="Lifetime revenue"
          delta={8}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <ChartCard title="Monthly jobs" description="Completed work over time.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyJobs}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 20, border: 'none' }} />
              <Bar
                dataKey="count"
                fill="url(#jobsGradient)"
                radius={[18, 18, 0, 0]}
              />
              <defs>
                <linearGradient id="jobsGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#11c9c2" />
                  <stop offset="100%" stopColor="#3152ff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly earnings"
          description="Revenue earned over time."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyEarnings}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Earnings']}
                contentStyle={{ borderRadius: 20, border: 'none' }}
              />
              <Bar
                dataKey="earnings"
                fill="url(#earningsGradient)"
                radius={[18, 18, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="earningsGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Recent services"
          columns={['Title', 'Price', 'Status']}
          data={topServices.slice(0, 6).map((service) => ({
            id: service.id,
            Title: service.title,
            Price: formatCurrency(service.price),
            Status: <StatusBadge value={service.status || 'pending'} />,
          }))}
          emptyLabel="No services available."
          action={
            <Link
              to="/tech/services"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Manage services
            </Link>
          }
        />

        <DataTable
          title="Recent tasks"
          columns={['Task', 'Service', 'Client', 'Status', 'Date']}
          data={recentTasks.slice(0, 6).map((task) => ({
            ...task,
            Status: <StatusBadge value={task.Status} />,
          }))}
          emptyLabel="No tasks assigned yet."
          action={
            <Link
              to="/tech/tasks"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Open task board
            </Link>
          }
        />
      </div>
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/90 px-4 py-4 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-blue-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-blue-600" />
    </Link>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-[24px] bg-white/12 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-white/65">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
        value
      )}`}
    >
      {value}
    </span>
  );
}

function DashboardLoading({ label }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_35px_80px_-45px_rgba(37,99,235,0.55)]">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function DashboardError({ message }) {
  return (
    <div className="rounded-[30px] border border-rose-100 bg-rose-50 px-6 py-5 text-sm text-rose-700">
      {message}
    </div>
  );
}
