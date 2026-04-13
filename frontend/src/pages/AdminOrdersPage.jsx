import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Search, Eye, Truck } from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import {
  extractCollection,
  formatCurrency,
  statusTone,
} from '../lib/dashboard.js';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.orders();
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

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (!searchQuery.trim()) return filtered;
    const query = searchQuery.toLowerCase();
    return filtered.filter((order) => {
      const clientName = (
        order.client?.display_name ||
        order.client?.name ||
        ''
      ).toLowerCase();
      const orderId = order.id.toString();
      return clientName.includes(query) || orderId.includes(query);
    });
  }, [orders, searchQuery, statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setFeedback('');
      await adminApi.updateOrderStatus(orderId, newStatus);
      setFeedback(`Order ${newStatus} successfully.`);
      await loadOrders();
    } catch (error) {
      setFeedback(error.message || 'Unable to update order status.');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const totalRevenue = orders
    .filter((order) => order.payment_status === 'paid')
    .reduce((sum, order) => sum + (order.total_price || 0), 0);

  return (
    <DashboardLayout
      title="Order Management"
      subtitle="Monitor and manage all orders across the platform."
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
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-green-100">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-yellow-100">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Orders</h3>
              <p className="mt-1 text-sm text-slate-500">
                Filter and manage customer orders
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
                  placeholder="Search orders..."
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
                <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {searchQuery.trim() || statusFilter !== 'all'
                  ? 'No orders match your filters.'
                  : 'No orders yet.'}
              </p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-slate-500">
                      Client:{' '}
                      {order.client?.display_name ||
                        order.client?.name ||
                        'Unknown'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatCurrency(order.total_price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'processing')}
                        className="rounded-[18px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Process
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'shipped')}
                        className="rounded-[18px] bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        Ship
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="rounded-[18px] bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Deliver
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
