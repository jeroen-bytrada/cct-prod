
import React, { useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import { Users } from 'lucide-react';
import { Stats, StatsHistory, getSettings } from '@/lib/supabase';
import { calculatePercentageChange, prepareChartData } from '@/utils/chartUtils';

interface MetricsSectionProps {
  loading: boolean;
  stats: Stats | null;
  statsHistory: StatsHistory[];
  customerCount: number;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  loading,
  stats,
  statsHistory,
  customerCount
}) => {
  const [targets, setTargets] = useState<{
    target_all: number | null;
    target_invoice: number | null;
    target_top: number | null;
  }>({ target_all: null, target_invoice: null, target_top: null });

  // Calculate percentage changes
  const documentsPercentChange = calculatePercentageChange(statsHistory, 'total');
  const topPercentChange = calculatePercentageChange(statsHistory, 'total_15');
  const facturesPercentChange = calculatePercentageChange(statsHistory, 'total_in_proces');

  // Prepare chart data
  const { documentsChartData, topChartData, facturesChartData } = prepareChartData(statsHistory);

  // Fetch target values from settings
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const settingsData = await getSettings();
        if (settingsData) {
          setTargets(settingsData);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
      }
    };

    fetchTargets();
  }, []);

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
        target={targets.target_all}
        showTarget={!loading && stats?.total !== undefined}
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
        target={targets.target_top}
        showTarget={!loading && stats?.total_15 !== undefined}
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
        target={targets.target_invoice}
        showTarget={!loading && stats?.total_in_proces !== undefined}
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
