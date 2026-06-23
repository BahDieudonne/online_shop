export const Spinner = ({ size = 'md', color = 'purple', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colors = {
    purple: 'border-brand-purple border-t-transparent',
    white:  'border-white border-t-transparent',
    gold:   'border-brand-gold border-t-transparent',
  };
  return (
    <div className={`${sizes[size]} border-3 rounded-full animate-spin border-2 ${colors[color]} ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-light">
    <div className="text-center">
      <div className="text-4xl mb-4">🛍</div>
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500 font-body">Loading CHANCELOR STORE...</p>
    </div>
  </div>
);

export default Spinner;
