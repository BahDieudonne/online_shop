import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/formatters';

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await orderService.trackOrder(orderNumber.trim());
      setOrder(res.data?.data?.order);
    } catch { setError('Order not found. Check your order number and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Track Your Order — CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <h1 className="font-display text-3xl font-bold text-navy-900 text-center mb-2">Track Your Order</h1>
        <p className="text-gray-500 text-center mb-8">Enter your order number to see real-time updates</p>
        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Order number (e.g. CS-1234)" required className="input flex-1" />
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5">
            {loading ? '...' : <MagnifyingGlassIcon className="w-5 h-5" />}
          </button>
        </form>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {order && (
          <div className="card p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono font-bold text-navy-700">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full capitalize">{order.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              {(order.trackingHistory || []).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-navy-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{t.status}</p>
                    <p className="text-gray-500 text-xs">{t.note} · {formatDate(t.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default TrackOrderPage;
