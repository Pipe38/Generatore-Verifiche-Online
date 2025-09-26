
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm, FormValues } from './components/InputForm';
import { QuizDisplay } from './components/QuizDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { Welcome } from './components/Welcome';
import { ApiKeyModal } from './components/ApiKeyModal';
import type { Quiz } from './types';
import { generateQuizFromContent } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsKeyModalOpen(true);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    if (key) {
      localStorage.setItem('gemini-api-key', key);
      setApiKey(key);
      setIsKeyModalOpen(false);
    }
  };
  
  const handleChangeApiKey = () => {
      localStorage.removeItem('gemini-api-key');
      setApiKey(null);
      setQuiz(null);
      setError(null);
      setIsKeyModalOpen(true);
  }

  const handleGenerateQuiz = useCallback(async (values: FormValues) => {
    if (!apiKey) {
      setError("La chiave API di Gemini non è impostata. Per favore, impostala per continuare.");
      setIsKeyModalOpen(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const generatedQuiz = await generateQuizFromContent(
        apiKey,
        values.files,
        values.text,
        values.difficulty,
        values.numQuestions,
        values.numAnswers
      );
      setQuiz(generatedQuiz);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto durante la generazione della verifica.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  if (isKeyModalOpen) {
      return <ApiKeyModal onSave={handleApiKeySave} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header onChangeApiKey={handleChangeApiKey} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <InputForm onSubmit={handleGenerateQuiz} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[400px] flex flex-col justify-center">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorAlert message={error} />}
              {!isLoading && !error && !quiz && <Welcome />}
              {!isLoading && !error && quiz && <QuizDisplay quiz={quiz} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
