import React from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, description, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`}>
      <div className="section-header-content">
        <h3 className="section-header-title">{title}</h3>
        {description && <p className="section-header-description">{description}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
}
