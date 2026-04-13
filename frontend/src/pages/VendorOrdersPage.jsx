import { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, PackageCheck, ShoppingCart, Truck } from 'lucide-react';
import { ordersApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { DataTable } from '../components/dashboard/DataTable.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import {
  extractCollection,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  statusTone,
} from '../lib/dashboard.js';

const orderStates = ['paid', 'completed', 'cancelled'];

export function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.list();
      setOrders(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    return orders.reduce(
      (summary, order) => {
        const status = order.status || 'pending';
        summary.total += 1;
        summary[status] = (summary[status] || 0) + 1;
        if ((order.payment_status || '').toLowerCase() === 'paid') {
          summary.paid += 1;
        }
        return summary;
      },
      { total: 0, paid: 0 }
    );
  }, [orders]);

  const updateStatus = async (orderId, status) => {
    try {
      setActionId(orderId);
      setFeedback('');
      const response = await ordersApi.updateStatus(orderId, status);
      setFeedback(response.message || 'Order updated successfully.');
      await loadOrders();
    } catch (error) {
      setFeedback(error.message || 'Unable to update order.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout
      title="Order Operations"
      subtitle="Track vendor orders, payment state, and fulfillment progress."
      searchPlaceholder="Search orders, clients, cities..."
    >
      <div className="space-y-6">
        {feedback && <FeedbackBanner message={feedback} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="All orders"
            value={formatCompactNumber(stats.total)}
            hint="Vendor order volume"
            tone="blue"
          />
          <StatCard
            icon={CircleDollarSign}
            label="Paid"
            value={formatCompactNumber(stats.paid)}
            hint="Confirmed payments"
            tone="mint"
          />
          <StatCard
            icon={Truck}
            label="Processing"
            value={formatCompactNumber(stats.processing)}
            hint="Active fulfillment"
            tone="peach"
          />
          <StatCard
            icon={PackageCheck}
            label="Completed"
            value={formatCompactNumber(stats.completed)}
            hint="Closed deliveries"
            tone="slate"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading orders..." />
        ) : (
          <>
            <ChartCard
              title="Order actions"
              description="Use the existing order status endpoint to keep order progress up to date."
              height="h-auto"
            >
              <p className="text-sm leading-6 text-slate-500">
                Vendors can mark orders as paid, completed, or cancelled from
                this queue without touching any backend structure.
              </p>
            </ChartCard>

            <DataTable
              title="Vendor orders"
              columns={[
                'Order',
                'Customer',
                'Placed',
                'Total',
                'Status',
                'Payment',
                'Actions',
              ]}
              data={orders.map((order) => ({
                id: order.id,
                Order: `#${order.id}`,
                Customer:
                  order.client?.display_name || order.client?.name || 'Client',
                Placed: formatDate(order.placed_at || order.created_at),
                Total: formatCurrency(order.total || order.total_price),
                Status: <StatusBadge value={order.status || 'pending'} />,
                Payment: (
                  <StatusBadge value={order.payment_status || 'pending'} />
                ),
                Actions: (
                  <div className="flex flex-wrap gap-2">
                    {orderStates.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(order.id, status)}
                        disabled={actionId === order.id}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          order.status === status || order.payment_status === status
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {actionId === order.id ? 'Saving...' : capitalize(status)}
                      </button>
                    ))}
                  </div>
                ),
              }))}
              emptyLabel="No vendor orders found."
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
