import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { EventFilters } from '@/types';
import { Button } from '@/components/ui';
import TierFilter from './TierFilter';
import ActionFilter from './ActionFilter';
import DateRangePicker from './DateRangePicker';
import './FramesFilterBar.css';

interface FramesFilterBarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  onReset: () => void;
  resultCount?: number;
}

export default function FramesFilterBar({
  filters,
  onChange,
  onReset,
  resultCount
}: FramesFilterBarProps) {
  return (
    <section className="frames-filter-bar" role="group" aria-label="Frame filters">
      <div className="filter-row-1">
        <TierFilter 
          value={filters.tier ?? null} 
          onChange={(tier) => onChange({ ...filters, tier })}
        />
        <DateRangePicker 
          from={filters.from} 
          to={filters.to}
          onChange={(from, to) => onChange({ ...filters, from, to })}
        />
        <div className="action-control-stack">
          <ActionFilter 
            value={filters.action ?? null}
            onChange={(action) => onChange({ ...filters, action })}
          />
          <span className="filter-helper">Filtered from loaded results</span>
        </div>
      </div>
      
      <div className="filter-row-2">
        <Button 
          variant="secondary" 
          size="sm"
          icon={RotateCcw}
          onClick={onReset}
          className="filter-reset-btn"
        >
          Reset
        </Button>

        {resultCount !== undefined && (
          <div className="filter-results-count" aria-live="polite">
            <span className="count-number">{resultCount}</span>
            <span className="count-label">{resultCount === 1 ? 'event' : 'events'}</span>
          </div>
        )}
      </div>
    </section>
  );
}
