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
      <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-navy-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
      </svg>
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500 font-body">Loading CHANCELOR STORE...</p>
    </div>
  </div>
);

export default Spinner;
