import React, { useState, useMemo } from 'react';

export interface FormValues {
  files: File[];
  text: string;
  difficulty: string;
  numQuestions: number;
  numAnswers: number;
}

interface InputFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);


export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState('Medio');
  const [numQuestions, setNumQuestions] = useState(10);
  const [numAnswers, setNumAnswers] = useState(4);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ files, text, difficulty, numQuestions, numAnswers });
  };
  
  const fileNames = useMemo(() => files.map(file => file.name).join(', '), [files]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6 no-print">
      <div className="space-y-2">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">1. Carica PDF</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Carica i file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept=".pdf" onChange={handleFileChange} />
              </label>
              <p className="pl-1">o trascinali qui</p>
            </div>
            <p className="text-xs text-gray-500">Solo file PDF</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md flex items-start">
             <FileIcon /> <span>{fileNames}</span>
          </div>
        )}
      </div>

      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-sm font-medium text-gray-700 px-2">Configurazione</legend>
        
        <div className="space-y-2">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">Testo (Opzionale)</label>
          <textarea id="text-input" value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-500" placeholder="Aggiungi qui appunti, riassunti o testo aggiuntivo..."></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficoltà</label>
          <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900">
            <option>Facile</option>
            <option>Medio</option>
            <option>Difficile</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700">Domande</label>
            <input type="number" id="num-questions" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" />
          </div>
          <div className="space-y-2">
            <label htmlFor="num-answers" className="block text-sm font-medium text-gray-700">Risposte</label>
            <input type="number" id="num-answers" value={numAnswers} onChange={(e) => setNumAnswers(Math.max(2, parseInt(e.target.value, 10) || 2))} min="2" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" />
          </div>
        </div>
      </fieldset>

      <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
        {isLoading ? 'Generazione in corso...' : 'Genera Verifica'}
      </button>
    </form>
  );
};
