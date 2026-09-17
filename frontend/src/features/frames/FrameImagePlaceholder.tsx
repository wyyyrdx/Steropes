import React from 'react';
import { Camera } from 'lucide-react';
import { generateFrameSvg } from '@/utils';
import './FrameImagePlaceholder.css';

interface FrameImagePlaceholderProps {
  seed?: string;
  label?: string;
}

export default function FrameImagePlaceholder({ seed, label }: FrameImagePlaceholderProps) {
  if (seed && label) {
    return (
      <img 
        src={generateFrameSvg(seed, label)} 
        alt={`Generated frame for ${label}`}
        className="frame-image-generated"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <div className="frame-image-placeholder" aria-label="Frame image placeholder — not yet available">
      <Camera size={48} className="frame-placeholder-icon" />
      <span className="frame-placeholder-text">Frame image pending</span>
    </div>
  );
}
