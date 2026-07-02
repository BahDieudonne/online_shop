import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { register } from '../../redux/slices/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please accept the terms to continue'); return; }
    try {
      await dispatch(register(form)).unwrap();
      navigate('/');
    } catch (err) {
      setError(err || 'Registration failed. Please try again.');
    }
  };

  const F = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <>
      <Helmet><title>Create Account — CHANCELOR STORE</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-navy-700 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-navy-800 text-xl leading-tight">CHANCELOR</div>
                <div className="text-[10px] text-gold-500 font-semibold tracking-widest">STORE</div>
              </div>
            </Link>
            <h1 className="font-display text-2xl font-bold text-navy-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of shoppers in Cameroon</p>
          </div>

          <div className="card p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" required className="input" placeholder="John" {...F('firstName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" required className="input" placeholder="Doe" {...F('lastName')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" required autoComplete="email" className="input" placeholder="you@example.com" {...F('email')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="input" placeholder="+237 6XX XXX XXX" {...F('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required autoComplete="new-password" className="input pr-10" placeholder="Min 8 characters" {...F('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" required autoComplete="new-password" className="input" placeholder="Repeat password" {...F('confirmPassword')} />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-navy-700" />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-navy-600 hover:underline font-medium">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-navy-600 hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-navy-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
