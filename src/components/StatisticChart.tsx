
import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Area } from 'recharts';
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
  // Determine if the trend is increasing by comparing the last two values
  const isIncreasing = useMemo(() => {
    if (data.length < 2) return false;
    const lastValue = data[data.length - 1].value;
    const previousValue = data[data.length - 2].value;
    return lastValue > previousValue;
  }, [data]);

  // Set color based on the trend (now reversed - red for increasing, green for decreasing)
  const lineColor = isIncreasing ? "#FF5252" : "#4CAF50";
  const fillColor = isIncreasing ? "rgba(255, 82, 82, 0.1)" : "rgba(76, 175, 80, 0.1)";
  const gradientId = isIncreasing ? "gradientBgNegative" : "gradientBgPositive";

  return (
    <div className={cn("h-20 w-full mt-2", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            strokeWidth={0}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor} 
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticChart;
