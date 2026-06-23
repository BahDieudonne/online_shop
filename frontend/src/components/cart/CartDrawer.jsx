import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { setCartOpen } from '../../redux/slices/uiSlice';
import { removeFromCart, updateCartItem, selectCartTotal } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatters';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartOpen } = useSelector((s) => s.ui);
  const { items, loading } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);

  const handleClose = () => dispatch(setCartOpen(false));

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-gradient-to-r from-navy-700 to-purple-700 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5" />
            <h2 className="font-display font-semibold text-lg">Shopping Cart</h2>
            <span className="bg-gold-400 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBagIcon className="w-20 h-20 text-gray-200" />
              <div>
                <p className="font-semibold text-gray-700 text-lg">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some amazing products to get started!</p>
              </div>
              <button onClick={() => { handleClose(); navigate('/shop'); }} className="btn-primary text-sm px-6 py-2">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item._id || item.product?._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <img
                    src={item.product?.images?.[0]?.thumbnail || item.product?.images?.[0]?.url}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      onClick={handleClose}
                      className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-navy-700"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 bg-white rounded-lg border">
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          disabled={item.quantity <= 1 || loading}
                          className="p-1 hover:bg-gray-100 rounded-l-lg disabled:opacity-40 transition-colors"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          disabled={loading}
                          className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Price */}
                      <span className="text-sm font-bold text-navy-700">
                        {formatCurrency((item.price || item.product?.discountPrice) * item.quantity)}
                      </span>
                    </div>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors self-start"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-navy-800 text-lg">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
            <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base font-semibold">
              Proceed to Checkout
            </button>
            <Link
              to="/cart"
              onClick={handleClose}
              className="block text-center text-sm text-navy-600 hover:text-navy-800 font-medium"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
