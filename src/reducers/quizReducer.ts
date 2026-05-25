import type { Question } from '../types/Question';

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (string | null)[];
  questions: Question[];
  score: number | null;
  isFinished: boolean;
}

export type QuizAction =
  | { type: 'SELECT_ANSWER'; payload: { questionIndex: number; answer: string } }
  | { type: 'SKIP_QUESTION' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'FINISH_QUIZ' }
  | { type: 'RESET_QUIZ'; payload: { questions: Question[] } };

export const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SELECT_ANSWER': {
      const newAnswers = [...state.selectedAnswers];
      newAnswers[action.payload.questionIndex] = action.payload.answer;
      return {
        ...state,
        selectedAnswers: newAnswers,
      };
    }

    case 'SKIP_QUESTION': {
      // Пропускаем вопрос - переходим к следующему без ответа
      const isLast = state.currentQuestionIndex === state.questions.length - 1;
      
      if (isLast) {
        // Если это последний вопрос, завершаем викторину
        return {
          ...state,
          isFinished: true,
        };
      }
      
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    }

    case 'NEXT_QUESTION': {
      const isLast = state.currentQuestionIndex === state.questions.length - 1;
      
      if (isLast) {
        return {
          ...state,
          isFinished: true,
        };
      }
      
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    }

    case 'PREVIOUS_QUESTION': {
      if (state.currentQuestionIndex === 0) {
        return state;
      }
      
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex - 1,
      };
    }

    case 'FINISH_QUIZ': {
      // Подсчитываем результат
      let score = 0;
      state.selectedAnswers.forEach((answer, index) => {
        if (answer === state.questions[index].correctAnswer) {
          score++;
        }
      });
      
      return {
        ...state,
        score,
        isFinished: true,
      };
    }

    case 'RESET_QUIZ': {
      return {
        currentQuestionIndex: 0,
        selectedAnswers: Array(action.payload.questions.length).fill(null),
        questions: action.payload.questions,
        score: null,
        isFinished: false,
      };
    }

    default:
      return state;
  }
};

// Вспомогательная функция для создания начального состояния
export const createInitialQuizState = (questions: Question[]): QuizState => ({
  currentQuestionIndex: 0,
  selectedAnswers: Array(questions.length).fill(null),
  questions,
  score: null,
  isFinished: false,
});