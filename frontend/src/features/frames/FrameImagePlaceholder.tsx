import React from 'react';
import { Camera } from 'lucide-react';
import './FrameImagePlaceholder.css';

export default function FrameImagePlaceholder() {
  return (
    <div className="frame-image-placeholder" aria-label="Frame image placeholder — not yet available">
      <Camera size={48} className="frame-placeholder-icon" />
      <span className="frame-placeholder-text">Frame image pending</span>
    </div>
  );
}
