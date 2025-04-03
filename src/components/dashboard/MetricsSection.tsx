
import React, { useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import { Users, FileText } from 'lucide-react';
import { Stats, StatsHistory } from '@/lib/supabase';
import { calculatePercentageChange, prepareChartData } from '@/utils/chartUtils';
interface MetricsSectionProps {
  loading: boolean;
  stats: Stats | null;
  statsHistory: StatsHistory[];
  customerCount: number;
  documentCount: number;
  settings: {
    target_all: number | null;
    target_invoice: number | null;
    target_top: number | null;
    topx: number | null;
  } | null;
  fetchSettings?: () => Promise<void>;
}
const MetricsSection: React.FC<MetricsSectionProps> = ({
  loading,
  stats,
  statsHistory,
  customerCount,
  documentCount,
  settings,
  fetchSettings
}) => {
  // Calculate percentage changes
  const documentsPercentChange = calculatePercentageChange(statsHistory, 'total');
  const topPercentChange = calculatePercentageChange(statsHistory, 'total_15');
  const facturesPercentChange = calculatePercentageChange(statsHistory, 'total_in_proces');

  // Prepare chart data
  const {
    documentsChartData,
    topChartData,
    facturesChartData
  } = prepareChartData(statsHistory);

  // Fetch settings when stats are updated (ensure we have settings)
  useEffect(() => {
    if (stats && fetchSettings && !settings) {
      console.log("Stats loaded but settings missing - fetching settings");
      fetchSettings();
    }
  }, [stats, fetchSettings, settings]);

  // Log the actual settings values to verify they're being passed correctly
  console.log('Metrics Settings:', {
    target_all: settings?.target_all,
    target_top: settings?.target_top,
    target_invoice: settings?.target_invoice,
    topx: settings?.topx
  });
  return <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Info cards column - more compact design with reduced gap */}
      <div className="flex flex-col gap-1"> {/* Reduced gap from 4 to 2 */}
        <MetricCard title="Aantal Klanten" value={loading ? "..." : customerCount.toString()} hideStats={true} showIcon={true} iconComponent={<Users size={16} />} className="h-[91px]" // Fine-tuned height
      />
        
        <MetricCard title="Totaal verwerkte documenten" value={loading ? "..." : documentCount.toString()} hideStats={true} showIcon={true} iconComponent={<FileText size={16} />} className="h-[91px]" // Fine-tuned height
      />
      </div>
      
      {/* The three metric cards with charts - heights matching the combined two cards */}
      <MetricCard title="Totaal Documenten" value={loading ? "..." : (stats?.total || 0).toString()} change={documentsPercentChange} isNegative={documentsPercentChange < 0} isPositive={documentsPercentChange < 0} target={settings?.target_all || null} showTargetBadge={true} className="h-[188px]" // Kept as is
    >
        <StatisticChart data={documentsChartData} color={documentsPercentChange < 0 ? "#4CAF50" : "#FF5252"} isNegative={documentsPercentChange >= 0} />
      </MetricCard>
      
      <MetricCard title={`Totaal Top ${settings?.topx || 5}`} value={loading ? "..." : (stats?.total_15 || 0).toString()} change={topPercentChange} isNegative={topPercentChange < 0} isPositive={topPercentChange < 0} target={settings?.target_top || null} showTargetBadge={true} className="h-[188px]" // Kept as is
    >
        <StatisticChart data={topChartData} color={topPercentChange < 0 ? "#4CAF50" : "#FF5252"} isNegative={topPercentChange >= 0} />
      </MetricCard>
      
      <MetricCard title="Totaal Snelstart Facturen" value={loading ? "..." : (stats?.total_in_proces || 0).toString()} change={facturesPercentChange} isNegative={facturesPercentChange < 0} isPositive={facturesPercentChange < 0} target={settings?.target_invoice || null} showTargetBadge={true} className="h-[188px]" // Kept as is
    >
        <StatisticChart data={facturesChartData} color={facturesPercentChange < 0 ? "#4CAF50" : "#FF5252"} isNegative={facturesPercentChange >= 0} />
      </MetricCard>
    </div>;
};
export default MetricsSection;
