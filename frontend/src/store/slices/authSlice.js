import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.register(userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const data = await authService.getMe();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout().catch(() => {});
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    const setPending = (state) => { state.loading = true; state.error = null; };
    b
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload.user; state.initialized = true;
        toast.success(`Welcome back, ${payload.user?.firstName}!`);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
        toast.error(payload);
      })
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload.user; state.initialized = true;
        toast.success('Account created! Welcome to CHANCELOR STORE');
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
        toast.error(payload);
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload; state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null; state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; toast.success('Logged out successfully');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
