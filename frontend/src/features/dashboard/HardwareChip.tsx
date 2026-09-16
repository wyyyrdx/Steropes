import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { HardwareStatusValue } from '@/types';
import { StatusBadge } from '@/components/ui';
import './HardwareChip.css';

interface HardwareChipProps {
  icon: LucideIcon;
  name: string;
  status: HardwareStatusValue;
  metadata?: string;
}

export default function HardwareChip({
  icon: Icon,
  name,
  status,
  metadata
}: HardwareChipProps) {
  return (
    <div className="hardware-chip">
      <div className="hardware-chip-header">
        <Icon className="hardware-chip-icon" size={20} />
        <span className="hardware-chip-name">{name}</span>
      </div>
      <div className="hardware-chip-status">
        <StatusBadge status={status} />
      </div>
      {metadata && (
        <div className="hardware-chip-metadata">
          {metadata}
        </div>
      )}
    </div>
  );
}
