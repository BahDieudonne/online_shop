// Format XAF currency (Central African Franc)
export const formatCurrency = (amount, currency = 'XAF') => {
  if (currency === 'XAF') {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency', currency: 'XAF',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (date, options = {}) =>
  new Intl.DateTimeFormat('fr-CM', {
    year: 'numeric', month: 'short', day: 'numeric', ...options,
  }).format(new Date(date));

export const formatRelativeTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const truncate = (str, length = 60) =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const calcDiscount = (original, discounted) =>
  Math.round(((original - discounted) / original) * 100);

export const formatDateTime = (date, options = {}) =>
  new Intl.DateTimeFormat('fr-CM', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', ...options,
  }).format(new Date(date));
