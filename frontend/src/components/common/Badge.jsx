const colorMap = {
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
  gold:   'bg-yellow-400 text-yellow-900',
  navy:   'bg-indigo-900 text-white',
};

export const Badge = ({ children, color = 'purple', className = '' }) => (
  <span className={`badge ${colorMap[color]} ${className}`}>
    {children}
  </span>
);

export default Badge;
