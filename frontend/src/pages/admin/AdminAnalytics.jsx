import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon,
  ShoppingBagIcon, UsersIcon, EyeIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

const COLORS = ['#4f46e5', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

const RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y', label: '1 Year' },
];

const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '' }) => {
  const up = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{prefix}{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-sm ${up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
              {Math.abs(change).toFixed(1)}% vs previous period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default function AdminAnalytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/dashboard?range=${range}`);
      // Backend wraps response: { success, data: {...} } — extract the inner data
      setData(res.data?.data ?? getMockData(range));
    } catch {
      setData(getMockData(range));
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (r) => {
    const days = r === '7d' ? 7 : r === '30d' ? 30 : r === '90d' ? 90 : 365;
    const revenueData = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('fr-CM', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(50000 + Math.random() * 200000),
      orders: Math.floor(5 + Math.random() * 30),
    }));
    return {
      summary: { revenue: 3200000, orders: 248, customers: 189, views: 12400,
        revenueChange: 12.3, ordersChange: 8.1, customersChange: 23.5, viewsChange: -2.1 },
      revenueData,
      paymentMethods: [
        { name: 'MTN MoMo', value: 45 }, { name: 'Orange Money', value: 30 },
        { name: 'Cash on Delivery', value: 15 }, { name: 'Bank Transfer', value: 10 },
      ],
      topProducts: [
        { name: 'iPhone 14 Pro', sales: 34, revenue: 1020000 },
        { name: 'Samsung Galaxy A54', sales: 28, revenue: 560000 },
        { name: 'Airpods Pro', sales: 22, revenue: 330000 },
        { name: 'MacBook Air M2', sales: 12, revenue: 840000 },
        { name: 'Sony WH-1000XM5', sales: 18, revenue: 270000 },
      ],
      categoryRevenue: [
        { name: 'Phones', revenue: 1800000 },
        { name: 'Laptops', revenue: 900000 },
        { name: 'Accessories', revenue: 450000 },
        { name: 'Audio', revenue: 320000 },
        { name: 'Other', revenue: 180000 },
      ],
      ordersByStatus: [
        { name: 'Delivered', value: 180 }, { name: 'Processing', value: 35 },
        { name: 'Shipped', value: 20 }, { name: 'Pending', value: 8 }, { name: 'Cancelled', value: 5 },
      ],
    };
  };

  const exportReport = async () => {
    try {
      const res = await api.get(`/analytics/export?range=${range}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `analytics-${range}.csv`; a.click();
    } catch {}
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { summary, revenueData, paymentMethods, topProducts, categoryRevenue, ordersByStatus } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Business performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {RANGES.map(r => (
              <button key={r.key} onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${range === r.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={exportReport} className="btn-outline flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Revenue" value={formatCurrency(summary.revenue)}
          change={summary.revenueChange} icon={CurrencyDollarIcon} color="indigo" />
        <MetricCard title="Orders" value={summary.orders.toLocaleString()}
          change={summary.ordersChange} icon={ShoppingBagIcon} color="purple" />
        <MetricCard title="New Customers" value={summary.customers.toLocaleString()}
          change={summary.customersChange} icon={UsersIcon} color="green" />
        <MetricCard title="Product Views" value={summary.views.toLocaleString()}
          change={summary.viewsChange} icon={EyeIcon} color="yellow" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Revenue & Orders Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis yAxisId="left" tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip formatter={(v, name) => name === 'revenue' ? formatCurrency(v) : v} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#revGradient)" strokeWidth={2} name="Revenue (FCFA)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={false} name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Payment Methods</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {paymentMethods.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{m.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersByStatus} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Orders">
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Top Products by Revenue</h2>
        <div className="space-y-3">
          {topProducts.map((p, i) => {
            const maxRev = topProducts[0].revenue;
            const pct = (p.revenue / maxRev) * 100;
            return (
              <div key={p.name} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-bold text-gray-400">#{i+1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{p.name}</span>
                    <span className="text-sm text-gray-500">{p.sales} sold · {formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Revenue by Category</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip formatter={v => formatCurrency(v)} />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="Revenue">
              {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
