import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CheckCircleIcon, LockClosedIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  // Build enabled payment methods list dynamically
  const enabledMethods = [
    settings.payment.mtnMomoEnabled && 'MTN MoMo',
    settings.payment.orangeMoneyEnabled && 'Orange Money',
    settings.payment.stripeEnabled && 'Card',
    settings.payment.bankTransferEnabled && 'Bank Transfer',
    settings.payment.cashOnDeliveryEnabled && 'Cash on Delivery',
  ].filter(Boolean);

  return (
    <footer className="bg-navy-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-navy-800 to-purple-900 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">{t('footer.newsletter.title')}</h3>
            <p className="text-gray-300 text-sm mt-1">{t('footer.newsletter.subtitle')}</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-gold-400 font-semibold"><CheckCircleIcon className="w-5 h-5" /> {t('footer.newsletter.subscribed')}</div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                required
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <button type="submit" className="btn-gold text-sm px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap">
                {t('footer.newsletter.subscribe')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight">CHANCELOR</div>
                <div className="text-[10px] text-gold-400 font-semibold tracking-widest -mt-1">STORE</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your premier shopping destination in Cameroon. Quality products, fast delivery, and unbeatable prices.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+237674962803" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <PhoneIcon className="w-4 h-4 text-gold-400 flex-shrink-0" />
                {settings.general.sitePhone || '+237 674 962 803'}
              </a>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPinIcon className="w-4 h-4 text-gold-400 flex-shrink-0" />
                Cameroon, Central Africa
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a href="https://whatsapp.com/channel/0029VbAZCCi77qVYUmoUd51a" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-green-500 transition-colors">W</a>
              <a href="#" className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-blue-500 transition-colors">f</a>
              <a href="#" className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-pink-500 transition-colors">ig</a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-sm">
              {['New Arrivals', 'Best Sellers', 'Flash Sales', 'Electronics', 'Fashion', 'Home & Living'].map((item) => (
                <li key={item}><Link to={`/shop?category=${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-gold-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.myAccount')}</h4>
            <ul className="space-y-2 text-sm">
              {[['My Profile', '/account'], ['My Orders', '/account/orders'], ['Wishlist', '/account/wishlist'], ['Track Order', '/track-order'], ['Support', '/support']].map(([label, path]) => (
                <li key={label}><Link to={path} className="hover:text-gold-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.helpInfo')}</h4>
            <ul className="space-y-2 text-sm">
              {[['FAQ', '/faq'], ['Shipping Policy', '/shipping-policy'], ['Return Policy', '/return-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms'], ['Contact Us', '/contact']].map(([label, path]) => (
                <li key={label}><Link to={path} className="hover:text-gold-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Payment — dynamic based on admin settings */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.weAccept')}</h4>
            <div className="grid grid-cols-2 gap-2">
              {enabledMethods.map((pm) => (
                <div key={pm} className="bg-navy-800 rounded px-2 py-1.5 text-xs text-center text-gray-300">{pm}</div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Trusted & Secure</div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-900/40 text-green-400 text-xs px-2 py-1 rounded flex items-center gap-1"><LockClosedIcon className="w-3 h-3" /> SSL Secured</span>
                <span className="bg-blue-900/40 text-blue-400 text-xs px-2 py-1 rounded flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" /> Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-700 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1 flex-wrap">
            © {new Date().getFullYear()} {settings.general.siteName || 'CHANCELOR STORE'}. {t('footer.rights')} {t('footer.madeIn')}
          </span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-gray-300">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms</Link>
            <Link to="/sitemap" className="hover:text-gray-300">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
