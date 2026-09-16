import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ThresholdPoint } from '@/types';
import { ChartCard, MockBadge } from '@/components/ui';
import { buildThresholdSeries } from '@/utils';
import { CHART_DEFAULTS } from '@/constants';
import './ThresholdHistoryChart.css';

interface ThresholdHistoryChartProps {
  history: ThresholdPoint[];
  isLoading?: boolean;
}

export default function ThresholdHistoryChart({ history, isLoading }: ThresholdHistoryChartProps) {
  const data = buildThresholdSeries(history);

  return (
    <ChartCard 
      title="Threshold History" 
      subTitle="Adaptive threshold over time"
      isLoading={isLoading}
      action={<MockBadge />}
    >
      <div className="threshold-chart-wrapper">
        <table className="sr-only">
          <caption>Threshold History Data</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Threshold Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} accessibilityLayer margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 1]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: CHART_DEFAULTS.tooltipBackground,
                borderColor: CHART_DEFAULTS.tooltipBorder,
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)'
              }}
              formatter={(value: number) => [value.toFixed(2), 'Threshold']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-primary)" 
              strokeWidth={2} 
              dot={{ r: 3, fill: 'var(--color-primary)' }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
