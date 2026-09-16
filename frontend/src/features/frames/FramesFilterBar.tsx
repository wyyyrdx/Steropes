import React from 'react';
import type { EventFilters } from '@/types';
import { DateRangePicker, Button } from '@/components/ui';
import TierFilter from './TierFilter';
import ActionFilter from './ActionFilter';
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
    <section className="frames-filter-bar" aria-label="Frame filters">
      <div className="frames-filter-controls">
        <div className="filter-item">
          <span className="filter-label">Tier</span>
          <TierFilter 
            value={filters.tier ?? null} 
            onChange={(tier) => onChange({ ...filters, tier })}
          />
        </div>

        <div className="filter-item">
          <span className="filter-label">Date Range</span>
          <DateRangePicker 
            from={filters.from} 
            to={filters.to}
            onChange={(from, to) => onChange({ ...filters, from, to })}
          />
        </div>

        <div className="filter-item action-filter-container">
          <span className="filter-label">Action</span>
          <ActionFilter 
            value={filters.action ?? null}
            onChange={(action) => onChange({ ...filters, action })}
          />
          <span className="filter-helper">Filtered from loaded results</span>
        </div>

        <div className="filter-actions">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>

      {resultCount !== undefined && (
        <div className="frames-filter-results">
          Showing {resultCount} event{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </section>
  );
}
