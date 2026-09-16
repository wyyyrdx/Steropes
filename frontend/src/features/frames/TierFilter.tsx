import React from 'react';
import type { TierNumber } from '@/types';
import './TierFilter.css';

interface TierFilterProps {
  value: TierNumber | null;
  onChange: (tier: TierNumber | null) => void;
}

export default function TierFilter({ value, onChange }: TierFilterProps) {
  return (
    <div className="tier-filter-group" role="group" aria-label="Filter by tier">
      <button 
        type="button" 
        className={`tier-filter-btn ${value === null ? 'active' : ''}`}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        All
      </button>
      <button 
        type="button" 
        className={`tier-filter-btn ${value === 1 ? 'active' : ''}`}
        aria-pressed={value === 1}
        onClick={() => onChange(1)}
      >
        Tier 1
      </button>
      <button 
        type="button" 
        className={`tier-filter-btn ${value === 2 ? 'active' : ''}`}
        aria-pressed={value === 2}
        onClick={() => onChange(2)}
      >
        Tier 2
      </button>
      <button 
        type="button" 
        className={`tier-filter-btn ${value === 3 ? 'active' : ''}`}
        aria-pressed={value === 3}
        onClick={() => onChange(3)}
      >
        Tier 3
      </button>
    </div>
  );
}
