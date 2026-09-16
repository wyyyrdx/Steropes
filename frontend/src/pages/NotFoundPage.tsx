import React from 'react';
import './pages.css';

export default function NotFoundPage() {
  return (
    <div className="page">
      <div>
        <h1 className="page-title">404 - Not Found</h1>
        <p className="page-description">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
