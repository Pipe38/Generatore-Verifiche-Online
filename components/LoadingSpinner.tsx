
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
      <h3 className="text-lg font-medium text-gray-700">L'IA sta creando la tua verifica...</h3>
      <p className="text-sm text-gray-500">Questa operazione potrebbe richiedere qualche istante.</p>
    </div>
  );
};
