import React from 'react';

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  gold:      'btn-gold',
  ghost:     'text-brand-purple hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors',
  danger:    'bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 active:scale-95 transition-all',
};

const sizes = {
  sm:  'text-sm px-3 py-2',
  md:  '',
  lg:  'text-lg px-8 py-4',
  icon: 'p-2 rounded-full',
};

export const Button = ({
  children, variant = 'primary', size = 'md',
  loading, disabled, className = '', ...props
}) => (
  <button
    className={`${variants[variant]} ${sizes[size]} ${className} relative`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </span>
    )}
    <span className={loading ? 'invisible' : ''}>{children}</span>
  </button>
);

export default Button;
