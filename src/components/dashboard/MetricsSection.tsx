
import React, { useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import { Users } from 'lucide-react';
import { Stats, StatsHistory } from '@/lib/supabase';
import { calculatePercentageChange, prepareChartData } from '@/utils/chartUtils';

interface MetricsSectionProps {
  loading: boolean;
  stats: Stats | null;
  statsHistory: StatsHistory[];
  customerCount: number;
  settings: { target_all: number | null, target_invoice: number | null, target_top: number | null } | null;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  loading,
  stats,
  statsHistory,
  customerCount,
  settings
}) => {
  // Calculate percentage changes
  const documentsPercentChange = calculatePercentageChange(statsHistory, 'total');
  const topPercentChange = calculatePercentageChange(statsHistory, 'total_15');
  const facturesPercentChange = calculatePercentageChange(statsHistory, 'total_in_proces');

  // Prepare chart data
  const { documentsChartData, topChartData, facturesChartData } = prepareChartData(statsHistory);

  // Debugging logs
  useEffect(() => {
    if (stats && settings) {
      console.log('Document stats:', stats.total);
      console.log('Settings target_all:', settings.target_all);
      
      // This is the correct logic - if current value is LESS than target, we're on track
      const isOnTrack = stats.total < (settings.target_all || Infinity);
      console.log('Is on track?', isOnTrack);
      
      // More detailed logging to help troubleshoot
      const target = settings.target_all;
      const current = stats.total;
      if (target !== null && current !== undefined) {
        console.log(`DETAILED STATUS: ${current} < ${target} = ${current < target}`);
        console.log(`Status should be: ${current < target ? "on-track" : "off-track"}`);
      }
    }
  }, [stats, settings]);

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        title="Aantal Klanten" 
        value={loading ? "..." : customerCount.toString()}
        hideStats={true}
        showIcon={true}
        iconComponent={<Users size={20} />}
      >
        <div className="h-[45px]"></div> {/* Empty div to match chart height */}
      </MetricCard>
      
      <MetricCard 
        title="Totaal Documenten" 
        value={loading ? "..." : (stats?.total || 0).toString()} 
        change={documentsPercentChange} 
        isNegative={documentsPercentChange < 0}
        isPositive={documentsPercentChange < 0}
        status={
          settings && settings.target_all !== null && stats?.total !== undefined
            ? (stats.total < settings.target_all) ? "on-track" : "off-track"
            : documentsPercentChange < 0 ? "on-track" : "off-track"
        }
      >
        <StatisticChart 
          data={documentsChartData} 
          color={documentsPercentChange < 0 ? "#4CAF50" : "#FF5252"} 
          isNegative={documentsPercentChange >= 0} 
        />
      </MetricCard>
      
      <MetricCard 
        title="Totaal top 1" 
        value={loading ? "..." : (stats?.total_15 || 0).toString()} 
        change={topPercentChange} 
        isNegative={topPercentChange < 0}
        isPositive={topPercentChange < 0}
        status={
          settings && settings.target_top !== null && stats?.total_15 !== undefined
            ? (stats.total_15 < settings.target_top) ? "on-track" : "off-track"
            : topPercentChange < 0 ? "on-track" : "off-track"
        }
      >
        <StatisticChart 
          data={topChartData} 
          color={topPercentChange < 0 ? "#4CAF50" : "#FF5252"} 
          isNegative={topPercentChange >= 0} 
        />
      </MetricCard>
      
      <MetricCard 
        title="Totaal Snelstart Facturen" 
        value={loading ? "..." : (stats?.total_in_proces || 0).toString()} 
        change={facturesPercentChange} 
        isNegative={facturesPercentChange < 0}
        isPositive={facturesPercentChange < 0}
        status={
          settings && settings.target_invoice !== null && stats?.total_in_proces !== undefined
            ? (stats.total_in_proces < settings.target_invoice) ? "on-track" : "off-track"
            : facturesPercentChange < 0 ? "on-track" : "off-track"
        }
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
