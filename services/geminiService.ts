
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateQuizFromContent = async (
  apiKey: string,
  files: File[],
  text: string,
  difficulty: string,
  numQuestions: number,
  numAnswers: number
): Promise<Quiz> => {

  if (!apiKey) {
    throw new Error("La chiave API non è stata fornita.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Basandoti sul contenuto fornito (documenti PDF e/o testo), genera un test a scelta multipla.

Il test deve avere le seguenti caratteristiche:
- Livello di difficoltà: ${difficulty}
- Numero di domande: ${numQuestions}
- Numero di risposte per ogni domanda: ${numAnswers}

Per ogni domanda, una sola risposta deve essere corretta, mentre le altre devono essere dei distrattori plausibili ma errati.

Assicurati che il test generato sia diverso ogni volta, anche con lo stesso materiale di partenza. Varia la formulazione delle domande, l'ordine delle domande, le opzioni di risposta e l'ordine delle opzioni di risposta per garantire l'unicità.

Fornisci un titolo appropriato per il test basato sul contenuto.

L'output finale deve essere un oggetto JSON. Non includere alcun testo, commento o marcatura markdown prima o dopo l'oggetto JSON. Il JSON deve seguire questo schema esatto.
  `;

  const contentParts = [];

  for (const file of files) {
    if (file.type !== 'application/pdf') {
        console.warn(`File non supportato saltato: ${file.name}. Attualmente è supportato solo il formato PDF.`);
        continue;
    }
    const base64Data = await fileToBase64(file);
    contentParts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    });
  }

  const combinedText = (text ? `Testo fornito dall'utente:\n${text}\n\n` : '') + prompt;
  contentParts.push({ text: combinedText });

  if (contentParts.length === 1 && !text.trim()) {
      throw new Error("Per favore, fornisci almeno un file PDF o del testo per generare la verifica.");
  }


  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      quizId: { 
        type: Type.STRING,
        description: "Un codice alfanumerico unico per questa verifica." 
      },
      title: { 
        type: Type.STRING,
        description: "Un titolo per la verifica, basato sul contenuto fornito."
      },
      questions: {
        type: Type.ARRAY,
        description: `Un array di ${numQuestions} oggetti domanda.`,
        items: {
          type: Type.OBJECT,
          properties: {
            questionText: { 
              type: Type.STRING,
              description: "Il testo della domanda."
            },
            answers: {
              type: Type.ARRAY,
              description: `Un array di ${numAnswers} oggetti risposta, di cui solo uno corretto.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  answerText: { 
                    type: Type.STRING,
                    description: "Il testo di una possibile risposta."
                  },
                  isCorrect: { 
                    type: Type.BOOLEAN,
                    description: "Indica se questa è la risposta corretta."
                  },
                },
                required: ["answerText", "isCorrect"],
              },
            },
          },
          required: ["questionText", "answers"],
        },
      },
    },
    required: ["quizId", "title", "questions"],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: contentParts }],
    config: {
      temperature: 1,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });
  
  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("La risposta dell'IA non era in un formato JSON valido.");
  }
};
