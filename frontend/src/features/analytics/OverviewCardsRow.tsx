import React from 'react';
import { Activity, CircleCheck, RefreshCcw, CloudUpload, CloudOff } from 'lucide-react';
import type { StatsResponse } from '@/types';
import { MetricCard, ErrorState } from '@/components/ui';
import { parseTierBreakdown, computeTierPercentages } from '@/utils';
import './OverviewCardsRow.css';

interface OverviewCardsRowProps {
  stats: StatsResponse | null;
  isLoading: boolean;
}

export default function OverviewCardsRow({ stats, isLoading }: OverviewCardsRowProps) {
  if (!isLoading && !stats) {
    return (
      <div className="overview-cards-error">
        <ErrorState title="Failed to load analytics overview" message="Could not fetch data for this period." />
      </div>
    );
  }

  const breakdown = parseTierBreakdown(stats?.tier_breakdown);
  const percentages = computeTierPercentages(stats?.tier_breakdown || {});

  return (
    <div className="overview-cards-row">
      <MetricCard 
        title="Total Events"
        value={stats ? stats.total_events : 0}
        icon={Activity}
        isLoading={isLoading}
      />
      <MetricCard 
        title="Tier 1"
        value={breakdown.tier1}
        subLabel={`${percentages.tier1.toFixed(1)}% of total`}
        icon={CircleCheck}
        accent="green"
        isLoading={isLoading}
      />
      <MetricCard 
        title="Tier 2"
        value={breakdown.tier2}
        subLabel={`${percentages.tier2.toFixed(1)}% of total`}
        icon={RefreshCcw}
        accent="amber"
        isLoading={isLoading}
      />
      <MetricCard 
        title="Tier 3"
        value={breakdown.tier3}
        subLabel={`${percentages.tier3.toFixed(1)}% of total`}
        icon={CloudUpload}
        accent="red"
        isLoading={isLoading}
      />
      <MetricCard 
        title="Cloud Calls Avoided"
        value={stats ? stats.cost_avoided_count : 0}
        icon={CloudOff}
        accent="indigo"
        isLoading={isLoading}
      />
    </div>
  );
}
