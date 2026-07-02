import api from './api';

export const orderService = {
  createOrder:       (data)   => api.post('/orders', data),
  getOrders:         (params) => api.get('/orders', { params }),
  getOrder:          (id)     => api.get(`/orders/${id}`),
  cancelOrder:       (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAllOrders:      (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const getAllOrders = (params) => api.get('/orders', { params });

// Coupon validation — backend returns { type, value, minOrderAmount }; calculate discount here
export const validateCoupon = async (code, total) => {
  const res = await api.get(`/coupons/validate/${encodeURIComponent(code)}`);
  const { type, value, minOrderAmount } = res.data?.data || {};
  if (minOrderAmount && total < minOrderAmount) {
    const err = new Error(`Minimum order amount is ${minOrderAmount.toLocaleString()} XAF`);
    err.response = { data: { message: err.message } };
    throw err;
  }
  const discountAmount = type === 'percentage'
    ? Math.round(total * (value / 100))
    : Number(value) || 0;
  // Return in the shape CheckoutPage expects
  return { data: { data: { discountAmount } } };
};

export const trackOrder = (orderNumber) => api.get(`/orders/track/${orderNumber}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default orderService;
