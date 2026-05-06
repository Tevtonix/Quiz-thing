import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Question } from '../types/Question';

interface LocationState {
  score: number;
  total: number;
  answers: (string | null)[];
  questions: Question[];
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

  const handleResetRecord = () => {
    localStorage.removeItem('quizBestScore');
    setBestScore(0);
  };

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

      {/* Answer review */}
      {questions && questions.length > 0 && (
        <div className="review-list">
          {questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;
            const isSkipped = userAnswer === null;
            return (
              <div
                key={q.id}
                className={`review-item ${isCorrect ? 'review-correct' : isSkipped ? 'review-skipped' : 'review-wrong'}`}
              >
                <p className="review-question">
                  {index + 1}. {q.question}
                </p>
                <p className="review-answer">
                  Ваш ответ: {userAnswer ?? <em>пропущен</em>}
                </p>
                {!isCorrect && (
                  <p className="review-correct-answer">
                    Правильный ответ: {q.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};