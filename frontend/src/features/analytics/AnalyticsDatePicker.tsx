import React, { useState } from 'react';
import { DateRangePicker } from '@/components/ui';
import './AnalyticsDatePicker.css';

interface AnalyticsDatePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function AnalyticsDatePicker({ from, to, onChange }: AnalyticsDatePickerProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  const setPreset = (days: number) => {
    setMode('preset');
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const fromStr = start.toISOString();
    const toStr = end.toISOString();
    onChange(fromStr, toStr);
  };

  const isPresetActive = (days: number) => {
    if (mode === 'custom') return false;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fromStr = start.toISOString().split('T')[0];
    const toStr = end.toISOString().split('T')[0];
    
    // simple comparison by string prefix (YYYY-MM-DD)
    return from.startsWith(fromStr) && to.startsWith(toStr);
  };

  return (
    <div className="analytics-date-picker">
      <div className="analytics-preset-group" role="group" aria-label="Analytics date range">
        <button 
          className={`preset-btn ${isPresetActive(0) ? 'active' : ''}`}
          aria-pressed={isPresetActive(0)}
          onClick={() => setPreset(0)}
        >
          Today
        </button>
        <button 
          className={`preset-btn ${isPresetActive(7) ? 'active' : ''}`}
          aria-pressed={isPresetActive(7)}
          onClick={() => setPreset(7)}
        >
          Last 7 Days
        </button>
        <button 
          className={`preset-btn ${isPresetActive(30) ? 'active' : ''}`}
          aria-pressed={isPresetActive(30)}
          onClick={() => setPreset(30)}
        >
          Last 30 Days
        </button>
        <button 
          className={`preset-btn ${mode === 'custom' ? 'active' : ''}`}
          aria-pressed={mode === 'custom'}
          onClick={() => setMode('custom')}
        >
          Custom
        </button>
      </div>

      {mode === 'custom' && (
        <div className="analytics-custom-range">
          <DateRangePicker 
            from={new Date(from)} 
            to={new Date(to)} 
            onChange={(start, end) => onChange(start.toISOString(), end.toISOString())} 
          />
        </div>
      )}
    </div>
  );
}
