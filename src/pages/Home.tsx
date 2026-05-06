import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { ThemeToggle } from '../components/ThemeToogle';
export const Home: React.FC = () => {
  const navigate = useNavigate();
  const total = questions.length;
  const countOptions = [total, 5, 3].filter(n => n <= total);
  const uniqueOptions = [...new Set(countOptions)];
  const [selectedCount, setSelectedCount] = useState<number>(total);

  const handleStart = () => {
    navigate('/quiz', { state: { questionCount: selectedCount } });
  };

  return (
    <div className="home-container">
      {/* 2. Добавляем переключатель темы в начало */}
      <ThemeToggle />
      
      <h1 className="home-title">Добро пожаловать в Викторину!</h1>
      <p className="home-subtitle">Проверьте свои знания, ответив на несколько вопросов.</p>

      <div className="count-options">
        {uniqueOptions.map(count => (
          <label key={count} className="count-option-label">
            <input
              type="radio"
              name="questionCount"
              value={count}
              checked={selectedCount === count}
              onChange={() => setSelectedCount(count)}
            />
            {count === total ? `Все (${total})` : `${count} вопроса`}
          </label>
        ))}
      </div>

      <button className="start-button" onClick={handleStart}>
        Начать
      </button>
    </div>
  );
};