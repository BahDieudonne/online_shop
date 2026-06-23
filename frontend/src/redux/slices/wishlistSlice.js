import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const { data } = await cartService.getWishlist();
  return data.data?.items || [];
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState }) => {
  const { items } = getState().wishlist;
  const exists = items.some(i => (i.product?._id || i.product) === productId);
  if (exists) {
    await cartService.removeFromWishlist(productId);
    toast.success('Removed from wishlist');
  } else {
    await cartService.addToWishlist(productId);
    toast.success('Added to wishlist');
  }
  const { data } = await cartService.getWishlist();
  return data.data?.items || [];
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    setWishlist: (state, { payload }) => { state.items = payload; },
    toggleItem: (state, { payload: productId }) => {
      const idx = state.items.findIndex(i => i.product === productId || i.product?._id === productId);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.push({ product: productId, addedAt: new Date().toISOString() });
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchWishlist.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(toggleWishlist.pending, (state) => { state.loading = true; })
      .addCase(toggleWishlist.fulfilled, (state, { payload }) => {
        state.items = payload; state.loading = false;
      })
      .addCase(toggleWishlist.rejected, (state) => { state.loading = false; });
  },
});

export const { setWishlist, toggleItem } = wishlistSlice.actions;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(i => (i.product?._id || i.product) === productId);
export const selectWishlistCount = (state) => state.wishlist.items.length;
export default wishlistSlice.reducer;
