import api from './api';

const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token, password) => {
    const { data } = await api.patch(`/auth/reset-password/${token}`, { password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },
};

export default authService;
