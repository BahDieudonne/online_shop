import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { login, clearError } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: loading, error: authError } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '/';

  const ADMIN_ROLES = ['admin', 'super_admin', 'manager', 'staff', 'customer_support'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await dispatch(login(form)).unwrap();
      const role = result?.user?.role;
      const isAdmin = ADMIN_ROLES.includes(role);
      // Never redirect a non-admin user into the /admin section
      const safeRedirect = redirect.startsWith('/admin') && !isAdmin ? '/' : redirect;
      navigate(safeRedirect);
    } catch (err) {
      setError(err || 'Invalid email or password');
    }
  };

  return (
    <>
      <Helmet><title>Sign In — CHANCELOR STORE</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-navy-700 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-navy-800 text-xl leading-tight">CHANCELOR</div>
                <div className="text-[10px] text-gold-500 font-semibold tracking-widest">STORE</div>
              </div>
            </Link>
            <h1 className="font-display text-2xl font-bold text-navy-900">Welcome back!</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue shopping</p>
          </div>

          <div className="card p-6">
            {(error || authError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error || authError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => { dispatch(clearError()); setError(''); setForm((f) => ({ ...f, email: e.target.value })); }}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-navy-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="input pr-10"
                    placeholder="Your password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-navy-600 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
