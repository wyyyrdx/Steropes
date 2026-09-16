import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './IconButton.css';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'ghost' | 'secondary';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export default function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = ''
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn-${variant} icon-btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <Icon size={size === 'sm' ? 16 : 20} />
    </button>
  );
}
