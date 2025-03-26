
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

  // Debug logs to check values
  useEffect(() => {
    console.log('MetricsSection loaded with settings:', settings);
    console.log('Stats available:', stats);
    
    // Determine status for documents
    const documentsStatus = stats?.total !== undefined && settings?.target_all !== null 
      ? stats.total < settings.target_all ? "on-track" : "off-track"
      : undefined;
      
    console.log('Documents status calculation:', {
      statsTotal: stats?.total,
      targetAll: settings?.target_all,
      result: documentsStatus
    });
    
    // Determine status for top documents
    const topStatus = stats?.total_15 !== undefined && settings?.target_top !== null 
      ? stats.total_15 < settings.target_top ? "on-track" : "off-track"
      : undefined;
      
    console.log('Top status calculation:', {
      statsTotal15: stats?.total_15,
      targetTop: settings?.target_top,
      result: topStatus
    });
    
    // Determine status for facturen
    const facturesStatus = stats?.total_in_proces !== undefined && settings?.target_invoice !== null
      ? stats.total_in_proces < settings.target_invoice ? "on-track" : "off-track"
      : undefined;
      
    console.log('Facturen status calculation:', {
      statsTotalInProces: stats?.total_in_proces,
      targetInvoice: settings?.target_invoice,
      result: facturesStatus
    });
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
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={documentsPercentChange < 0}
        status={!loading && stats && settings && settings.target_all !== null 
          ? stats.total < settings.target_all ? "on-track" : "off-track"
          : undefined}
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
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={topPercentChange < 0}
        status={!loading && stats && settings && settings.target_top !== null 
          ? stats.total_15 < settings.target_top ? "on-track" : "off-track"
          : undefined}
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
        // Here we reverse the logic - negative is good, positive is bad
        isPositive={facturesPercentChange < 0}
        status={!loading && stats && settings && settings.target_invoice !== null
          ? stats.total_in_proces < settings.target_invoice ? "on-track" : "off-track"
          : undefined}
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
