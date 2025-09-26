
export interface Answer {
  answerText: string;
  isCorrect: boolean;
}

export interface Question {
  questionText: string;
  answers: Answer[];
}

export interface Quiz {
  quizId: string;
  title: string;
  questions: Question[];
}
