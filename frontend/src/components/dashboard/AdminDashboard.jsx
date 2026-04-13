import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
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

const pieColors = ['#3152ff', '#11c9c2', '#ff4fd8', '#ffb648', '#5f6fff'];

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getAdminAnalytics();
        setAnalytics(response);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load admin analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const usersGrowth = useMemo(
    () =>
      extractCollection(analytics?.charts?.users_growth).map((item) => ({
        ...item,
        month: formatMonthLabel(item.month),
      })),
    [analytics]
  );

  const revenueGrowth = useMemo(
    () =>
      extractCollection(analytics?.charts?.revenue_monthly).map((item) => ({
        ...item,
        month: formatMonthLabel(item.month),
      })),
    [analytics]
  );

  const ordersByStatus = extractCollection(analytics?.charts?.orders_by_status);

  const recentUsers = extractCollection(analytics?.recent?.users).map((user) => ({
    id: user.id,
    Name: user.display_name || user.name,
    Role: user.role,
    Email: user.email,
    Joined: formatDate(user.created_at),
  }));

  const recentOrders = extractCollection(analytics?.recent?.orders).map((order) => ({
    id: order.id,
    Order: `#${order.id}`,
    Client: order.client?.display_name || order.client?.name || 'Client',
    Total: formatCurrency(order.total || order.total_price),
    Status: order.payment_status || order.status,
  }));

  if (loading) {
    return <DashboardLoading label="Loading admin overview..." />;
  }

  if (error) {
    return <DashboardError message={error} />;
  }

  const stats = analytics?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[34px] bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-500 p-6 text-white shadow-[0_35px_80px_-40px_rgba(37,99,235,0.95)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                Global pulse
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Platform performance at a glance
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/80">
                User growth, order flow, and moderation health are all surfaced
                here so the admin team can react quickly.
              </p>
            </div>

            <div className="grid min-w-[250px] gap-3 sm:grid-cols-2">
              <MetricTile
                label="Revenue"
                value={formatCurrency(stats.total_revenue)}
              />
              <MetricTile
                label="Pending orders"
                value={formatCompactNumber(stats.pending_orders)}
              />
              <MetricTile
                label="Active services"
                value={formatCompactNumber(stats.active_services)}
              />
              <MetricTile
                label="Completed"
                value={formatCompactNumber(stats.completed_orders)}
              />
            </div>
          </div>
        </section>

        <ChartCard
          title="Quick actions"
          description="Jump into the busiest admin workflows."
          height="h-auto"
        >
          <div className="grid gap-3">
            <ActionLink
              to="/admin/users"
              icon={Users}
              title="Review users"
              description="Verify new accounts and keep role access clean."
            />
            <ActionLink
              to="/admin/services"
              icon={BriefcaseBusiness}
              title="Moderate services"
              description="Approve or reject marketplace listings faster."
            />
            <ActionLink
              to="/admin/products"
              icon={ShoppingCart}
              title="Check products"
              description="Monitor vendor catalog quality and stock trends."
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={formatCompactNumber(stats.total_users)}
          hint="Across all workspace roles"
          delta={12}
          tone="blue"
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders tracked"
          value={formatCompactNumber(stats.total_orders)}
          hint="Live commerce and service volume"
          delta={8}
          tone="mint"
        />
        <StatCard
          icon={ShieldCheck}
          label="Active services"
          value={formatCompactNumber(stats.active_services)}
          hint="Published and discoverable"
          delta={5}
          tone="peach"
        />
        <StatCard
          icon={Activity}
          label="Completed orders"
          value={formatCompactNumber(stats.completed_orders)}
          hint="Closed successfully"
          delta={14}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <ChartCard
          title="User growth"
          description="Registrations over the last months."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersGrowth}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => [value, 'Users']}
                contentStyle={{ borderRadius: 20, border: 'none' }}
              />
              <Bar
                dataKey="count"
                fill="url(#usersGradient)"
                radius={[18, 18, 0, 0]}
              />
              <defs>
                <linearGradient id="usersGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3152ff" />
                  <stop offset="100%" stopColor="#11c9c2" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Order distribution"
          description="Current mix of order statuses."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ordersByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={68}
                outerRadius={108}
                paddingAngle={3}
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 20, border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ordersByStatus.map((item, index) => (
              <LegendRow
                key={item.status}
                color={pieColors[index % pieColors.length]}
                label={item.status}
                value={item.count}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <DataTable
          title="Recent users"
          columns={['Name', 'Role', 'Email', 'Joined']}
          data={recentUsers.slice(0, 6)}
          emptyLabel="No recent users found."
          action={
            <Link
              to="/admin/users"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Manage users
            </Link>
          }
        />

        <ChartCard
          title="Revenue trend"
          description="Paid revenue captured by month."
          height="h-[380px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueGrowth}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{ borderRadius: 20, border: 'none' }}
              />
              <Bar
                dataKey="revenue"
                fill="#3152ff"
                radius={[18, 18, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Recent transactions"
        columns={['Order', 'Client', 'Total', 'Status']}
        data={recentOrders.slice(0, 6).map((order) => ({
          ...order,
          Status: <StatusBadge value={order.Status} />,
        }))}
        emptyLabel="No recent orders found."
      />
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
      <p className="text-xs uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
      <span
        className="h-3.5 w-3.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="ml-auto text-sm font-bold text-slate-900">{value}</span>
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
