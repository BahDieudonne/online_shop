import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { Toaster } from 'react-hot-toast';

const CustomerLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Header />
    <CartDrawer />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        success: { style: { background: '#1a237e', color: '#fff' } },
        error: { style: { background: '#dc2626', color: '#fff' } },
      }}
    />
  </div>
);

export default CustomerLayout;
