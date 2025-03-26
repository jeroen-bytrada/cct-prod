
import React from 'react';
import { User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  absoluteChange?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  hideStats?: boolean;
  iconComponent?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  absoluteChange,
  isPositive = true, 
  isNegative = false,
  className,
  children,
  showIcon = false,
  hideStats = false,
  iconComponent
}) => {
  // Always show the percentage, even if it's 0%
  const changeText = change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : '';
  
  // Format absolute change if provided
  const absoluteChangeText = absoluteChange !== undefined ? `${absoluteChange > 0 ? '+' : ''}${absoluteChange}` : '';
  
  // Apply green color when percentage is exactly 0%, otherwise use the original logic
  const isZeroPercent = change === 0;
  
  // We're reversing the logic here - negative changes use green color, positive use red
  // But when change is exactly 0%, we always use green
  const changeClass = isZeroPercent || isPositive 
    ? "text-buzzaroo-green" 
    : "text-buzzaroo-red";

  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 animate-scale-in", 
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        {!hideStats && (
          <div className="flex flex-col items-end gap-1">
            {change !== undefined && (
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full", 
                isZeroPercent || isPositive ? "bg-green-50 text-buzzaroo-green" : "bg-red-50 text-buzzaroo-red"
              )}>
                {changeText}
              </span>
            )}
            {absoluteChange !== undefined && (
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full", 
                isZeroPercent || isPositive ? "bg-green-50 text-buzzaroo-green" : "bg-red-50 text-buzzaroo-red"
              )}>
                {absoluteChangeText}
              </span>
            )}
          </div>
        )}
        {showIcon && (
          <div className="text-gray-400">
            {iconComponent || <User size={20} />}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      {children}
    </div>
  );
};

export default MetricCard;
