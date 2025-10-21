import React from 'react';

const LoadingSpinner = ({
  size = 'medium',
  color = 'blue',
  message = 'Cargando...'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-2 ${colorClasses[color]} ${sizeClasses[size]}`}
        role="status"
        aria-label="Cargando"
      >
        <span className="sr-only">Cargando...</span>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${colorClasses[color]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
