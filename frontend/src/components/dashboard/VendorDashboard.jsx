import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Package,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
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
  statusTone,
} from '../../lib/dashboard.js';
import { ChartCard } from './ChartCard.jsx';
import { DataTable } from './DataTable.jsx';
import { StatCard } from './StatCard.jsx';

export function VendorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getVendorAnalytics();
        setAnalytics(response);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load vendor analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const monthlySales = useMemo(
    () =>
      extractCollection(analytics?.charts?.sales_monthly).map((item) => ({
        ...item,
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(item.month)
        ),
      })),
    [analytics]
  );

  const topProducts = extractCollection(analytics?.charts?.top_products);

  const recentProducts = extractCollection(analytics?.recent?.products).map(
    (product) => ({
      id: product.id,
      Product: product.title || product.name,
      Stock: product.stock ?? 0,
      Price: formatCurrency(product.price),
      Status: product.status || 'pending',
    })
  );

  const recentOrders = extractCollection(analytics?.recent?.orders).map(
    (order) => ({
      id: order.id,
      Order: `#${order.id}`,
      Customer: order.client?.display_name || order.client?.name || 'Client',
      Total: formatCurrency(order.total || order.total_price),
      Status: order.payment_status || order.status,
    })
  );

  if (loading) {
    return <DashboardLoading label="Loading vendor performance..." />;
  }

  if (error) {
    return <DashboardError message={error} />;
  }

  const stats = analytics?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[34px] bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-500 p-6 text-white shadow-[0_35px_80px_-40px_rgba(59,130,246,0.9)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                Commerce
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Inventory, sales, and order flow in one view
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Keep the catalog healthy, track paid revenue, and watch which
                products are carrying the store.
              </p>
            </div>

            <div className="grid min-w-[250px] gap-3 sm:grid-cols-2">
              <MetricTile
                label="Products"
                value={formatCompactNumber(stats.total_products)}
              />
              <MetricTile
                label="Orders"
                value={formatCompactNumber(stats.total_orders)}
              />
              <MetricTile
                label="Revenue"
                value={formatCurrency(stats.revenue)}
              />
              <MetricTile
                label="Low stock"
                value={formatCompactNumber(stats.low_stock_alerts)}
              />
            </div>
          </div>
        </section>

        <ChartCard
          title="Quick actions"
          description="Top vendor workflows"
          height="h-auto"
        >
          <div className="grid gap-3">
            <ActionLink
              to="/vendor/products"
              icon={Package}
              title="Manage catalog"
              description="Update listings, pricing, and stock."
            />
            <ActionLink
              to="/vendor/orders"
              icon={ShoppingCart}
              title="Process orders"
              description="Move orders from payment to delivery."
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Box}
          label="Products"
          value={formatCompactNumber(stats.total_products)}
          hint="Active catalog entries"
          delta={6}
          tone="blue"
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={formatCompactNumber(stats.total_orders)}
          hint="All vendor orders"
          delta={10}
          tone="mint"
        />
        <StatCard
          icon={Wallet}
          label="Paid revenue"
          value={formatCurrency(stats.revenue)}
          hint="Captured payments"
          delta={13}
          tone="peach"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock alerts"
          value={formatCompactNumber(stats.low_stock_alerts)}
          hint="Needs quick attention"
          delta={-3}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <ChartCard
          title="Monthly sales"
          description="Paid order value over time."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Sales']}
                contentStyle={{ borderRadius: 20, border: 'none' }}
              />
              <Bar
                dataKey="sales"
                fill="url(#salesGradient)"
                radius={[18, 18, 0, 0]}
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3152ff" />
                  <stop offset="100%" stopColor="#11c9c2" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top inventory"
          description="Best stocked products right now."
          height="h-auto"
        >
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product) => (
              <div
                key={product.name}
                className="rounded-[24px] bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      Inventory visibility
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {product.stock} units
                  </span>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="rounded-[24px] bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No product insights available yet.
              </p>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Recent products"
          columns={['Product', 'Stock', 'Price', 'Status']}
          data={recentProducts.slice(0, 6).map((product) => ({
            ...product,
            Status: <StatusBadge value={product.Status} />,
          }))}
          emptyLabel="No products available."
          action={
            <Link
              to="/vendor/products"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Open catalog
            </Link>
          }
        />

        <DataTable
          title="Recent orders"
          columns={['Order', 'Customer', 'Total', 'Status']}
          data={recentOrders.slice(0, 6).map((order) => ({
            ...order,
            Status: <StatusBadge value={order.Status} />,
          }))}
          emptyLabel="No orders available."
          action={
            <Link
              to="/vendor/orders"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View all orders
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
