import React from 'react';
import { LayoutDashboard, History, BarChart3, Aperture } from 'lucide-react';
import NavLink from './NavLink';
import { LiveIndicator } from '@/components/ui';
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
        
        <div className="header-right">
          <LiveIndicator state="live" />
        </div>
      </div>
    </header>
  );
}
