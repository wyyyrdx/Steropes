import React, { useState } from 'react';
import { useStats } from '@/hooks';
import { mockAdaptiveThreshold } from '@/mocks';
import { SectionHeader, MockBadge, ErrorState } from '@/components/ui';
import AnalyticsDatePicker from '@/features/analytics/AnalyticsDatePicker';
import OverviewCardsRow from '@/features/analytics/OverviewCardsRow';
import TierDonutChart from '@/features/analytics/TierDonutChart';
import CostComparisonChart from '@/features/analytics/CostComparisonChart';
import AdaptiveThresholdCard from '@/features/analytics/AdaptiveThresholdCard';
import ThresholdHistoryChart from '@/features/analytics/ThresholdHistoryChart';
import EscalationPerformanceChart from '@/features/analytics/EscalationPerformanceChart';
import './pages.css';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return {
      from: start.toISOString(),
      to: end.toISOString()
    };
  });

  const { stats, isLoading, error } = useStats(range, { polling: false });

  const renderCharts = () => {
    if (error && !stats) {
      return (
        <div className="analytics-error-state">
          <ErrorState title="Analytics Error" message="Could not load chart data." />
        </div>
      );
    }
    
    return (
      <div className="analytics-charts-grid">
        <div className="analytics-donut-col">
          <TierDonutChart stats={stats} isLoading={isLoading} />
        </div>
        <div className="analytics-bar-col">
          <CostComparisonChart stats={stats} isLoading={isLoading} />
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div>
        <SectionHeader 
          title="Analytics" 
          description="Aggregate metrics and adaptive threshold behavior"
        />
      </div>

      <div className="page-content analytics-content">
        <AnalyticsDatePicker 
          from={range.from} 
          to={range.to} 
          onChange={(from, to) => setRange({ from, to })} 
        />

        <OverviewCardsRow stats={stats} isLoading={isLoading} />

        {renderCharts()}

        <div className="analytics-section-spacing">
          <SectionHeader 
            title="Adaptive Threshold" 
            description="Dynamic threshold adjustments based on real-time performance"
            action={
              <div aria-label="Mock data">
                <MockBadge />
              </div>
            }
          />
        </div>

        <AdaptiveThresholdCard threshold={mockAdaptiveThreshold} />

        <div className="analytics-threshold-charts-grid">
          <ThresholdHistoryChart history={mockAdaptiveThreshold.history} />
          <EscalationPerformanceChart bars={mockAdaptiveThreshold.escalationPerformance} />
        </div>

      </div>
    </div>
  );
}
