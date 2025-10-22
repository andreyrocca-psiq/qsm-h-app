'use client';

import { ratingOptions } from '@/lib/questionnaire-data';

interface ScaleQuestionProps {
  id: string;
  questionNumber: number;
  text: string;
  value: number | null;
  onChange: (value: number) => void;
}

export default function ScaleQuestion({
  id,
  questionNumber,
  text,
  value,
  onChange,
}: ScaleQuestionProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 border-b border-gray-200 last:border-b-0 gap-4">
      <div className="flex-1">
        <span className="font-medium text-gray-900">
          {questionNumber}. {text}
        </span>
      </div>

      <div className="flex gap-2 md:gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
        {ratingOptions.map((option) => (
          <label
            key={option.value}
            className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors min-w-[60px]"
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mb-2 cursor-pointer w-5 h-5"
            />
            <span className="text-xs text-gray-600 text-center leading-tight">
              <strong>{option.label}</strong>
              <br />
              {option.sublabel}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
