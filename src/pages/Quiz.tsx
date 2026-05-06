import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { questions as allQuestions } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';

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

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.questionCount === questionCount &&
          Array.isArray(parsed.answers) &&
          parsed.answers.length === questionCount &&
          typeof parsed.currentIndex === 'number' &&
          parsed.currentIndex >= 0 &&
          parsed.currentIndex < questionCount
        ) {
          return { index: parsed.currentIndex, answers: parsed.answers };
        }
      }
    } catch (e) {
      console.warn('Не удалось загрузить прогресс викторины');
    }
    return { index: 0, answers: Array(questionCount).fill(null) };
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => loadProgress().index);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(() => loadProgress().answers);

  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = questions[currentQuestionIndex];
  const isLast = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  useEffect(() => {
    const progressData = {
      questionCount,
      currentIndex: currentQuestionIndex,
      answers: selectedAnswers,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  }, [currentQuestionIndex, selectedAnswers, questionCount]);

  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
  if (timeLeft === 0) {
    if (isLast) {
      finishQuiz(selectedAnswers);
    } else {
      setCurrentQuestionIndex((prev: number) => prev + 1);
    }
  }
}, [timeLeft, isLast]);

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const finishQuiz = (answers: (string | null)[]) => {
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
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const confirmed = window.confirm('Завершить викторину и увидеть результат?');
      if (confirmed) finishQuiz(selectedAnswers);
    }
  };

  const handleSkip = () => {
    if (!isLast) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const confirmed = window.confirm('Завершить викторину и увидеть результат?');
      if (confirmed) finishQuiz(selectedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="quiz-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <p className="question-counter">
        Вопрос {currentQuestionIndex + 1} / {questions.length}
      </p>

      <div style={{
        textAlign: 'center',
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: timeLeft <= 5 ? '#ef4444' : '#11998e',
        marginBottom: '15px'
      }}>
         Осталось: {timeLeft} сек
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswers[currentQuestionIndex]}
        onSelectAnswer={handleSelectAnswer}
      />

      <div className="navigation-buttons">
        <button
          className="nav-button back-button"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0 || selectedAnswers[currentQuestionIndex - 1] !== null}
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
            disabled={!selectedAnswers[currentQuestionIndex]}
          >
            {isLast ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
};