import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  TimerReset,
  UserRoundCog,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dashboardApi from '../../api/dashboardApi.js';
import {
  extractCollection,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  statusTone,
} from '../../lib/dashboard.js';
import { ChartCard } from './ChartCard.jsx';
import { DataTable } from './DataTable.jsx';
import { StatCard } from './StatCard.jsx';

export function CompanyDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getCompanyAnalytics();
        setAnalytics(response);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load company analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const requestTrend = useMemo(
    () =>
      extractCollection(analytics?.charts?.requests_monthly).map((item) => ({
        ...item,
        month: formatMonthLabel(item.month),
      })),
    [analytics]
  );

  const completedTrend = useMemo(
    () =>
      extractCollection(analytics?.charts?.completed_jobs_monthly).map(
        (item) => ({
          ...item,
          month: formatMonthLabel(item.month),
        })
      ),
    [analytics]
  );

  const recentRequests = extractCollection(analytics?.recent?.requests).map(
    (request) => ({
      id: request.id,
      Request: `#${request.id}`,
      Client: request.client?.display_name || request.client?.name || 'Client',
      Service: request.service?.title || request.service?.name || 'Service',
      Status: request.status,
      Date: formatDate(request.created_at),
    })
  );

  const recentTechnicians = extractCollection(
    analytics?.recent?.technicians
  ).map((entry) => ({
    id: entry.id,
    Name:
      entry.technician?.user?.display_name ||
      entry.technician?.user?.name ||
      'Technician',
    Status: entry.status || 'active',
    Experience: `${entry.technician?.experience_years || 0} yrs`,
    Joined: formatDate(entry.created_at),
  }));

  if (loading) {
    return <DashboardLoading label="Loading company workspace..." />;
  }

  if (error) {
    return <DashboardError message={error} />;
  }

  const stats = analytics?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-[0_35px_80px_-42px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                Operations
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Team delivery and service demand in sync
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Watch request volume, technician coverage, and completed jobs so
                dispatching stays efficient.
              </p>
            </div>

            <div className="grid min-w-[250px] gap-3 sm:grid-cols-2">
              <MetricTile
                label="Technicians"
                value={formatCompactNumber(stats.total_technicians)}
              />
              <MetricTile
                label="Active requests"
                value={formatCompactNumber(stats.active_requests)}
              />
              <MetricTile
                label="Completed jobs"
                value={formatCompactNumber(stats.completed_jobs)}
              />
              <MetricTile
                label="Earnings"
                value={formatCurrency(stats.earnings)}
              />
            </div>
          </div>
        </section>

        <ChartCard
          title="Quick actions"
          description="Daily company workflows"
          height="h-auto"
        >
          <div className="grid gap-3">
            <ActionLink
              to="/company/services"
              icon={BriefcaseBusiness}
              title="Manage services"
              description="Create and update active offers."
            />
            <ActionLink
              to="/company/requests"
              icon={ClipboardCheck}
              title="Handle requests"
              description="Review incoming jobs and update status."
            />
            <ActionLink
              to="/company/technicians"
              icon={UserRoundCog}
              title="Assign technicians"
              description="Grow and coordinate your field team."
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UserRoundCog}
          label="Technicians"
          value={formatCompactNumber(stats.total_technicians)}
          hint="Connected to your company"
          delta={7}
          tone="blue"
        />
        <StatCard
          icon={TimerReset}
          label="Open requests"
          value={formatCompactNumber(stats.active_requests)}
          hint="Currently in progress"
          delta={11}
          tone="mint"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Completed jobs"
          value={formatCompactNumber(stats.completed_jobs)}
          hint="Finished successfully"
          delta={9}
          tone="peach"
        />
        <StatCard
          icon={Wallet}
          label="Collected revenue"
          value={formatCurrency(stats.earnings)}
          hint="Paid company orders"
          delta={15}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <ChartCard
          title="Requests trend"
          description="Service demand by month."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={requestTrend}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 20, border: 'none' }} />
              <Line
                dataKey="count"
                stroke="#3152ff"
                strokeWidth={3}
                dot={{ fill: '#3152ff', r: 4 }}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Completed jobs"
          description="Delivery output by month."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completedTrend}>
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <DataTable
          title="Recent service requests"
          columns={['Request', 'Client', 'Service', 'Status', 'Date']}
          data={recentRequests.slice(0, 6).map((request) => ({
            ...request,
            Status: <StatusBadge value={request.Status} />,
          }))}
          emptyLabel="No requests available yet."
          action={
            <Link
              to="/company/requests"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Open request queue
            </Link>
          }
        />

        <ChartCard
          title="Team availability"
          description="Most recent technicians linked to your company."
          height="h-auto"
        >
          <div className="space-y-3">
            {recentTechnicians.slice(0, 5).map((technician) => (
              <div
                key={technician.id}
                className="flex items-center justify-between rounded-[24px] bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {technician.Name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {technician.Experience}
                  </p>
                </div>
                <StatusBadge value={technician.Status} />
              </div>
            ))}

            {recentTechnicians.length === 0 && (
              <p className="rounded-[24px] bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No technicians linked yet.
              </p>
            )}
          </div>
        </ChartCard>
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
    <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(value)}`}
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
