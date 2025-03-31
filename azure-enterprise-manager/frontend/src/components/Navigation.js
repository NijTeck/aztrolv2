import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-logo">Azure Enterprise Manager</div>
        <div className="nav-links">
          <NavLink to="/network" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Network
          </NavLink>
          <NavLink to="/permissions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Permissions
          </NavLink>
          <NavLink to="/cost" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Cost
          </NavLink>
          <NavLink to="/policy" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Policy
          </NavLink>
        </div>
        <div className="user-info">
          {user && (
            <>
              <span className="user-name">{user.name}</span>
              <button className="logout-button" onClick={logout}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
