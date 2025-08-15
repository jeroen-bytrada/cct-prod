import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  score: number;
  feedback: string[];
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  score, 
  feedback, 
  className = "" 
}) => {
  const getStrengthText = (score: number) => {
    if (score === 0) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'hsl(var(--destructive))';
    if (score <= 2) return 'hsl(var(--warning))';
    if (score <= 3) return 'hsl(var(--warning))';
    if (score <= 4) return 'hsl(var(--success))';
    return 'hsl(var(--success))';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password Strength</span>
        <span 
          className="font-medium"
          style={{ color: getStrengthColor(score) }}
        >
          {getStrengthText(score)}
        </span>
      </div>
      
      <Progress 
        value={(score / 5) * 100} 
        className="h-2"
        style={{
          '--progress-color': getStrengthColor(score)
        } as React.CSSProperties}
      />
      
      {feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-current rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;