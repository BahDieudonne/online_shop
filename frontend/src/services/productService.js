import api from './api';

const productService = {
  getProducts: async (params) => {
    const { data } = await api.get('/products', { params });
    return data;
  },
  getProduct: async (idOrSlug) => {
    const { data } = await api.get(`/products/${idOrSlug}`);
    return data;
  },
  getFeatured: async () => {
    const { data } = await api.get('/products', { params: { isFeatured: true, limit: 8, status: 'published' } });
    return data;
  },
  getNewArrivals: async () => {
    const { data } = await api.get('/products', { params: { isNewArrival: true, limit: 8, status: 'published' } });
    return data;
  },
  getBestSellers: async () => {
    const { data } = await api.get('/products', { params: { isBestSeller: true, limit: 8, status: 'published' } });
    return data;
  },
  getProductBySlug: async (slug) => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },
  getProductReviews: async (productId) => {
    const { data } = await api.get(`/reviews/product/${productId}`);
    return data;
  },
  createReview: async (productId, reviewData) => {
    const { data } = await api.post('/reviews', { productId, ...reviewData });
    return data;
  },
  trackProductView: async (productId) => {
    const { data } = await api.post(`/products/${productId}/view`);
    return data;
  },
  autocomplete: async (q) => {
    const { data } = await api.get('/products/search/autocomplete', { params: { q } });
    return data;
  },
  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  },
  updateProduct: async (id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
  restoreProduct: async (id) => {
    const { data } = await api.patch(`/products/${id}/restore`);
    return data;
  },
  bulkImport: async (products) => {
    const { data } = await api.post('/products/bulk-import', { products });
    return data;
  },
};

export default productService;
