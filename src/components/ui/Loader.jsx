import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizes[size]}`}></div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" />
  </div>
);

export default Loader;