import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-primary-200 border-t-primary-600 mb-4`}></div>
      <p className="text-medical-600 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;