import { CircleCheck, RefreshCcw, CloudUpload } from 'lucide-react';
import type { TierNumber } from '@/types';

// lucide-react icon components are React components; using typeof CircleCheck as the type is the correct approach.
export interface TierConfig {
  label: string;          // e.g. "Tier 1 — Local"
  shortLabel: string;     // e.g. "Tier 1"
  description: string;    // e.g. "Resolved locally"
  colorVar: string;       // CSS var name, e.g. "--color-tier-1"
  bgVar: string;          // CSS var name, e.g. "--color-tier-1-bg"
  icon: typeof CircleCheck;
}

export const TIER_CONFIG: Record<TierNumber, TierConfig> = {
  1: {
    label: 'Tier 1 — Local',
    shortLabel: 'Tier 1',
    description: 'Resolved locally',
    colorVar: '--color-tier-1',
    bgVar: '--color-tier-1-bg',
    icon: CircleCheck,
  },
  2: {
    label: 'Tier 2 — Repositioned',
    shortLabel: 'Tier 2',
    description: 'Resolved after repositioning',
    colorVar: '--color-tier-2',
    bgVar: '--color-tier-2-bg',
    icon: RefreshCcw,
  },
  3: {
    label: 'Tier 3 — Cloud',
    shortLabel: 'Tier 3',
    description: 'Escalated to cloud',
    colorVar: '--color-tier-3',
    bgVar: '--color-tier-3-bg',
    icon: CloudUpload,
  },
};
