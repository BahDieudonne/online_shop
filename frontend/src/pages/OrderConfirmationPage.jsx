import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatters';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id) orderService.getOrder(id).then((r) => setOrder(r.data?.data)).catch(() => {});
  }, [id]);

  return (
    <>
      <Helmet><title>Order Confirmed — CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">Thank you for shopping with CHANCELOR STORE. Your order has been placed successfully.</p>
        {order && (
          <div className="card p-5 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Order Number</span><span className="font-mono font-bold text-navy-700">#{order.orderNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Amount</span><span className="font-bold">{formatCurrency(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="capitalize">{order.paymentMethod?.replace('_', ' ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="capitalize font-medium text-amber-600">{order.status}</span></div>
          </div>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/account/orders" className="btn-primary px-6 py-2.5">Track My Order</Link>
          <Link to="/shop" className="btn-secondary px-6 py-2.5">Continue Shopping</Link>
        </div>
      </div>
    </>
  );
};
export default OrderConfirmationPage;
