import type { ActionTaken } from '@/types';

export interface ActionConfig {
  label: string;
  description: string;
  colorVar: string;  // maps to a status/tier color
}

export const ACTION_CONFIG: Record<ActionTaken, ActionConfig> = {
  ACCEPT: {
    label: 'ACCEPT',
    description: 'Resolved without further cost',
    colorVar: '--color-tier-1',
  },
  REPOSITION: {
    label: 'REPOSITION',
    description: 'Camera moved to gain better evidence',
    colorVar: '--color-tier-2',
  },
  ESCALATE: {
    label: 'ESCALATE',
    description: 'Escalated to cloud VLM',
    colorVar: '--color-tier-3',
  },
};
