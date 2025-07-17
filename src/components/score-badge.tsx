import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export default function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const getScoreColor = (value: number) => {
    if (value >= 90) return 'bg-green-500 text-white';
    if (value >= 50) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center w-16 h-16 rounded-full border-4",
        getScoreColor(score).replace('bg-', 'border-'),
        className
      )}
    >
      <span className="text-xl font-bold text-foreground">{score}</span>
    </div>
  );
}
