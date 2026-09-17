import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { StatsResponse } from '@/types';
import { ChartCard, MockBadge } from '@/components/ui';
import { buildCostChartData, computeEstimatedSavings, formatCostUSD } from '@/utils';
import { CHART_DEFAULTS } from '@/constants';
import './CostComparisonChart.css';

interface CostComparisonChartProps {
  stats: StatsResponse | null;
  isLoading: boolean;
}

export default function CostComparisonChart({ stats, isLoading }: CostComparisonChartProps) {
  const data = stats ? buildCostChartData(stats) : [];
  const estimatedSavings = stats ? computeEstimatedSavings(stats.cost_avoided_count) : 0;

  return (
    <ChartCard 
      title="Cost Comparison" 
      subTitle="Without cascade vs. with cascade"
      isLoading={isLoading}
    >
      <div className="cost-chart-container">
        {/* SR Only table */}
        <table className="sr-only">
          <caption>Cost Comparison Data</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Without Cascade</th>
              <th scope="col">With Cascade</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.category}>
                <td>{d.category}</td>
                <td>{formatCostUSD(d.without)}</td>
                <td>{formatCostUSD(d.with)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recharts chart */}
        <div className="cost-chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-bg-subtle)' }}
                contentStyle={{
                  backgroundColor: CHART_DEFAULTS.tooltipBackground,
                  borderColor: CHART_DEFAULTS.tooltipBorder,
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
                formatter={(value: number) => [formatCostUSD(value), 'Estimated Cost']}
              />
              <Bar dataKey="without" name="Without Cascade" fill="var(--chart-tier-3)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="with" name="With Cascade" fill="var(--chart-tier-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Annotation */}
        <div className="cost-chart-annotation">
          <span>Estimated savings: {formatCostUSD(estimatedSavings ?? 0)}</span>
          <div aria-label="Mock data">
            <MockBadge />
            <span className="sr-only">(illustrative amounts)</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
