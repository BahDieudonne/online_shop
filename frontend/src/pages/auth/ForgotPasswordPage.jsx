import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true); toast.success('Reset email sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Forgot Password — CHANCELOR STORE</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-navy-900">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">We'll send a reset link to your email</p>
          </div>
          <div className="card p-6">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📧</div>
                <p className="font-semibold text-gray-800 mb-1">Check your inbox!</p>
                <p className="text-sm text-gray-500">We sent a password reset link to {email}</p>
                <Link to="/login" className="btn-primary mt-4 block text-center py-2.5">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                <p className="text-center text-sm text-gray-500"><Link to="/login" className="text-navy-600 hover:underline">Back to Sign In</Link></p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default ForgotPasswordPage;
