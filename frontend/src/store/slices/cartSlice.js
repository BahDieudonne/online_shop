import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const { data } = await cartService.getCart();
  return data.data;
});

export const addToCart = createAsyncThunk('cart/addItem', async (itemData, { rejectWithValue }) => {
  try {
    const { data } = await cartService.addItem(itemData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeItem', async (itemId) => {
  const { data } = await cartService.removeItem(itemId);
  return data.data;
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }) => {
  const { data } = await cartService.updateItem(itemId, quantity);
  return data.data;
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await cartService.clearCart();
  return null;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], discount: 0, couponCode: null, loading: false },
  reducers: {
    setCartOpen: (state, { payload }) => { state.isOpen = payload; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
        state.discount = payload?.couponDiscount || 0;
        state.couponCode = payload?.couponCode || null;
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
        state.loading = false;
        toast.success('Added to cart! 🛒');
      })
      .addCase(addToCart.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const selectCartTotal = (state) => {
  return state.cart.items
    .filter(i => !i.savedForLater)
    .reduce((sum, i) => sum + (i.price * i.quantity), 0);
};
export const selectCartCount = (state) =>
  state.cart.items.filter(i => !i.savedForLater).reduce((n, i) => n + i.quantity, 0);

export const { setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
