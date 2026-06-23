import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading: loading, error, isAuthenticated } = useSelector(s => s.auth);

  const isAdmin = ['super_admin','admin','manager','staff','customer_support'].includes(user?.role);
  const isSuperAdmin = user?.role === 'super_admin';

  return {
    user, loading, error, isAuthenticated,
    isAdmin, isSuperAdmin,
    login:    (data) => dispatch(login(data)),
    register: (data) => dispatch(register(data)),
    logout:   ()     => dispatch(logout()),
  };
};
