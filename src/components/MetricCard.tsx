
import React from 'react';
import { User, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  hideStats?: boolean;
  iconComponent?: React.ReactNode;
  target?: number | null;
  showTargetBadge?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive = true, 
  isNegative = false,
  className,
  children,
  showIcon = false,
  hideStats = false,
  iconComponent,
  target = null,
  showTargetBadge = false
}) => {
  // Always show the percentage, even if it's 0%
  const changeText = change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : '';
  
  // Apply green color when percentage is exactly 0%, otherwise use the original logic
  const isZeroPercent = change === 0;
  
  // For target badge
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  // For these metrics, we want ON TRACK when the value is LESS than the target
  // When target is null, always show as on target (green)
  // Otherwise, compare the value to the target
  const isOnTarget = target === null ? true : !isNaN(numericValue) && numericValue <= target;
  
  console.log(`MetricCard ${title}: value=${value}, target=${target}, showTargetBadge=${showTargetBadge}, isOnTarget=${isOnTarget}`);
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 animate-scale-in", 
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        {!hideStats && change !== undefined && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full", 
            isZeroPercent || isPositive ? "bg-green-50 text-buzzaroo-green" : "bg-red-50 text-buzzaroo-red"
          )}>
            {changeText}
          </span>
        )}
        {showIcon && (
          <div className="text-gray-400">
            {iconComponent || <User size={20} />}
          </div>
        )}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-3xl font-bold text-gray-900 mb-2">{value}</span>
        {showTargetBadge && (
          <Badge 
            variant={isOnTarget ? "default" : "destructive"}
            className={cn(
              "flex items-center gap-1",
              isOnTarget ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-red-100 hover:bg-red-200 text-red-800"
            )}
          >
            {isOnTarget ? (
              <><Check size={12} /> On Track</>
            ) : (
              <><X size={12} /> Off Track</>
            )}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
};

export default MetricCard;
