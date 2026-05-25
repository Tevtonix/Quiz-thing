import React, { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { questions as allQuestions } from '../data/questions';
import type { Question } from '../types/Question';
import { QuestionCard } from '../components/QuestionCard';

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (string | null)[];
  isFinished: boolean;
}

type QuizAction =
  | { type: 'SELECT_ANSWER'; payload: string }
  | { type: 'SKIP_QUESTION' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'FINISH_QUIZ' };

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SELECT_ANSWER': {
      const newAnswers = [...state.selectedAnswers];
      newAnswers[state.currentQuestionIndex] = action.payload;
      return { ...state, selectedAnswers: newAnswers };
    }

    case 'SKIP_QUESTION': {
      const isLast = state.currentQuestionIndex === state.selectedAnswers.length - 1;
      return isLast
        ? { ...state, isFinished: true }
        : { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    }

    case 'NEXT_QUESTION': {
      const isLast = state.currentQuestionIndex === state.selectedAnswers.length - 1;
      return isLast
        ? { ...state, isFinished: true }
        : { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    }

    case 'PREVIOUS_QUESTION': {
      if (state.currentQuestionIndex === 0) return state;
      return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
    }

    case 'FINISH_QUIZ': {
      return { ...state, isFinished: true };
    }

    default:
      return state;
  }
};

const STORAGE_KEY = 'quiz_progress';

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionCount: initialCount } = (location.state as { questionCount?: number }) || {};

  const [questionCount] = useState(initialCount || allQuestions.length);

  const questions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, questionCount);
  }, [questionCount]);

  const initQuiz = (): QuizState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.questionCount === questionCount &&
          Array.isArray(parsed.selectedAnswers) &&
          parsed.selectedAnswers.length === questionCount &&
          typeof parsed.currentQuestionIndex === 'number'
        ) {
          return {
            currentQuestionIndex: parsed.currentQuestionIndex,
            selectedAnswers: parsed.selectedAnswers,
            isFinished: false,
          };
        }
      }
    } catch (e) {
      console.warn('Ошибка загрузки прогресса');
    }
    return {
      currentQuestionIndex: 0,
      selectedAnswers: Array(questionCount).fill(null),
      isFinished: false,
    };
  };

  const [state, dispatch] = useReducer(quizReducer, null, initQuiz);

  const currentQuestion = questions[state.currentQuestionIndex];
  const isLast = state.currentQuestionIndex === questions.length - 1;
  const progress = ((state.currentQuestionIndex) / questions.length) * 100;

  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    setTimeLeft(30);
  }, [state.currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      dispatch({ type: 'SKIP_QUESTION' });
    }
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      questionCount,
      currentQuestionIndex: state.currentQuestionIndex,
      selectedAnswers: state.selectedAnswers,
    }));
  }, [state.currentQuestionIndex, state.selectedAnswers, questionCount]);

  const finishQuiz = useCallback((answers: (string | null)[]) => {
    localStorage.removeItem(STORAGE_KEY);
    
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) score++;
    });

    navigate('/result', {
      state: {
        score,
        total: questions.length,
        answers,
        questions,
      },
    });
  }, [navigate, questions]);

  useEffect(() => {
    if (state.isFinished) {
      finishQuiz(state.selectedAnswers);
    }
  }, [state.isFinished, state.selectedAnswers, finishQuiz]);

  const handleSelectAnswer = (answer: string) => {
    dispatch({ type: 'SELECT_ANSWER', payload: answer });
  };

  // ✅ Обернули handleBack в useCallback
  const handleBack = useCallback(() => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  }, []);

  // ✅ Обернули handleSkip в useCallback
  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_QUESTION' });
  }, []);

  // ✅ Обернули handleNext в useCallback
  const handleNext = useCallback(() => {
    if (isLast) {
      if (window.confirm('Завершить викторину и увидеть результат?')) {
        dispatch({ type: 'FINISH_QUIZ' });
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLast]);

  return (
    <div className="quiz-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <p className="question-counter">
        Вопрос {state.currentQuestionIndex + 1} / {questions.length}
      </p>

      <div style={{ 
        textAlign: 'center', 
        fontSize: '1.2em', 
        fontWeight: 'bold', 
        color: timeLeft <= 5 ? '#ef4444' : '#11998e',
        marginBottom: '15px'
      }}>
        ⏱ Осталось: {timeLeft} сек
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={state.selectedAnswers[state.currentQuestionIndex]}
        onSelectAnswer={handleSelectAnswer}
      />

      <div className="navigation-buttons">
        <button
          className="nav-button back-button"
          onClick={handleBack}
          disabled={state.currentQuestionIndex === 0 || state.selectedAnswers[state.currentQuestionIndex - 1] !== null}
        >
          Назад
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-button skip-button" onClick={handleSkip}>
            Пропустить
          </button>
          <button
            className="nav-button next-button"
            onClick={handleNext}
            disabled={!state.selectedAnswers[state.currentQuestionIndex]}
          >
            {isLast ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
};