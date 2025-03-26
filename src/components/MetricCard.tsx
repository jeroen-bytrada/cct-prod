
import React from 'react';
import { User, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

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
  status?: 'on-track' | 'off-track';
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
  status
}) => {
  // Always show the percentage, even if it's 0%
  const changeText = change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : '';
  
  // Apply green color when percentage is exactly 0%, otherwise use the original logic
  const isZeroPercent = change === 0;
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 animate-scale-in", 
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {!hideStats && change !== undefined && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full", 
              isZeroPercent || isPositive ? "bg-green-50 text-buzzaroo-green" : "bg-red-50 text-buzzaroo-red"
            )}>
              {changeText}
            </span>
          )}
          {status && (
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1",
                status === 'on-track' 
                  ? "bg-green-50 text-buzzaroo-green border-green-200" 
                  : "bg-red-50 text-buzzaroo-red border-red-200"
              )}
            >
              {status === 'on-track' ? (
                <>
                  <Check size={12} />
                  <span>On Track</span>
                </>
              ) : (
                <>
                  <X size={12} />
                  <span>Off Track</span>
                </>
              )}
            </Badge>
          )}
          {showIcon && (
            <div className="text-gray-400">
              {iconComponent || <User size={20} />}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      {children}
    </div>
  );
};

export default MetricCard;
