import React from 'react';
import Header from './Header';
import MobileTabBar from './MobileTabBar';
import OfflineBanner from './OfflineBanner';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <OfflineBanner />
      <Header />
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
