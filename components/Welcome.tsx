
import React from 'react';

export const Welcome: React.FC = () => {
  return (
    <div className="text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      <h3 className="mt-4 text-xl font-semibold text-gray-700">Benvenuto nel Generatore di Verifiche AI</h3>
      <p className="mt-2 max-w-md mx-auto">
        Compila il modulo a sinistra per iniziare. Carica i tuoi materiali didattici, imposta i parametri e lascia che l'IA crei una verifica su misura per te.
      </p>
    </div>
  );
};
