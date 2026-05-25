import React from 'react';
import type { Question } from '../types/Question';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer,
}) => {
  return (
    <div className="question-card">
      <h2 className="question-text">{question.question}</h2>

      <div className="options-container">
        {question.options.map((option, index) => (
          <label key={index} className="option-label">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onSelectAnswer(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};