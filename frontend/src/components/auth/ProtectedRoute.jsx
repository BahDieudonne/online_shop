import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageLoader } from '../common/Spinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager', 'staff', 'customer_support']}>
    {children}
  </ProtectedRoute>
);
