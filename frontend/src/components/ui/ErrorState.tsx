import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  severity?: 'warning' | 'error';
  className?: string;
}

export default function ErrorState({ message, onRetry, severity = 'error', className = '' }: ErrorStateProps) {
  return (
    <div className={`error-state severity-${severity} ${className}`} role="alert">
      <AlertTriangle className="error-state-icon" size={24} />
      <span className="error-state-message">{message}</span>
      {onRetry && (
        <button type="button" className="error-state-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
