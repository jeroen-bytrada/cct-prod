
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
  documentCount: number; // Added new prop for document count
  settings: { 
    target_all: number | null, 
    target_invoice: number | null, 
    target_top: number | null 
  } | null;
  fetchSettings?: () => Promise<void>; // Optional function to refresh settings
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  loading,
  stats,
  statsHistory,
  customerCount,
  documentCount, // Added new prop
  settings,
  fetchSettings
}) => {
  // Calculate percentage changes
  const documentsPercentChange = calculatePercentageChange(statsHistory, 'total');
  const topPercentChange = calculatePercentageChange(statsHistory, 'total_15');
  const facturesPercentChange = calculatePercentageChange(statsHistory, 'total_in_proces');

  // Prepare chart data
  const { documentsChartData, topChartData, facturesChartData } = prepareChartData(statsHistory);

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
    target_invoice: settings?.target_invoice
  });

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Modified to add half-height classes */}
      <div className="flex flex-col gap-6">
        <MetricCard 
          title="Aantal Klanten" 
          value={loading ? "..." : customerCount.toString()}
          hideStats={true}
          showIcon={true}
          iconComponent={<Users size={20} />}
          className="h-[calc(50%-0.75rem)]" // Half height minus half the gap
        >
          <div className="h-[30px]"></div> {/* Reduced empty div height */}
        </MetricCard>
        
        <MetricCard 
          title="Totaal verwerkte documenten" 
          value={loading ? "..." : documentCount.toString()}
          hideStats={true}
          showIcon={true}
          iconComponent={<FileText size={20} />}
          className="h-[calc(50%-0.75rem)]" // Half height minus half the gap
        >
          <div className="h-[30px]"></div> {/* Reduced empty div height */}
        </MetricCard>
      </div>
      
      <MetricCard 
        title="Target Totaal Documenten" 
        value={loading ? "..." : (stats?.total || 0).toString()} 
        change={documentsPercentChange} 
        isNegative={documentsPercentChange < 0}
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={documentsPercentChange < 0}
        target={settings?.target_all || null}
        showTargetBadge={true}
      >
        <StatisticChart 
          data={documentsChartData} 
          color={documentsPercentChange < 0 ? "#4CAF50" : "#FF5252"} 
          isNegative={documentsPercentChange >= 0} 
        />
      </MetricCard>
      
      <MetricCard 
        title="Target Totaal Top 1" 
        value={loading ? "..." : (stats?.total_15 || 0).toString()} 
        change={topPercentChange} 
        isNegative={topPercentChange < 0}
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={topPercentChange < 0}
        target={settings?.target_top || null}
        showTargetBadge={true}
      >
        <StatisticChart 
          data={topChartData} 
          color={topPercentChange < 0 ? "#4CAF50" : "#FF5252"} 
          isNegative={topPercentChange >= 0} 
        />
      </MetricCard>
      
      <MetricCard 
        title="Target Totaal Snelstart Facturen" 
        value={loading ? "..." : (stats?.total_in_proces || 0).toString()} 
        change={facturesPercentChange} 
        isNegative={facturesPercentChange < 0}
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={facturesPercentChange < 0}
        target={settings?.target_invoice || null}
        showTargetBadge={true}
      >
        <StatisticChart 
          data={facturesChartData} 
          color={facturesPercentChange < 0 ? "#4CAF50" : "#FF5252"} 
          isNegative={facturesPercentChange >= 0} 
        />
      </MetricCard>
    </div>
  );
};

export default MetricsSection;
