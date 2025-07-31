import React from 'react';
import { FaCrown } from 'react-icons/fa';

const CarthageEagle = ({ size = 'medium', animated = false }) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`inline-flex items-center justify-center ${animated ? 'animate-pulse' : ''}`}>
      <div className={`${sizeClasses[size]} text-yellow-600 relative`}>
        {/* نسر قرطاج */}
        <div className="relative">
          <span className="text-yellow-600">🦅</span>
          {/* التاج */}
          <FaCrown className="absolute -top-2 -right-1 text-yellow-500 text-xs" />
        </div>
        {/* تأثير التوهج */}
        <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-20 blur-sm"></div>
      </div>
    </div>
  );
};

export default CarthageEagle;