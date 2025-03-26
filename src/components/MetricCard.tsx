
import React from 'react';
import { CheckCircle, XCircle, User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  targetValue?: number | null; // Added target value
  showStatus?: boolean; // Control whether to show status
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  hideStats?: boolean;
  iconComponent?: React.ReactNode;
  absoluteChange?: number; // Added absolute change
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive = true, 
  isNegative = false,
  targetValue,
  showStatus = false,
  className,
  children,
  showIcon = false,
  hideStats = false,
  iconComponent,
  absoluteChange
}) => {
  // Always show the percentage, even if it's 0%
  const changeText = change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : '';
  // Show absolute change
  const absoluteChangeText = absoluteChange !== undefined ? `${absoluteChange > 0 ? '+' : ''}${absoluteChange}` : '';
  
  // Apply green color when percentage is exactly 0%, otherwise use the original logic
  const isZeroPercent = change === 0;
  
  // We're reversing the logic here - negative changes use green color, positive use red
  // But when change is exactly 0%, we always use green
  const changeClass = isZeroPercent || isPositive 
    ? "text-buzzaroo-green" 
    : "text-buzzaroo-red";

  // Determine on-track status based on comparing the current value to target value
  const isOnTrack = targetValue !== undefined && targetValue !== null 
    ? Number(value) < targetValue
    : undefined;

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
        {!hideStats && showStatus && isOnTrack !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {isOnTrack ? (
              <>
                <CheckCircle size={16} className="text-buzzaroo-green" />
                <span className="text-buzzaroo-green font-medium">On track</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-buzzaroo-red" />
                <span className="text-buzzaroo-red font-medium">Off track</span>
              </>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default MetricCard;
