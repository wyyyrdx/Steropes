import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`} role="status">
      <Icon className="empty-state-icon" size={32} />
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button type="button" className="empty-state-action" onClick={action.onClick}>
          {/* TODO: Swap this for the real Button component once fully adopted */}
          {action.label}
        </button>
      )}
    </div>
  );
}
