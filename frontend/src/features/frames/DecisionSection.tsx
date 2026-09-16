import React from 'react';
import type { DecisionEvent } from '@/types';
import { TierBadge, ActionBadge } from '@/components/ui';
import { formatTimestamp } from '@/utils';
import './DecisionSection.css';

interface DecisionSectionProps {
  event: DecisionEvent;
}

export default function DecisionSection({ event }: DecisionSectionProps) {
  const getResultString = (action: string) => {
    switch(action) {
      case 'ACCEPT': return 'Resolved Locally';
      case 'REPOSITION': return 'Resolved After Reposition';
      case 'ESCALATE': return 'Escalated to Cloud';
      default: return 'Unknown';
    }
  };

  const shortId = event.request_id.slice(0, 8) + '…';

  return (
    <dl className="decision-section">
      <div className="decision-row">
        <dt>Tier Resolved</dt>
        <dd><TierBadge tier={event.tier_resolved} /></dd>
      </div>
      <div className="decision-row">
        <dt>Action Taken</dt>
        <dd><ActionBadge action={event.action_taken} /></dd>
      </div>
      <div className="decision-row">
        <dt>Result</dt>
        <dd className="decision-result">{getResultString(event.action_taken)}</dd>
      </div>
      <div className="decision-row">
        <dt>Timestamp</dt>
        <dd>{formatTimestamp(event.timestamp)}</dd>
      </div>
      <div className="decision-row">
        <dt>Request ID</dt>
        <dd>
          <code className="decision-code" title={event.request_id}>{shortId}</code>
        </dd>
      </div>
    </dl>
  );
}
