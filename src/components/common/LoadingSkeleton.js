// src/components/common/LoadingSkeleton.js
import React from 'react';

/**
 * Componente de skeleton loading responsive
 */
const LoadingSkeleton = ({
  className = '',
  variant = 'card',
  count = 1,
  animate = true
}) => {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 rounded ${animate ? 'animate-pulse' : ''}`;

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`p-4 border border-gray-200 dark:border-gray-600 rounded-lg ${baseClasses}`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex space-x-4 p-3">
                <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className={`aspect-square ${baseClasses} rounded-lg`}></div>
            ))}
          </div>
        );

      default:
        return <div className={`h-4 ${baseClasses} w-full`}></div>;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default LoadingSkeleton;
