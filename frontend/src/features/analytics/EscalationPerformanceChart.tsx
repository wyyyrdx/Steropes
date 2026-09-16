import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { EscalationRange } from '@/types';
import { ChartCard, MockBadge } from '@/components/ui';
import { buildEscalationBars } from '@/utils';
import { CHART_DEFAULTS } from '@/constants';
import './EscalationPerformanceChart.css';

interface EscalationPerformanceChartProps {
  bars: EscalationRange[];
  isLoading?: boolean;
}

export default function EscalationPerformanceChart({ bars, isLoading }: EscalationPerformanceChartProps) {
  const data = buildEscalationBars(bars);

  return (
    <ChartCard 
      title="Escalation Performance" 
      subTitle="Escalations by confidence range"
      isLoading={isLoading}
      action={<MockBadge />}
    >
      <div className="escalation-chart-wrapper">
        <table className="sr-only">
          <caption>Escalation Performance Data</caption>
          <thead>
            <tr>
              <th scope="col">Range</th>
              <th scope="col">Escalations</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.range}</td>
                <td>{d.escalations}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} accessibilityLayer margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis 
              dataKey="range" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
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
              formatter={(value: number) => [value, 'Escalations']}
            />
            <Bar dataKey="escalations" fill="var(--chart-tier-3)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
