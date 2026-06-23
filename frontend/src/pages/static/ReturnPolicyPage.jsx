import React from 'react';
import { Helmet } from 'react-helmet-async';
const ReturnPolicyPage = () => (
  <>
    <Helmet><title>Return Policy — CHANCELOR STORE</title></Helmet>
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-6">Return Policy</h1>
      <div className="card p-6 text-gray-600 space-y-4">
        <p>This page content is managed via the Admin CMS (Admin → Content).</p>
        <p>For enquiries, contact us at <a href="tel:+237674962803" className="text-navy-600 hover:underline">+237 674 962 803</a> or via WhatsApp.</p>
      </div>
    </div>
  </>
);
export default ReturnPolicyPage;
