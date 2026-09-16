import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import './NavLink.css';

interface NavLinkProps {
  to: string;
  label: string;
  icon?: LucideIcon;
}

export default function NavLink({ to, label, icon: Icon }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon className="nav-link-icon" size={16} />}
          <span className="nav-link-label">{label}</span>
        </>
      )}
    </RouterNavLink>
  );
}
