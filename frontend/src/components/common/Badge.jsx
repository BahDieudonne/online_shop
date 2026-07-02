const colorMap = {
  // Direct color names
  purple:    'bg-purple-100 text-purple-700',
  green:     'bg-green-100 text-green-700',
  red:       'bg-red-100 text-red-700',
  yellow:    'bg-yellow-100 text-yellow-700',
  blue:      'bg-blue-100 text-blue-700',
  gray:      'bg-gray-100 text-gray-600',
  gold:      'bg-yellow-400 text-yellow-900',
  navy:      'bg-indigo-900 text-white',
  // Semantic variant aliases
  success:   'bg-green-100 text-green-700',
  danger:    'bg-red-100 text-red-700',
  warning:   'bg-yellow-100 text-yellow-800',
  info:      'bg-blue-100 text-blue-700',
  secondary: 'bg-gray-100 text-gray-600',
  dark:      'bg-gray-800 text-white',
};

const sizeMap = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1 font-semibold',
};

export const Badge = ({ children, color, variant, size = 'sm', className = '' }) => {
  const key = color || variant || 'purple';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorMap[key] || colorMap.gray} ${sizeMap[size] || sizeMap.sm} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
