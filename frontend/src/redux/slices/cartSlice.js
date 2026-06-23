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

export const clearCartAsync = createAsyncThunk('cart/clear', async () => {
  await cartService.clearCart();
  return null;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, couponDiscount: 0, loading: false },
  reducers: {
    setCart: (state, { payload }) => {
      state.items = payload.items || [];
      state.coupon = payload.coupon || null;
      state.couponDiscount = payload.couponDiscount || 0;
    },
    addItem: (state, { payload }) => {
      const existing = state.items.find(i => i.product === payload.product && i.variantId === payload.variantId);
      if (existing) existing.quantity += payload.quantity || 1;
      else state.items.push({ ...payload, quantity: payload.quantity || 1 });
    },
    removeItem: (state, { payload }) => {
      state.items = state.items.filter(i => i._id !== payload);
    },
    updateQuantity: (state, { payload: { id, quantity } }) => {
      const item = state.items.find(i => i._id === id);
      if (item) item.quantity = quantity;
    },
    clearCart: (state) => { state.items = []; state.coupon = null; state.couponDiscount = 0; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
        state.coupon = payload?.coupon || null;
        state.couponDiscount = payload?.couponDiscount || 0;
      })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
        state.loading = false;
        toast.success('Added to cart!');
      })
      .addCase(addToCart.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload || 'Failed to add to cart');
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = []; state.coupon = null; state.couponDiscount = 0;
      });
  },
});

export const { setCart, addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.filter(i => !i.savedForLater).reduce((s, i) => s + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.filter(i => !i.savedForLater).reduce((s, i) => s + i.price * i.quantity, 0);
export const selectCartSubtotal = selectCartTotal;
export default cartSlice.reducer;
