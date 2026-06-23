import api from './api';

export const analyticsService = {
  getDashboard:        (params) => api.get('/analytics/dashboard', { params }),
  getProductAnalytics: (id)     => api.get(`/analytics/products/${id}`),
};

export default analyticsService;
