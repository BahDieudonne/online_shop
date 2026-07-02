import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CurrencyDollarIcon, ShoppingCartIcon, UsersIcon, CubeIcon,
  ArrowUpIcon, ArrowDownIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import analyticsService from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';
import { PageLoader } from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';

const StatCard = ({ label, value, change, icon: Icon, color, prefix = '' }) => {
  const positive = change >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{prefix}{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
          {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
};

const PIE_COLORS = ['#1a237e', '#7b1fa2', '#f9a825', '#10b981', '#ef4444'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    analyticsService.getDashboard({ period }).then((res) => {
      setData(res.data?.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <PageLoader />;

  const stats = data?.overview || {};
  const revenueChart = data?.revenueChart || [];
  const topProducts = data?.topProducts || [];
  const lowStock = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];
  const paymentBreakdown = data?.paymentBreakdown || [];

  return (
    <>
      <Helmet><title>Dashboard Admin | CHANCELOR STORE</title></Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
          </div>
          <div className="flex gap-2">
            {['7', '30', '90'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${period === p ? 'bg-navy-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {p}d
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} change={stats.revenueChange} icon={CurrencyDollarIcon} color="bg-navy-700" />
          <StatCard label="Total Orders" value={(stats.totalOrders || 0).toLocaleString()} change={stats.ordersChange} icon={ShoppingCartIcon} color="bg-purple-600" />
          <StatCard label="Total Customers" value={(stats.totalCustomers || 0).toLocaleString()} change={stats.customersChange} icon={UsersIcon} color="bg-green-600" />
          <StatCard label="Products" value={(stats.totalProducts || 0).toLocaleString()} icon={CubeIcon} color="bg-gold-500" />
        </div>

        {/* Revenue chart + Low stock alert */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-800">Revenue Overview</h2>
              <Badge variant="success">Last {period} days</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#1a237e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {lowStock.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-navy-800">Low Stock Alert</h2>
              </div>
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 line-clamp-1 flex-1">{p.name}</span>
                    <Badge variant={p.stock === 0 ? 'danger' : 'warning'} size="sm">{p.stock} left</Badge>
                  </div>
                ))}
                <Link to="/admin/inventory" className="text-xs text-navy-600 hover:underline font-medium block pt-1">View all inventory →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Orders + Top Products + Payment breakdown */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent orders */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-navy-600 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left pb-2 font-medium">Order</th>
                    <th className="text-left pb-2 font-medium">Customer</th>
                    <th className="text-left pb-2 font-medium">Amount</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.slice(0, 8).map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5">
                        <Link to={`/admin/orders/${o._id}`} className="text-navy-600 hover:underline font-mono text-xs">#{o.orderNumber}</Link>
                      </td>
                      <td className="py-2.5 text-gray-700">{o.user?.firstName} {o.user?.lastName}</td>
                      <td className="py-2.5 font-medium text-gray-800">{formatCurrency(o.totalAmount)}</td>
                      <td className="py-2.5">
                        <Badge variant={
                          o.status === 'delivered' ? 'success' :
                          o.status === 'cancelled' ? 'danger' :
                          o.status === 'processing' ? 'warning' : 'info'
                        } size="sm">{o.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment breakdown pie */}
          <div className="card p-5">
            <h2 className="font-semibold text-navy-800 mb-4">Payment Methods</h2>
            {paymentBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" paddingAngle={3}>
                      {paymentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-3">
                  {paymentBreakdown.map((p, i) => (
                    <div key={p._id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 capitalize">{p._id?.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium text-gray-700">{p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-sm text-gray-400">No data yet</p>}
          </div>
        </div>

        {/* Top products */}
        {topProducts.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-800">Top Selling Products</h2>
              <Link to="/admin/analytics" className="text-sm text-navy-600 hover:underline">Full analytics</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Sales</th>
                    <th className="text-right pb-2 font-medium">Revenue</th>
                    <th className="text-right pb-2 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p, i) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-navy-100 text-navy-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          <img src={p.images?.[0]?.thumbnail} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                          <Link to={`/admin/products/${p._id}/edit`} className="text-gray-700 hover:text-navy-700 line-clamp-1">{p.name}</Link>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-gray-700">{p.analytics?.totalSales || 0}</td>
                      <td className="py-2.5 text-right font-medium text-navy-700">{formatCurrency(p.analytics?.revenue || 0)}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={p.stock === 0 ? 'danger' : p.stock < 10 ? 'warning' : 'success'} size="sm">{p.stock}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
