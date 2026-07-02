import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HomeIcon, ShoppingBagIcon, TagIcon, ShoppingCartIcon,
  UsersIcon, TicketIcon, ChartBarIcon, MegaphoneIcon,
  DocumentTextIcon, ArrowLeftOnRectangleIcon, Bars3Icon,
  XMarkIcon, CogIcon, BellIcon, CubeIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../../redux/slices/authSlice';
import api from '../../services/api';

const NAV = [
  { label: 'Dashboard', icon: HomeIcon, path: '/admin' },
  { label: 'Products', icon: ShoppingBagIcon, path: '/admin/products' },
  { label: 'Categories', icon: TagIcon, path: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCartIcon, path: '/admin/orders' },
  { label: 'Customers', icon: UsersIcon, path: '/admin/customers' },
  { label: 'Inventory', icon: CubeIcon, path: '/admin/inventory' },
  { label: 'Coupons', icon: TicketIcon, path: '/admin/coupons' },
  { label: 'Analytics', icon: ChartBarIcon, path: '/admin/analytics' },
  { label: 'Marketing', icon: MegaphoneIcon, path: '/admin/marketing' },
  { label: 'Content', icon: DocumentTextIcon, path: '/admin/content' },
  { label: 'Settings', icon: CogIcon, path: '/admin/settings' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    api.get('/notifications').then(res => {
      const inner = res.data?.data;
      const list = Array.isArray(inner) ? inner : (Array.isArray(inner?.notifications) ? inner.notifications : []);
      setNotifications(list);
      setUnreadCount(typeof inner?.unread === 'number' ? inner.unread : list.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-navy-900 text-white ${mobile ? 'w-64' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-gold-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">CHANCELOR</div>
            <div className="text-[9px] text-gold-400 font-semibold tracking-widest">ADMIN</div>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-navy-700 bg-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-gold-400 flex items-center justify-center text-white font-bold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gold-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/admin'}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold-500 text-navy-900 shadow-sm'
                  : 'text-gray-300 hover:bg-navy-700 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-navy-700 space-y-1">
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-navy-700 hover:text-white transition-colors">
          <ShoppingBagIcon className="w-5 h-5" />
          View Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex-1 md:flex-none">
            <h1 className="font-display font-semibold text-navy-800 text-lg hidden md:block">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 text-gray-500 hover:text-navy-700 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <button
                          key={n._id}
                          onClick={() => { markRead(n._id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                            <div className={!n.isRead ? '' : 'pl-5'}>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleString('fr-CM', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 10 && (
                    <div className="border-t border-gray-100 px-4 py-2 text-center">
                      <span className="text-xs text-gray-400">Showing 10 of {notifications.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
