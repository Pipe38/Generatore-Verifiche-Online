
import React, { useState, useRef, useCallback } from 'react';
import type { Quiz } from '../types.ts';

// Dichiarazione delle librerie globali per TypeScript
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface PrintableContentProps {
    quiz: Quiz;
    withSolutions: boolean;
}

// Componente per renderizzare il contenuto destinato al PDF
const PrintableContent: React.FC<PrintableContentProps> = ({ quiz, withSolutions }) => {
    return (
        <div className="bg-white p-8" style={{ width: '210mm' }}>
            <div className="mb-8 pdf-header">
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Nome: _________________________</span>
                    <span>Data: _________________________</span>
                </div>
                <hr className="my-4" />
            </div>
            <div className="space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-container" style={{ pageBreakInside: 'avoid' }}>
                        <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.questionText}</p>
                        <ul className="space-y-2 pl-4">
                            {q.answers.map((ans, aIndex) => {
                                const isCorrect = ans.isCorrect;
                                const answerLabel = String.fromCharCode(97 + aIndex);
                                
                                let answerClasses = "flex items-start p-3 rounded-lg border ";
                                if (withSolutions && isCorrect) {
                                    answerClasses += "bg-green-100 border-green-300 text-green-800 font-semibold";
                                } else {
                                    answerClasses += "bg-gray-50 border-gray-200 text-gray-700";
                                }

                                return (
                                    <li key={aIndex} className={answerClasses}>
                                        <span className="font-mono mr-3">{answerLabel})</span>
                                        <span>{ans.answerText}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface QuizDisplayProps {
  quiz: Quiz;
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz }) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const quizRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = useCallback(async (withSolutions: boolean) => {
    const targetRef = withSolutions ? solutionsRef : quizRef;
    const filename = withSolutions ? `${quiz.quizId}_soluzioni.pdf` : `${quiz.quizId}_verifica.pdf`;
    
    if (!targetRef.current || !window.jspdf || !window.html2canvas) {
        console.error("Le librerie per la generazione dei PDF non sono state caricate.");
        alert("Errore durante la generazione del PDF. Riprova tra poco.");
        return;
    }

    setIsDownloading(true);

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pdfWidth - (margin * 2);
        let yPos = margin;

        const renderElement = async (element: HTMLElement) => {
            const canvas = await window.html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

            if (yPos + imgHeight > pdfHeight - margin) {
                pdf.addPage();
                yPos = margin;
            }

            pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, imgHeight);
            yPos += imgHeight + 5; // Spazio tra gli elementi
        };

        // Render header
        // FIX: The generic version `querySelector<HTMLElement>` was causing a TypeScript error. Replaced with a type assertion.
        const headerElement = targetRef.current.querySelector('.pdf-header') as HTMLElement | null;
        if (headerElement) {
            await renderElement(headerElement);
        }

        // Render each question
        // FIX: The generic version `querySelectorAll<HTMLElement>` was causing a TypeScript error.
        const questionElements = targetRef.current.querySelectorAll('.question-container');
        // FIX: Cast questionEl from Element to HTMLElement to satisfy the `renderElement` function signature.
        for (const questionEl of Array.from(questionElements)) {
            await renderElement(questionEl as HTMLElement);
        }

        pdf.save(filename);

    } catch (error) {
        console.error("Errore durante la generazione del PDF:", error);
        alert("Si è verificato un errore durante la creazione del PDF.");
    } finally {
        setIsDownloading(false);
    }
  }, [quiz.quizId]);

  return (
    <div className="w-full">
      {/* Contenuto off-screen per la generazione del PDF */}
      <div className="absolute left-[-9999px] top-0">
          <div ref={quizRef}>
              <PrintableContent quiz={quiz} withSolutions={false} />
          </div>
          <div ref={solutionsRef}>
              <PrintableContent quiz={quiz} withSolutions={true} />
          </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
          <p className="text-sm text-gray-500">ID Verifica: {quiz.quizId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setShowSolutions(false)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${!showSolutions ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}
            >
              Verifica
            </button>
            <button
              onClick={() => setShowSolutions(true)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${showSolutions ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}
            >
              Soluzioni
            </button>
          </div>
          <button onClick={() => handleDownloadPdf(false)} disabled={isDownloading} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-wait">
             <DownloadIcon /> {isDownloading ? 'Download...' : 'Verifica'}
          </button>
          <button onClick={() => handleDownloadPdf(true)} disabled={isDownloading} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-wait">
             <DownloadIcon /> {isDownloading ? 'Download...' : 'Soluzioni'}
          </button>
        </div>
      </div>
      
      <div>
        {/* Logica di visualizzazione per l'utente sullo schermo */}
        <div className="space-y-8">
            {quiz.questions.map((q, qIndex) => (
            <div key={qIndex}>
                <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.questionText}</p>
                <ul className="space-y-2 pl-4">
                {q.answers.map((ans, aIndex) => {
                    const isCorrect = ans.isCorrect;
                    const answerLabel = String.fromCharCode(97 + aIndex);
                    
                    let answerClasses = "flex items-start p-3 rounded-lg border ";
                    if (showSolutions && isCorrect) {
                        answerClasses += "bg-green-100 border-green-300 text-green-800 font-semibold";
                    } else {
                        answerClasses += "bg-gray-50 border-gray-200 text-gray-700";
                    }

                    return (
                        <li key={aIndex} className={answerClasses}>
                            <span className="font-mono mr-3">{answerLabel})</span>
                            <span>{ans.answerText}</span>
                        </li>
                    );
                })}
                </ul>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};