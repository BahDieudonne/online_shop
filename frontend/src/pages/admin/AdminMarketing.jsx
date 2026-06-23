import React, { useState } from 'react';
import {
  MegaphoneIcon, EnvelopeIcon, BellIcon, TagIcon,
  PhotoIcon, PlusIcon, PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const TAB_CONFIG = [
  { key: 'email', label: 'Email Campaign', icon: EnvelopeIcon },
  { key: 'push', label: 'Push Notification', icon: BellIcon },
  { key: 'banner', label: 'Promo Banners', icon: PhotoIcon },
  { key: 'flash', label: 'Flash Sale', icon: TagIcon },
];

const BLANK_EMAIL = { subject: '', preheader: '', audience: 'all', body: '', scheduleAt: '' };
const BLANK_PUSH  = { title: '', body: '', url: '', audience: 'all', scheduleAt: '' };
const BLANK_FLASH = { name: '', discountType: 'percentage', discountValue: '', startAt: '', endAt: '', products: '' };

export default function AdminMarketing() {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState(BLANK_EMAIL);
  const [push, setPush] = useState(BLANK_PUSH);
  const [flash, setFlash] = useState(BLANK_FLASH);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  const sendEmail = async () => {
    try {
      setSending(true);
      await api.post('/notifications/email-campaign', email);
      setSuccess('Email campaign queued successfully!');
      setEmail(BLANK_EMAIL);
    } catch (err) { console.error(err); }
    finally { setSending(false); setTimeout(() => setSuccess(''), 4000); }
  };

  const sendPush = async () => {
    try {
      setSending(true);
      await api.post('/notifications/push-campaign', push);
      setSuccess('Push notification sent!');
      setPush(BLANK_PUSH);
    } catch (err) { console.error(err); }
    finally { setSending(false); setTimeout(() => setSuccess(''), 4000); }
  };

  const createFlash = async () => {
    try {
      setSending(true);
      await api.post('/coupons/flash-sale', flash);
      setSuccess('Flash sale created!');
      setFlash(BLANK_FLASH);
    } catch (err) { console.error(err); }
    finally { setSending(false); setTimeout(() => setSuccess(''), 4000); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-sm text-gray-500">Email campaigns, push notifications, promo banners, and flash sales</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          ✓ {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TAB_CONFIG.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl">
        {/* Email Campaign */}
        {tab === 'email' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-indigo-500" /> Email Campaign
            </h2>
            <div>
              <label className="label-text">Audience</label>
              <select value={email.audience} onChange={e => setEmail(f => ({ ...f, audience: e.target.value }))}
                className="input-field w-full">
                <option value="all">All Customers</option>
                <option value="active">Active customers (ordered in last 90 days)</option>
                <option value="inactive">Inactive customers</option>
                <option value="newsletter">Newsletter subscribers</option>
              </select>
            </div>
            <div>
              <label className="label-text">Subject Line *</label>
              <input value={email.subject} onChange={e => setEmail(f => ({ ...f, subject: e.target.value }))}
                placeholder="🎉 Exclusive offer just for you!" className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Preheader (preview text)</label>
              <input value={email.preheader} onChange={e => setEmail(f => ({ ...f, preheader: e.target.value }))}
                placeholder="Open to reveal your special discount…" className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Email Body (HTML supported) *</label>
              <textarea value={email.body} onChange={e => setEmail(f => ({ ...f, body: e.target.value }))}
                rows={8} className="input-field w-full font-mono text-sm"
                placeholder="<h1>Hello {{firstName}},</h1><p>We have great deals for you today…</p>" />
              <p className="text-xs text-gray-400 mt-1">Use &#123;&#123;firstName&#125;&#125;, &#123;&#123;email&#125;&#125; as placeholders.</p>
            </div>
            <div>
              <label className="label-text">Schedule (optional)</label>
              <input type="datetime-local" value={email.scheduleAt}
                onChange={e => setEmail(f => ({ ...f, scheduleAt: e.target.value }))}
                className="input-field w-full" />
              <p className="text-xs text-gray-400 mt-1">Leave blank to send immediately.</p>
            </div>
            <button onClick={sendEmail} disabled={sending || !email.subject || !email.body}
              className="btn-primary flex items-center gap-2">
              {sending ? <Spinner size="sm" /> : <PaperAirplaneIcon className="w-4 h-4" />}
              {email.scheduleAt ? 'Schedule Campaign' : 'Send Now'}
            </button>
          </div>
        )}

        {/* Push Notifications */}
        {tab === 'push' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-purple-500" /> Push Notification
            </h2>
            <div>
              <label className="label-text">Audience</label>
              <select value={push.audience} onChange={e => setPush(f => ({ ...f, audience: e.target.value }))}
                className="input-field w-full">
                <option value="all">All subscribed users</option>
                <option value="active">Active customers</option>
              </select>
            </div>
            <div>
              <label className="label-text">Title *</label>
              <input value={push.title} onChange={e => setPush(f => ({ ...f, title: e.target.value }))}
                placeholder="New arrivals just landed! 🛍" className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Message *</label>
              <textarea value={push.body} onChange={e => setPush(f => ({ ...f, body: e.target.value }))}
                rows={3} className="input-field w-full"
                placeholder="Check out our latest collection now…" />
            </div>
            <div>
              <label className="label-text">Link URL</label>
              <input value={push.url} onChange={e => setPush(f => ({ ...f, url: e.target.value }))}
                placeholder="https://chancelor.cm/shop" className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Schedule (optional)</label>
              <input type="datetime-local" value={push.scheduleAt}
                onChange={e => setPush(f => ({ ...f, scheduleAt: e.target.value }))}
                className="input-field w-full" />
            </div>
            <button onClick={sendPush} disabled={sending || !push.title || !push.body}
              className="btn-primary flex items-center gap-2">
              {sending ? <Spinner size="sm" /> : <BellIcon className="w-4 h-4" />}
              Send Push Notification
            </button>
          </div>
        )}

        {/* Promo Banners */}
        {tab === 'banner' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PhotoIcon className="w-5 h-5 text-yellow-500" /> Promo Banners
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Homepage banners are managed via the <strong>Content Management</strong> section. 
              Go to Content → Banners to add, edit, and reorder homepage promotional banners.
            </div>
            <p className="text-sm text-gray-600">
              Banners support full-width hero images with title, subtitle, CTA button, and link. 
              You can schedule banners to appear on specific dates for promotions or seasonal campaigns.
            </p>
            <button onClick={() => window.location.href = '/admin/content'} className="btn-outline">
              Go to Content Manager →
            </button>
          </div>
        )}

        {/* Flash Sale */}
        {tab === 'flash' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-red-500" /> Flash Sale
            </h2>
            <div>
              <label className="label-text">Sale Name *</label>
              <input value={flash.name} onChange={e => setFlash(f => ({ ...f, name: e.target.value }))}
                placeholder="Weekend Mega Sale" className="input-field w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Discount Type</label>
                <select value={flash.discountType} onChange={e => setFlash(f => ({ ...f, discountType: e.target.value }))}
                  className="input-field w-full">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="label-text">Value *</label>
                <input type="number" value={flash.discountValue}
                  onChange={e => setFlash(f => ({ ...f, discountValue: e.target.value }))}
                  placeholder={flash.discountType === 'percentage' ? '20' : '5000'}
                  className="input-field w-full" min="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Start *</label>
                <input type="datetime-local" value={flash.startAt}
                  onChange={e => setFlash(f => ({ ...f, startAt: e.target.value }))}
                  className="input-field w-full" />
              </div>
              <div>
                <label className="label-text">End *</label>
                <input type="datetime-local" value={flash.endAt}
                  onChange={e => setFlash(f => ({ ...f, endAt: e.target.value }))}
                  className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="label-text">Product IDs (comma-separated, blank = all)</label>
              <textarea value={flash.products} onChange={e => setFlash(f => ({ ...f, products: e.target.value }))}
                rows={3} className="input-field w-full font-mono text-sm"
                placeholder="Leave blank to apply to all products, or enter specific product IDs" />
            </div>
            <button onClick={createFlash} disabled={sending || !flash.name || !flash.startAt || !flash.endAt}
              className="btn-primary flex items-center gap-2">
              {sending ? <Spinner size="sm" /> : <TagIcon className="w-4 h-4" />}
              Create Flash Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
