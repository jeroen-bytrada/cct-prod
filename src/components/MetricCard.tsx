
import React from 'react';
import { CheckCircle, XCircle, User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  status?: "on-track" | "off-track";
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
  isPositive = true, 
  isNegative = false,
  status,
  className,
  children,
  showIcon = false,
  hideStats = false,
  iconComponent
}) => {
  // Always show the percentage, even if it's 0%
  const changeText = change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : '';
  
  // Apply green color when percentage is exactly 0%, otherwise use the original logic
  const isZeroPercent = change === 0;
  
  // Color logic based on isPositive prop or zero percent
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
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {!hideStats && status && (
          <div className="flex items-center gap-1 text-sm">
            {status === "on-track" ? (
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
