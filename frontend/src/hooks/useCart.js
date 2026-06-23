import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateCartItem, clearCart, selectCartTotal, selectCartCount } from '../redux/slices/cartSlice';
import { toggleCart } from '../redux/slices/uiSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, discount, couponCode, loading } = useSelector(s => s.cart);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const isOpen = useSelector(s => s.ui.cartOpen);

  return {
    items, discount, couponCode, loading, total, count, isOpen,
    add:    (data) => dispatch(addToCart(data)),
    remove: (id)   => dispatch(removeFromCart(id)),
    update: (id, qty) => dispatch(updateCartItem({ itemId: id, quantity: qty })),
    clear:  ()     => dispatch(clearCart()),
    toggle: ()     => dispatch(toggleCart()),
  };
};
