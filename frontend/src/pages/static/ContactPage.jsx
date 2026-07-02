import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon,
  CheckCircleIcon, ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const TwitterXIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DEFAULTS = {
  phone: '+237 674 962 803',
  email: 'support@chancelorstore.cm',
  address: 'Douala, Cameroon',
  hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
  whatsapp: '237674962803',
  mapEmbed: '',
  social: { facebook: '', instagram: '', twitter: '' },
};

const ContactPage = () => {
  const [content, setContent] = useState(DEFAULTS);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/settings/page-contact')
      .then(res => { if (res.data?.data) setContent(prev => ({ ...prev, ...res.data.data })); })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const msg = encodeURIComponent(
      `*New message from CHANCELOR STORE*\n\n*Name:* ${form.name}\n*Email:* ${form.email}\n*Subject:* ${form.subject}\n\n*Message:*\n${form.message}`
    );
    window.open(`https://wa.me/${content.whatsapp}?text=${msg}`, '_blank');
    setSent(true);
    setSubmitting(false);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const CARDS = [
    { Icon: PhoneIcon,    label: 'Phone',    value: content.phone,   href: `tel:${content.phone.replace(/\s/g, '')}`, color: 'bg-green-100 text-green-600',  detail: 'Call & SMS available' },
    { Icon: EnvelopeIcon, label: 'Email',    value: content.email,   href: `mailto:${content.email}`,                 color: 'bg-blue-100 text-blue-600',    detail: 'Reply within 24h' },
    { Icon: MapPinIcon,   label: 'Address',  value: content.address, href: null,                                      color: 'bg-red-100 text-red-600',      detail: 'Nationwide delivery' },
    { Icon: ClockIcon,    label: 'Hours',    value: content.hours,   href: null,                                      color: 'bg-purple-100 text-purple-600',detail: 'Sunday on WhatsApp' },
  ];

  const socialLinks = [
    { key: 'facebook',  Icon: FacebookIcon,  label: 'Facebook',   bg: 'bg-blue-50 hover:bg-blue-100',  text: 'text-blue-700' },
    { key: 'instagram', Icon: InstagramIcon, label: 'Instagram',  bg: 'bg-pink-50 hover:bg-pink-100',  text: 'text-pink-700' },
    { key: 'twitter',   Icon: TwitterXIcon,  label: 'Twitter / X',bg: 'bg-sky-50 hover:bg-sky-100',    text: 'text-sky-700'  },
  ].filter(s => content.social?.[s.key]);

  return (
    <>
      <Helmet><title>Contact CHANCELOR STORE</title></Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <ChatBubbleLeftRightIcon className="w-4 h-4" /> We are here for you
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Contact <span className="text-gold-400">Us</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            A question, an order, a problem? Our team gets back to you quickly.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARDS.map(({ Icon, label, value, href, color, detail }, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center hover:shadow-md hover:border-indigo-100 transition-all group">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-bold text-navy-800 hover:text-indigo-600 transition-colors block">{value}</a>
                ) : (
                  <p className="text-sm font-bold text-navy-800">{value}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-5 gap-8">

            {/* Form */}
            <div className="md:col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-navy-900 mb-1">Send a message</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in the form it will open directly in WhatsApp.</p>

              {sent ? (
                <div className="text-center py-10">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-green-700 mb-1">Message sent!</p>
                  <p className="text-sm text-gray-500 mb-6">WhatsApp opened with your pre-filled message.</p>
                  <button onClick={() => setSent(false)} className="text-sm text-indigo-600 hover:underline font-medium">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">Your name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="input-field w-full" />
                    </div>
                    <div>
                      <label className="label-text">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="input-field w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Subject *</label>
                    <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Question about my order..." className="input-field w-full" />
                  </div>
                  <div>
                    <label className="label-text">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your request in detail..." className="input-field w-full" />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" /> Send via WhatsApp
                  </button>
                  <p className="text-xs text-gray-400 text-center">Your message opens in WhatsApp no data is stored.</p>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2 space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ChatBubbleLeftRightIcon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">WhatsApp Direct</h3>
                <p className="text-gray-500 text-sm mb-5">Quick response usually within one hour.</p>
                <a
                  href={`https://wa.me/${content.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors w-full text-center"
                >
                  Open WhatsApp
                </a>
              </div>

              {socialLinks.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-navy-800 mb-4 text-sm uppercase tracking-wide">Follow Us</h3>
                  <div className="space-y-2">
                    {socialLinks.map(({ key, Icon, label, bg, text }) => (
                      <a key={key} href={content.social[key]} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-2.5 ${bg} ${text} rounded-xl text-sm font-medium transition-colors`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {content.mapEmbed && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-48">
                  <iframe src={content.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-3">Frequently Asked Questions?</h2>
          <p className="text-gray-500 mb-6">Check our FAQ for quick answers to the most common questions.</p>
          <a href="/faq" className="inline-block btn-outline px-6 py-2.5 text-sm font-medium">View FAQ</a>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
