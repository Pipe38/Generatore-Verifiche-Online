
import React from 'react';

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    onChangeApiKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChangeApiKey }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md no-print">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <BookIcon />
            <div>
                <h1 className="text-2xl font-bold text-white">Generatore di Verifiche AI</h1>
                <p className="text-sm text-indigo-200">Crea test personalizzati in pochi secondi</p>
            </div>
        </div>
        <button 
            onClick={onChangeApiKey}
            className="flex items-center px-3 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-md transition-colors"
            aria-label="Cambia chiave API"
        >
            <KeyIcon />
            Cambia Chiave
        </button>
      </div>
    </header>
  );
};
