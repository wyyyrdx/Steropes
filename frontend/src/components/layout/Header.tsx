import React from 'react';
import { LayoutDashboard, History, BarChart3, Aperture } from 'lucide-react';
import NavLink from './NavLink';
import { LiveIndicator, Tooltip } from '@/components/ui';
import { DEMO_MODE } from '@/constants';
import './Header.css';

export default function Header() {
  return (
    <header role="banner" className="global-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-container">
            <Aperture className="logo-icon" size={24} />
            <span className="wordmark">Steropes</span>
          </div>
        </div>
        
        <nav aria-label="Main navigation" className="header-center">
          <NavLink to="/" label="Dashboard" icon={LayoutDashboard} />
          <NavLink to="/frames" label="Frames History" icon={History} />
          <NavLink to="/analytics" label="Analytics" icon={BarChart3} />
        </nav>
        
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {DEMO_MODE.enabled && (
            <Tooltip side="bottom" content="Mock data active">
              <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-bg-base)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                cursor: 'default'
              }}>
                DEMO MODE
              </div>
            </Tooltip>
          )}
          <LiveIndicator state="live" />
        </div>
      </div>
    </header>
  );
}
