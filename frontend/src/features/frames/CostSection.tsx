import React from 'react';
import type { DecisionEvent } from '@/types';
import './CostSection.css';

interface CostSectionProps {
  event: DecisionEvent;
}

export default function CostSection({ event }: CostSectionProps) {
  const isCloudEscalation = event.tier_resolved === 3;
  const avoided = event.cloud_cost_avoided;

  return (
    <div className="cost-section">
      <h3 className="section-title">Cost Impact</h3>
      <dl className="cost-details">
        <div className="cost-row">
          <dt>Cloud Escalation</dt>
          <dd>{isCloudEscalation ? 'Yes' : 'No'}</dd>
        </div>
        <div className="cost-row">
          <dt>Cloud Call Avoided</dt>
          <dd>{avoided ? 'Yes' : 'No'}</dd>
        </div>
        <div className="cost-row">
          <dt>Savings</dt>
          <dd className={avoided ? 'cost-savings-positive' : 'cost-savings-negative'}>
            {avoided ? 'Bedrock not called — cloud cost avoided' : 'Cloud call was made'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
