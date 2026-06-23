import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, mobileMenuOpen: false, searchOpen: false },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, { payload }) => { state.cartOpen = payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, { payload }) => { state.mobileMenuOpen = payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
  },
});

export const { toggleCart, setCartOpen, toggleMobileMenu, setMobileMenuOpen, toggleSearch } = uiSlice.actions;
export default uiSlice.reducer;
