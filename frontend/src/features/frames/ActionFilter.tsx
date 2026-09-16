import React from 'react';
import type { ActionTaken } from '@/types';
import './ActionFilter.css';

interface ActionFilterProps {
  value: ActionTaken | null;
  onChange: (action: ActionTaken | null) => void;
}

export default function ActionFilter({ value, onChange }: ActionFilterProps) {
  return (
    <div className="action-filter-wrapper">
      <label htmlFor="action-select" className="action-filter-label sr-only">
        Filter by Action
      </label>
      <select 
        id="action-select"
        className="action-filter-select"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? (val as ActionTaken) : null);
        }}
      >
        <option value="">All Actions</option>
        <option value="ACCEPT">ACCEPT</option>
        <option value="REPOSITION">REPOSITION</option>
        <option value="ESCALATE">ESCALATE</option>
      </select>
    </div>
  );
}
