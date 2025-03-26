
import { StatsHistory } from '@/lib/supabase';
import { MAX_HISTORY_RECORDS } from '@/lib/supabase/client';

// Generate random data for chart visualizations when real data is not available
export const generateChartData = (length: number, isNegative = false) => {
  const startValue = isNegative ? 80 : 20;
  const endValue = isNegative ? 20 : 80;
  
  return Array.from({ length }, (_, i) => {
    const progress = i / (length - 1);
    const randomFactor = Math.random() * 15 - 7.5;
    const value = startValue + (endValue - startValue) * progress + randomFactor;
    return { value: Math.max(0, value) };
  });
};

// Format history data for chart display
export const formatHistoryData = (data: StatsHistory[], key: keyof Pick<StatsHistory, 'total' | 'total_15' | 'total_in_proces'>) => {
  return data.map(item => ({ value: Number(item[key]) || 0 }));
};

// Calculate percentage change between the last two values
export const calculatePercentageChange = (data: StatsHistory[], key: keyof Pick<StatsHistory, 'total' | 'total_15' | 'total_in_proces'>) => {
  if (data.length < 2) return 0;
  
  const current = Number(data[data.length - 1][key]) || 0;
  const previous = Number(data[data.length - 2][key]) || 0;
  
  // Avoid division by zero
  if (previous === 0) return current > 0 ? 100 : 0;
  
  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(2)); // Round to 2 decimal places
};

// Prepare chart data based on stats history or use default data if not available
export const prepareChartData = (statsHistory: StatsHistory[]) => {
  const defaultDocumentsChartData = generateChartData(MAX_HISTORY_RECORDS, true);
  const defaultTopChartData = generateChartData(MAX_HISTORY_RECORDS);
  const defaultFacturesChartData = generateChartData(MAX_HISTORY_RECORDS);

  const documentsChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total')
    : defaultDocumentsChartData;
  
  const topChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total_15')
    : defaultTopChartData;
  
  const facturesChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total_in_proces')
    : defaultFacturesChartData;

  return {
    documentsChartData,
    topChartData,
    facturesChartData
  };
};
