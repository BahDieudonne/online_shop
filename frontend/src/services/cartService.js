import api from './api';

export const cartService = {
  getCart:     ()             => api.get('/cart'),
  addItem:     (data)        => api.post('/cart/items', data),
  updateItem:  (itemId, qty) => api.put(`/cart/items/${itemId}`, { quantity: qty }),
  removeItem:  (itemId)      => api.delete(`/cart/items/${itemId}`),
  clearCart:   ()            => api.delete('/cart'),
  applyCoupon: (code)        => api.post('/cart/coupon', { code }),
  // Wishlist
  getWishlist:      ()       => api.get('/wishlist'),
  addToWishlist:    (pid)    => api.post('/wishlist/items', { productId: pid }),
  removeFromWishlist: (pid)  => api.delete(`/wishlist/items/${pid}`),
};
