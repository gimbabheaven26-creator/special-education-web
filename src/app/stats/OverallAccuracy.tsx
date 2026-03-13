'use client';

interface OverallAccuracyProps {
  readonly rate: number;
  readonly total: number;
  readonly correct: number;
}

function getColor(rate: number): string {
  if (rate >= 70) return 'stroke-emerald-500';
  if (rate >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

export default function OverallAccuracy({ rate, total, correct }: OverallAccuracyProps) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;
  const color = getColor(rate);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="mx-auto">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="fill-current text-3xl font-bold"
        >
          {rate}%
        </text>
      </svg>
      <p className="text-sm text-muted-foreground">
        전체 정답률 ({correct}/{total})
      </p>
    </div>
  );
}
