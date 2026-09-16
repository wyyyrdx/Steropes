import React from 'react';
import { Activity, CloudOff, Percent, DollarSign } from 'lucide-react';
import { useStats } from '@/hooks';
import { MetricCard, ErrorState } from '@/components/ui';
import { formatPercentage, formatCostUSD, computeEstimatedSavings } from '@/utils';
import './CostSavingsGrid.css';

export default function CostSavingsGrid() {
  const { stats, isLoading, error, refetch } = useStats();

  if (error && !stats) {
    return (
      <div className="cost-savings-error">
        <ErrorState title="Failed to load stats" message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="cost-savings-grid">
      <MetricCard
        label="Total Decisions Today"
        value={stats?.total_events ?? 0}
        icon={Activity}
        subLabel="Since midnight UTC"
        isLoading={isLoading && !stats}
      />
      <MetricCard
        label="Bedrock Calls Avoided"
        value={stats?.cost_avoided_count ?? 0}
        icon={CloudOff}
        accent="green"
        tooltip="Events resolved at Tier 1 or Tier 2 without cloud VLM"
        isLoading={isLoading && !stats}
      />
      <div className="metric-prominent-wrapper">
        <MetricCard
          label="Local Resolution Rate"
          value={stats ? formatPercentage(stats.cost_avoided_percentage) : '0%'}
          icon={Percent}
          accent="indigo"
          isLoading={isLoading && !stats}
        />
      </div>
      <MetricCard
        label="Estimated Savings"
        value={stats ? formatCostUSD(computeEstimatedSavings(stats.cost_avoided_count)) : '$0.00'}
        icon={DollarSign}
        subLabel="Estimate only — illustrative Bedrock pricing"
        isMock
        isLoading={isLoading && !stats}
      />
    </div>
  );
}
