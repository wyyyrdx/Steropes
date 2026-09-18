import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import './DateRangePicker.css';

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  useEffect(() => {
    if (isOpen) {
      setCustomFrom(from);
      setCustomTo(to);
    }
  }, [isOpen, from, to]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDisplayLabel = () => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const last7 = d.toISOString().split('T')[0];
    d.setDate(d.getDate() - 23); // 30 days total
    const last30 = d.toISOString().split('T')[0];
    
    if (from === today && to === today) return 'Today';
    if (from === last7 && to === today) return 'Last 7 Days';
    if (from === last30 && to === today) return 'Last 30 Days';
    
    if (from && to) return `${from} – ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
    return 'Select Range';
  };

  const handlePreset = (preset: 'today' | 'last7' | 'last30') => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    
    let f = today;
    if (preset === 'last7') {
      d.setDate(d.getDate() - 7);
      f = d.toISOString().split('T')[0];
    } else if (preset === 'last30') {
      d.setDate(d.getDate() - 30);
      f = d.toISOString().split('T')[0];
    }
    
    onChange(f, today);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      onChange(customFrom, customTo);
      setIsOpen(false);
    }
  };

  return (
    <div className="date-range-picker-container" ref={containerRef}>
      <button 
        type="button" 
        className="date-range-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Calendar size={16} className="date-range-icon" />
        <span className="date-range-label">{getDisplayLabel()}</span>
        <ChevronDown size={16} className="date-range-caret" />
      </button>

      {isOpen && (
        <div className="date-range-popover">
          <div className="date-range-presets">
            <button type="button" className="preset-btn" onClick={() => handlePreset('today')}>Today</button>
            <button type="button" className="preset-btn" onClick={() => handlePreset('last7')}>Last 7 Days</button>
            <button type="button" className="preset-btn" onClick={() => handlePreset('last30')}>Last 30 Days</button>
          </div>
          
          <div className="date-range-divider" />
          
          <div className="date-range-custom">
            <div className="custom-inputs">
              <div className="custom-input-group">
                <label>From</label>
                <input 
                  type="date" 
                  value={customFrom} 
                  onChange={(e) => setCustomFrom(e.target.value)} 
                />
              </div>
              <div className="custom-input-group">
                <label>To</label>
                <input 
                  type="date" 
                  value={customTo} 
                  onChange={(e) => setCustomTo(e.target.value)} 
                />
              </div>
            </div>
            <Button 
              variant="primary" 
              className="apply-btn"
              onClick={handleApplyCustom}
              disabled={!customFrom || !customTo}
            >
              Apply Range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
