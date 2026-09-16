import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import './DateRangePicker.css';

interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (from: string, to: string) => void;
  presets?: Array<{ label: string; days: number }>;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 }
];

export default function DateRangePicker({
  from,
  to,
  onChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
  className = ''
}: DateRangePickerProps) {
  const [localFrom, setLocalFrom] = useState(from || '');
  const [localTo, setLocalTo] = useState(to || '');

  useEffect(() => {
    setLocalFrom(from || '');
    setLocalTo(to || '');
  }, [from, to]);

  const handleApply = () => {
    if (localFrom && localTo && localTo >= localFrom) {
      onChange(localFrom, localTo);
    }
  };

  const handlePresetClick = (days: number) => {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);
    const fromStr = fromDate.toISOString().split('T')[0];

    setLocalFrom(fromStr);
    setLocalTo(toStr);
    onChange(fromStr, toStr);
  };

  const isValid = localFrom && localTo && localTo >= localFrom;

  return (
    <div className={`date-range-picker ${className}`}>
      {presets && presets.length > 0 && (
        <div className="date-presets">
          {presets.map(preset => (
            <button
              key={preset.label}
              type="button"
              className="date-preset-btn"
              onClick={() => handlePresetClick(preset.days)}
              disabled={disabled}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="date-inputs-row">
        <div className="date-input-group">
          <label htmlFor="date-from">From</label>
          <input
            id="date-from"
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            disabled={disabled}
            className="date-input"
          />
        </div>
        <span className="date-separator">to</span>
        <div className="date-input-group">
          <label htmlFor="date-to">To</label>
          <input
            id="date-to"
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            disabled={disabled}
            className="date-input"
          />
        </div>
        <Button 
          variant="primary" 
          onClick={handleApply} 
          disabled={disabled || !isValid}
          className="date-apply-btn"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
