
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface StatisticChartProps {
  data: { value: number }[];
  color: string;
  className?: string;
  isNegative?: boolean;
}

const StatisticChart: React.FC<StatisticChartProps> = ({ 
  data, 
  color,
  className,
  isNegative = false
}) => {
  return (
    <div className={cn("h-20 w-full mt-2", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id={`gradientBg${isNegative ? 'Negative' : 'Positive'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNegative ? "#FF5252" : "#4CAF50"} stopOpacity={0.2} />
              <stop offset="100%" stopColor={isNegative ? "#FF5252" : "#4CAF50"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isNegative ? "#FF5252" : "#4CAF50"} 
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
            fill={`url(#gradientBg${isNegative ? 'Negative' : 'Positive'})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticChart;
