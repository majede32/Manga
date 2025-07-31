import React from 'react';

const TunisianFlag = ({ size = 'medium', animated = false }) => {
  const sizeClasses = {
    small: 'w-8 h-5',
    medium: 'w-12 h-8',
    large: 'w-16 h-10',
    xl: 'w-20 h-12'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${animated ? 'flag-wave' : ''}`}>
      {/* العلم التونسي */}
      <div className="w-full h-full bg-red-600 rounded-md relative overflow-hidden shadow-lg">
        {/* الدائرة البيضاء */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-white rounded-full"></div>
        {/* الهلال والنجمة */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-xs font-bold">
          ☪
        </div>
      </div>
    </div>
  );
};

export default TunisianFlag;