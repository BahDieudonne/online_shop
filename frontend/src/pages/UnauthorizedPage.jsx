import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
const UnauthorizedPage = () => (
  <>
    <Helmet><title>Unauthorized — CHANCELOR STORE</title></Helmet>
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">Access Denied</h1>
      <p className="text-gray-500 mb-8">You don't have permission to view this page.</p>
      <Link to="/" className="btn-primary px-6 py-2.5">Go Home</Link>
    </div>
  </>
);
export default UnauthorizedPage;
