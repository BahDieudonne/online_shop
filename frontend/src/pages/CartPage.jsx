import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { removeFromCart, updateCartItem, selectCartTotal } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatters';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);

  return (
    <>
      <Helmet><title>Shopping Cart CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">Shopping Cart ({items.length})</h1>
        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 mb-4">Your cart is empty</p>
            <Link to="/shop" className="btn-primary px-6 py-2.5">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item._id} className="card p-4 flex gap-4">
                  <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product?.slug}`} className="font-medium text-gray-800 hover:text-navy-700 line-clamp-2">{item.product?.name}</Link>
                    {item.variantName && <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))} disabled={item.quantity <= 1} className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40">−</button>
                        <span className="px-4 py-1.5 border-x border-gray-300 font-medium">{item.quantity}</span>
                        <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))} className="px-3 py-1.5 hover:bg-gray-100">+</button>
                      </div>
                      <span className="font-bold text-navy-700">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => dispatch(removeFromCart(item._id))} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-5 h-fit space-y-4">
              <h2 className="font-semibold text-navy-800">Order Summary</h2>
              <div className="space-y-2 text-sm border-b pb-3">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600">{total >= 50000 ? 'Free' : formatCurrency(3000)}</span></div>
              </div>
              <div className="flex justify-between font-bold text-navy-800 text-base">
                <span>Total</span><span>{formatCurrency(total + (total < 50000 ? 3000 : 0))}</span>
              </div>
              <Link to="/checkout" className="btn-primary block text-center py-3 font-semibold">Proceed to Checkout</Link>
              <Link to="/shop" className="block text-center text-sm text-navy-600 hover:underline">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
