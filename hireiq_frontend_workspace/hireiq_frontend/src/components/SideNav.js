import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './SideNav.css';

/**
 * PUBLIC_INTERFACE
 * Minimalistic side navigation for dashboard.
 */
function SideNav({ routes = [] }) {
  const location = useLocation();

  return (
    <nav className="sidenav">
      <div className="sidenav-title">Hire<span className="accent">IQ</span></div>
      <ul>
        {routes.map(route => (
          <li key={route.path}>
            <NavLink
              to={route.path}
              className={({ isActive }) =>
                isActive || location.pathname === route.path
                  ? 'navlink active'
                  : 'navlink'
              }
              end
            >
              {route.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SideNav;
