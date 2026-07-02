import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
const NotFoundPage = () => (
  <>
    <Helmet><title>Page Not Found CHANCELOR STORE</title></Helmet>
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="font-display text-8xl font-bold text-navy-100 mb-4">404</div>
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-primary px-6 py-2.5">Go Home</Link>
        <Link to="/shop" className="btn-secondary px-6 py-2.5">Browse Shop</Link>
      </div>
    </div>
  </>
);
export default NotFoundPage;
