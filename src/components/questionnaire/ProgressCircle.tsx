'use client';

interface ProgressCircleProps {
  answered: number;
  total: number;
}

export default function ProgressCircle({ answered, total }: ProgressCircleProps) {
  const percentage = (answered / total) * 100;
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-3 z-50 transition-all hover:scale-105 hover:shadow-xl no-print">
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90" width="60" height="60">
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="5"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="#4a69bd"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute text-lg font-bold text-primary">
          {answered}
        </div>
      </div>
      <div className="text-center text-xs text-gray-600 font-medium mt-1">
        questões
      </div>
    </div>
  );
}
