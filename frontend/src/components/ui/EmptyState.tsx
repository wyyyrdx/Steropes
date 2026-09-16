import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`} role="status">
      {Icon && <Icon className="empty-state-icon" size={32} />}
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <div className="empty-state-action">
          {React.isValidElement(action) ? (
            action
          ) : (
            (action as { label: string; onClick: () => void }).label && (
              <Button variant="primary" onClick={(action as { label: string; onClick: () => void }).onClick}>
                {(action as { label: string; onClick: () => void }).label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
