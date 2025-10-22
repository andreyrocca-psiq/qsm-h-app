'use client';

import { Moon, Pill, Activity, Droplet } from 'lucide-react';

interface HabitQuestionProps {
  id: string;
  questionNumber: number;
  text: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  category?: string;
}

const iconMap: Record<string, any> = {
  moon: Moon,
  pill: Pill,
  activity: Activity,
  droplet: Droplet,
};

export default function HabitQuestion({
  id,
  questionNumber,
  text,
  options,
  value,
  onChange,
  category,
}: HabitQuestionProps) {
  return (
    <div className="py-5 border-b border-gray-200 last:border-b-0">
      {category && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
          {iconMap[category] && (
            <span className="text-primary">
              {(() => {
                const Icon = iconMap[category];
                return <Icon className="w-6 h-6" />;
              })()}
            </span>
          )}
          <h4 className="text-lg font-semibold text-primary-dark">{category}</h4>
        </div>
      )}

      <div className="mb-3">
        <span className="font-medium text-gray-900">
          {questionNumber}. {text}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              value === option
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="mr-3 w-5 h-5"
            />
            <span className="flex-1 text-center font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
