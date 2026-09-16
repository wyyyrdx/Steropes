import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3 } from 'lucide-react';
import './MobileTabBar.css';

export default function MobileTabBar() {
  return (
    <nav aria-label="Mobile navigation" className="mobile-tab-bar">
      <RouterNavLink to="/" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={24} />
        <span>Dashboard</span>
      </RouterNavLink>
      <RouterNavLink to="/frames" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        <History size={24} />
        <span>Frames</span>
      </RouterNavLink>
      <RouterNavLink to="/analytics" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        <BarChart3 size={24} />
        <span>Analytics</span>
      </RouterNavLink>
    </nav>
  );
}
