import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try { return await authService.login(credentials); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return await authService.register(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch (_) {}
});

export const refreshToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try { return await authService.refreshToken(); }
  catch (err) { return rejectWithValue(err); }
});

// Called once on app load uses the httpOnly refresh cookie to restore the session
export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  try { return await authService.refreshToken(); }
  catch (err) { return rejectWithValue(null); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,       // lives in memory only never localStorage
    isLoading: false,
    isAuthChecked: false,    // true once checkAuth has completed (success or fail)
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    setUser:     (state, { payload }) => { state.user = payload; state.isAuthenticated = true; },
    clearError:  (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.isLoading = true; state.error = null; };
    const setAuth    = (state, { payload }) => {
      state.isLoading      = false;
      state.user           = payload.user;
      state.accessToken    = payload.accessToken;
      state.isAuthenticated = true;
      state.error          = null;
    };
    const setError = (state, { payload }) => {
      state.isLoading = false;
      state.error     = payload;
    };

    builder
      // login
      .addCase(login.pending,    setLoading)
      .addCase(login.fulfilled,  setAuth)
      .addCase(login.rejected,   setError)
      // register
      .addCase(register.pending,   setLoading)
      .addCase(register.fulfilled, setAuth)
      .addCase(register.rejected,  setError)
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user            = null;
        state.accessToken     = null;
        state.isAuthenticated = false;
        state.isAuthChecked   = true;
      })
      // token refresh (from axios interceptor)
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.accessToken = payload.accessToken;
        if (payload.user) { state.user = payload.user; state.isAuthenticated = true; }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false;
      })
      // checkAuth silent session restore on page load
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.isLoading       = false;
        state.isAuthChecked   = true;
        state.accessToken     = payload.accessToken;
        state.isAuthenticated = true;
        if (payload.user) state.user = payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading       = false;
        state.isAuthChecked   = true;
        state.user            = null;
        state.accessToken     = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
