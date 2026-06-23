import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, searchOpen: false, mobileMenuOpen: false },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, { payload }) => { state.cartOpen = payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, { payload }) => { state.mobileMenuOpen = payload; },
    closeSidebars: (state) => { state.cartOpen = false; state.mobileMenuOpen = false; state.searchOpen = false; },
  },
});

export const { toggleCart, setCartOpen, toggleSearch, toggleMobileMenu, setMobileMenuOpen, closeSidebars } = uiSlice.actions;
export default uiSlice.reducer;
