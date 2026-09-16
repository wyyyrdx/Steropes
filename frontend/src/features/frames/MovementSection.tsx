import React from 'react';
import type { MovementData } from '@/types';
import { MockBadge } from '@/components/ui';
import './MovementSection.css';

interface MovementSectionProps {
  movement?: MovementData | null;
}

export default function MovementSection({ movement }: MovementSectionProps) {
  if (!movement) {
    return (
      <div className="movement-section">
        <div className="movement-header">
          <h3 className="section-title">Hardware Movement</h3>
        </div>
        <p className="movement-empty">No physical movement for this event</p>
      </div>
    );
  }

  return (
    <div className="movement-section">
      <div className="movement-header">
        <h3 className="section-title">Hardware Movement</h3>
        <div aria-label="Mock data">
          <MockBadge />
          <span className="sr-only">(estimated)</span>
        </div>
      </div>
      
      <dl className="movement-details">
        <div className="movement-row">
          <dt>Pan Delta</dt>
          <dd>{movement.pan_delta > 0 ? '+' : ''}{movement.pan_delta}°</dd>
        </div>
        <div className="movement-row">
          <dt>Tilt Delta</dt>
          <dd>{movement.tilt_delta > 0 ? '+' : ''}{movement.tilt_delta}°</dd>
        </div>
        {movement.actual_pan !== undefined && (
          <div className="movement-row">
            <dt>Actual Pan</dt>
            <dd>{movement.actual_pan}°</dd>
          </div>
        )}
        {movement.actual_tilt !== undefined && (
          <div className="movement-row">
            <dt>Actual Tilt</dt>
            <dd>{movement.actual_tilt}°</dd>
          </div>
        )}
        <div className="movement-row">
          <dt>Status</dt>
          <dd>{movement.status}</dd>
        </div>
      </dl>
    </div>
  );
}
