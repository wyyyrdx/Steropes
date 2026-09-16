import React from 'react';
import { useEventDetail } from '@/hooks';
import { Modal, LoadingSkeleton, ErrorState, Divider } from '@/components/ui';
import FrameImagePlaceholder from './FrameImagePlaceholder';
import DecisionSection from './DecisionSection';
import ConfidenceBreakdownSection from './ConfidenceBreakdownSection';
import CostSection from './CostSection';
import MovementSection from './MovementSection';
import './FrameDetailsModal.css';

interface FrameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export default function FrameDetailsModal({ isOpen, onClose, requestId }: FrameDetailsModalProps) {
  const { event, isLoading, error } = useEventDetail(requestId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="modal-loading-state">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="timeline-row" />
          <LoadingSkeleton variant="timeline-row" />
        </div>
      );
    }

    if (error || !event) {
      const errorMessage = error || (requestId ? 'Event not found' : 'Could not load event details');
      return (
        <div className="modal-error-state">
          <ErrorState title="Error" message={errorMessage} />
        </div>
      );
    }

    return (
      <div className="frame-details-content">
        <section className="frame-details-top">
          <div className="frame-details-media">
            <FrameImagePlaceholder />
          </div>
          <div className="frame-details-summary">
            <DecisionSection event={event} />
          </div>
        </section>

        <Divider />

        <section className="frame-details-section">
          <ConfidenceBreakdownSection breakdown={event.confidence_breakdown} />
        </section>

        <Divider />

        <section className="frame-details-section">
          <CostSection event={event} />
        </section>

        <Divider />

        <section className="frame-details-section">
          <MovementSection movement={event._ui_movement} />
        </section>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Frame Details" size="md">
      {renderContent()}
    </Modal>
  );
}
