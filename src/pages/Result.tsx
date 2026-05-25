import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Question } from '../types/Question';

interface LocationState {
  score: number;
  total: number;
  answers: (string | null)[];
  questions: Question[];
}

interface QuestionReview {
  id: number;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
}

export const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bestScore, setBestScore] = useState<number>(0);
  
  const { score, total, answers, questions } =
    (location.state as LocationState) || { score: 0, total: 0, answers: [], questions: [] };

  useEffect(() => {
    const savedBestScore = localStorage.getItem('quizBestScore');
    const currentBest = savedBestScore ? parseInt(savedBestScore, 10) : 0;
    if (score > currentBest) {
      localStorage.setItem('quizBestScore', score.toString());
      setBestScore(score);
    } else {
      setBestScore(currentBest);
    }
  }, [score]);

  const handleRestart = () => navigate('/');

  // ✅ 1. Обернули handleResetRecord в useCallback с пустым массивом зависимостей
  const handleResetRecord = useCallback(() => {
    localStorage.removeItem('quizBestScore');
    setBestScore(0);
  }, []);

  // ✅ 2. Создали мемоизированный массив вопросов с предвычисленными полями
  const reviewQuestions = useMemo<QuestionReview[]>(() => {
    return questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      const isSkipped = userAnswer === null;
      
      return {
        id: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isSkipped,
      };
    });
  }, [questions, answers]);

  return (
    <div className="result-container">
      <h1 className="result-title">Результат</h1>
      <p className="result-text">Вы ответили правильно на</p>
      <p className="result-score">
        {score} из {total}
      </p>
      <p className="best-score">Лучший результат: {bestScore}</p>

      <div className="result-buttons">
        <button className="restart-button" onClick={handleRestart}>
          Новая викторина
        </button>
        <button className="reset-button" onClick={handleResetRecord}>
          Сбросить рекорд
        </button>
      </div>

      {/* ✅ 3. Используем мемоизированные данные в JSX */}
      {reviewQuestions.length > 0 && (
        <div className="review-list">
          {reviewQuestions.map((review) => (
            <div
              key={review.id}
              className={`review-item ${
                review.isCorrect
                  ? 'review-correct'
                  : review.isSkipped
                  ? 'review-skipped'
                  : 'review-wrong'
              }`}
            >
              <p className="review-question">
                {review.question}
              </p>
              <p className="review-answer">
                Ваш ответ: {review.userAnswer ?? <em>пропущен</em>}
              </p>
              {!review.isCorrect && (
                <p className="review-correct-answer">
                  Правильный ответ: {review.correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};