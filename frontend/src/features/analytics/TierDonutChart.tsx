import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { StatsResponse } from '@/types';
import { ChartCard } from '@/components/ui';
import { buildTierChartData, computeLocalResolutionRate, formatPercentage } from '@/utils';
import { CHART_DEFAULTS } from '@/constants';
import './TierDonutChart.css';

interface TierDonutChartProps {
  stats: StatsResponse | null;
  isLoading: boolean;
}

export default function TierDonutChart({ stats, isLoading }: TierDonutChartProps) {
  const data = stats ? buildTierChartData(stats.tier_breakdown) : [];
  const localResolution = stats ? computeLocalResolutionRate(stats.tier_breakdown) : 0;

  return (
    <ChartCard 
      title="Usage per Tier" 
      subTitle="Distribution across cascade tiers"
      isLoading={isLoading}
    >
      <div className="tier-donut-container">
        {/* SR Only table */}
        <table className="sr-only">
          <caption>Usage per Tier Data</caption>
          <thead>
            <tr>
              <th scope="col">Tier</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Center overlay */}
        <div className="tier-donut-overlay">
          <span className="tier-donut-overlay-value">{formatPercentage(localResolution)}</span>
          <span className="tier-donut-overlay-label">Local Resolution</span>
        </div>

        {/* Recharts chart */}
        <div className="tier-donut-chart">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart accessibilityLayer>
              <Pie
                data={data}
                dataKey="value"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: CHART_DEFAULTS.tooltipBackground,
                  borderColor: CHART_DEFAULTS.tooltipBorder,
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
                formatter={(value: number) => [value, 'Events']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="tier-donut-legend">
          {data.map(d => (
            <div key={d.name} className="tier-donut-legend-item">
              <span className="tier-donut-legend-dot" style={{ backgroundColor: d.color }}></span>
              <span>{d.name}: {d.value} ({d.percent.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
