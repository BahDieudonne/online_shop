import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Reset Password — CHANCELOR STORE</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-6 space-y-4">
            <h1 className="font-display text-2xl font-bold text-navy-900">Set New Password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="Repeat password" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default ResetPasswordPage;
