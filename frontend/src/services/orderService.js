import api from './api';

export const orderService = {
  createOrder:       (data)   => api.post('/orders', data),
  getOrders:         (params) => api.get('/orders', { params }),
  getOrder:          (id)     => api.get(`/orders/${id}`),
  cancelOrder:       (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  // Admin
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const getAllOrders = (params) => api.get('/orders/admin', { params });
export const validateCoupon = (code, total) => api.post('/coupons/validate', { code, total });
export const trackOrder = (orderNumber) => api.get(`/orders/track/${orderNumber}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default orderService;
