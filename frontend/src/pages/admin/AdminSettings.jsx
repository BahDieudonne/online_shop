import React, { useState, useEffect } from 'react';
import {
  CogIcon, GlobeAltIcon, TruckIcon, CreditCardIcon,
  BellIcon, ShieldCheckIcon, UserCircleIcon, CheckIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const TABS = [
  { key: 'general', label: 'General', icon: GlobeAltIcon },
  { key: 'shipping', label: 'Shipping', icon: TruckIcon },
  { key: 'payment', label: 'Payments', icon: CreditCardIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon },
  { key: 'security', label: 'Security', icon: ShieldCheckIcon },
  { key: 'profile', label: 'My Account', icon: UserCircleIcon },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [tab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/settings/${tab}`);
      setSettings(res.data || {});
    } catch {
      // Use defaults if endpoint not yet implemented
      setSettings(getDefaults(tab));
    } finally { setLoading(false); }
  };

  const getDefaults = (t) => ({
    general: {
      siteName: 'CHANCELOR STORE', siteDescription: 'Your trusted online store in Cameroon',
      siteEmail: 'info@chancelor.cm', sitePhone: '+237 674 962 803', siteAddress: 'Cameroon',
      currency: 'XAF', language: 'fr', timezone: 'Africa/Douala', maintenanceMode: false,
    },
    shipping: {
      freeShippingThreshold: 50000, defaultShippingCost: 2000,
      enablePickup: true, pickupAddress: 'Douala, Cameroon',
      regions: ['Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest'],
      estimatedDelivery: '2-5 business days',
    },
    payment: {
      mtnMomoEnabled: true, mtnMomoNumber: '+237 674 962 803',
      orangeMoneyEnabled: true, orangeMoneyNumber: '',
      cashOnDeliveryEnabled: true, bankTransferEnabled: true,
      stripeEnabled: false, stripePublicKey: '',
    },
    notifications: {
      orderConfirmation: true, orderShipped: true, orderDelivered: true,
      lowStockAlert: true, lowStockThreshold: 5,
      newCustomerAlert: true, newOrderAlert: true,
      emailFooter: 'CHANCELOR STORE · Cameroon', adminEmail: 'admin@chancelor.cm',
    },
    security: {
      requireEmailVerification: false, twoFactorEnabled: false,
      sessionTimeout: 60, maxLoginAttempts: 5, passwordMinLength: 8,
    },
    profile: {
      firstName: '', lastName: '', email: '', phone: '', currentPassword: '', newPassword: '',
    },
  }[t] || {});

  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/settings/${tab}`, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const renderGeneral = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="label-text">Store Name</label>
          <input value={settings.siteName || ''} onChange={e => set('siteName', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Support Email</label>
          <input type="email" value={settings.siteEmail || ''} onChange={e => set('siteEmail', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Phone Number</label>
          <input value={settings.sitePhone || ''} onChange={e => set('sitePhone', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Currency</label>
          <select value={settings.currency || 'XAF'} onChange={e => set('currency', e.target.value)} className="input-field w-full">
            <option value="XAF">XAF (FCFA)</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div><label className="label-text">Language</label>
          <select value={settings.language || 'fr'} onChange={e => set('language', e.target.value)} className="input-field w-full">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="fr-en">Bilingual (FR/EN)</option>
          </select>
        </div>
        <div><label className="label-text">Timezone</label>
          <select value={settings.timezone || 'Africa/Douala'} onChange={e => set('timezone', e.target.value)} className="input-field w-full">
            <option value="Africa/Douala">Africa/Douala (WAT +1)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
      <div><label className="label-text">Store Description</label>
        <textarea rows={3} value={settings.siteDescription || ''} onChange={e => set('siteDescription', e.target.value)} className="input-field w-full" /></div>
      <div><label className="label-text">Physical Address</label>
        <textarea rows={2} value={settings.siteAddress || ''} onChange={e => set('siteAddress', e.target.value)} className="input-field w-full" /></div>
      <label className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200 cursor-pointer">
        <input type="checkbox" checked={settings.maintenanceMode || false}
          onChange={e => set('maintenanceMode', e.target.checked)} className="w-4 h-4 text-yellow-500 rounded" />
        <div>
          <p className="font-medium text-yellow-800">Maintenance Mode</p>
          <p className="text-sm text-yellow-600">When enabled, customers see a maintenance page. Admins can still access the store.</p>
        </div>
      </label>
    </div>
  );

  const renderShipping = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="label-text">Free Shipping Threshold (FCFA)</label>
          <input type="number" value={settings.freeShippingThreshold || 0}
            onChange={e => set('freeShippingThreshold', Number(e.target.value))} className="input-field w-full" /></div>
        <div><label className="label-text">Default Shipping Cost (FCFA)</label>
          <input type="number" value={settings.defaultShippingCost || 0}
            onChange={e => set('defaultShippingCost', Number(e.target.value))} className="input-field w-full" /></div>
        <div><label className="label-text">Estimated Delivery</label>
          <input value={settings.estimatedDelivery || ''} onChange={e => set('estimatedDelivery', e.target.value)}
            placeholder="2-5 business days" className="input-field w-full" /></div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={settings.enablePickup || false}
          onChange={e => set('enablePickup', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
        <span className="text-sm font-medium text-gray-700">Enable In-Store Pickup</span>
      </label>
      {settings.enablePickup && (
        <div><label className="label-text">Pickup Address</label>
          <input value={settings.pickupAddress || ''} onChange={e => set('pickupAddress', e.target.value)} className="input-field w-full" /></div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      {[
        { key: 'mtnMomoEnabled', label: 'MTN Mobile Money', color: 'yellow', numberKey: 'mtnMomoNumber', numberLabel: 'MTN MoMo Number' },
        { key: 'orangeMoneyEnabled', label: 'Orange Money', color: 'orange', numberKey: 'orangeMoneyNumber', numberLabel: 'Orange Money Number' },
        { key: 'cashOnDeliveryEnabled', label: 'Cash on Delivery', color: 'green' },
        { key: 'bankTransferEnabled', label: 'Bank Transfer', color: 'blue' },
      ].map(m => (
        <div key={m.key} className="p-4 rounded-xl border border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input type="checkbox" checked={settings[m.key] || false}
              onChange={e => set(m.key, e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
            <span className="font-medium text-gray-900">{m.label}</span>
          </label>
          {m.numberKey && settings[m.key] && (
            <input value={settings[m.numberKey] || ''} onChange={e => set(m.numberKey, e.target.value)}
              placeholder={m.numberLabel} className="input-field w-full text-sm" />
          )}
        </div>
      ))}
      <div className="p-4 rounded-xl border border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input type="checkbox" checked={settings.stripeEnabled || false}
            onChange={e => set('stripeEnabled', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
          <span className="font-medium text-gray-900">Stripe (Card Payments)</span>
        </label>
        {settings.stripeEnabled && (
          <input value={settings.stripePublicKey || ''} onChange={e => set('stripePublicKey', e.target.value)}
            placeholder="pk_live_..." className="input-field w-full font-mono text-sm" />
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="label-text">Admin Email</label>
          <input type="email" value={settings.adminEmail || ''} onChange={e => set('adminEmail', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Low Stock Threshold</label>
          <input type="number" value={settings.lowStockThreshold || 5} onChange={e => set('lowStockThreshold', Number(e.target.value))} className="input-field w-full" /></div>
      </div>
      <div className="space-y-3">
        {[
          ['orderConfirmation', 'Send order confirmation to customers'],
          ['orderShipped', 'Notify customers when order is shipped'],
          ['orderDelivered', 'Notify customers when order is delivered'],
          ['lowStockAlert', 'Alert admin on low stock'],
          ['newCustomerAlert', 'Alert admin when new customer registers'],
          ['newOrderAlert', 'Alert admin on new orders'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={settings[key] || false}
              onChange={e => set(key, e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label-text">Session Timeout (minutes)</label>
          <input type="number" value={settings.sessionTimeout || 60} onChange={e => set('sessionTimeout', Number(e.target.value))} className="input-field w-full" /></div>
        <div><label className="label-text">Max Login Attempts</label>
          <input type="number" value={settings.maxLoginAttempts || 5} onChange={e => set('maxLoginAttempts', Number(e.target.value))} className="input-field w-full" /></div>
        <div><label className="label-text">Min Password Length</label>
          <input type="number" value={settings.passwordMinLength || 8} onChange={e => set('passwordMinLength', Number(e.target.value))} className="input-field w-full" /></div>
      </div>
      <div className="space-y-3 mt-2">
        {[
          ['requireEmailVerification', 'Require email verification for new accounts'],
          ['twoFactorEnabled', 'Enable two-factor authentication for admins'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={settings[key] || false}
              onChange={e => set(key, e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label-text">First Name</label>
          <input value={settings.firstName || ''} onChange={e => set('firstName', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Last Name</label>
          <input value={settings.lastName || ''} onChange={e => set('lastName', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Email</label>
          <input type="email" value={settings.email || ''} onChange={e => set('email', e.target.value)} className="input-field w-full" /></div>
        <div><label className="label-text">Phone</label>
          <input value={settings.phone || ''} onChange={e => set('phone', e.target.value)} className="input-field w-full" /></div>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Change Password</h3>
        <div className="space-y-3">
          <div><label className="label-text">Current Password</label>
            <input type="password" value={settings.currentPassword || ''} onChange={e => set('currentPassword', e.target.value)} className="input-field w-full" /></div>
          <div><label className="label-text">New Password</label>
            <input type="password" value={settings.newPassword || ''} onChange={e => set('newPassword', e.target.value)} className="input-field w-full" /></div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    switch (tab) {
      case 'general': return renderGeneral();
      case 'shipping': return renderShipping();
      case 'payment': return renderPayments();
      case 'notifications': return renderNotifications();
      case 'security': return renderSecurity();
      case 'profile': return renderProfile();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors border-b border-gray-100 last:border-0
                    ${tab === t.key ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600 pl-3' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {TABS.find(t => t.key === tab)?.label}
            </h2>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckIcon className="w-4 h-4" /> Saved!
              </div>
            )}
          </div>
          {renderContent()}
          {!loading && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Spinner size="sm" /> : <CheckIcon className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
