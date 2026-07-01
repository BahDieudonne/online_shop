import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// productService methods return the response body directly (already unwrapped from axios)
// e.g. { products: [...], pagination: {...} }
export const fetchProducts = createAsyncThunk('products/fetch', async (params) => {
  return await productService.getProducts(params);
});

export const fetchFeatured = createAsyncThunk('products/featured', async () => {
  const res = await productService.getFeatured();
  return res.products || [];
});

export const fetchNewArrivals = createAsyncThunk('products/newArrivals', async () => {
  const res = await productService.getNewArrivals();
  return res.products || [];
});

export const fetchBestSellers = createAsyncThunk('products/bestSellers', async () => {
  const res = await productService.getBestSellers();
  return res.products || [];
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], featured: [], newArrivals: [], bestSellers: [],
    loading: { fetch: false, featured: false, newArrivals: false, bestSellers: false },
    error: null, pagination: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchProducts.pending,   (state) => { state.loading.fetch = true; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.items = payload.products || [];
        state.pagination = payload.pagination || null;
        state.loading.fetch = false;
      })
      .addCase(fetchProducts.rejected,  (state, { error }) => {
        state.loading.fetch = false; state.error = error.message;
      })
      .addCase(fetchFeatured.pending,   (state) => { state.loading.featured = true; })
      .addCase(fetchFeatured.fulfilled, (state, { payload }) => {
        state.featured = payload; state.loading.featured = false;
      })
      .addCase(fetchNewArrivals.pending,   (state) => { state.loading.newArrivals = true; })
      .addCase(fetchNewArrivals.fulfilled, (state, { payload }) => {
        state.newArrivals = payload; state.loading.newArrivals = false;
      })
      .addCase(fetchBestSellers.pending,   (state) => { state.loading.bestSellers = true; })
      .addCase(fetchBestSellers.fulfilled, (state, { payload }) => {
        state.bestSellers = payload; state.loading.bestSellers = false;
      });
  },
});

export default productSlice.reducer;
