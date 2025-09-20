import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import AchievementBadge from "./AchievementBadge";
import "./Navbar.css";

export default function Navbar() {
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Force component to re-render when needed
  const triggerUpdate = () => setForceUpdate(prev => prev + 1);
  
  // Get fresh auth data on every render
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const superAdminToken = localStorage.getItem("superAdminToken");
  const userRole = localStorage.getItem("userRole");
  
  const isAuthenticated = token || superAdminToken;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'CLUB_ADMIN';
  
  // Update when location changes
  useEffect(() => {
    triggerUpdate();
  }, [location]);
  
  // Listen for custom auth events
  useEffect(() => {
    const handleAuthChange = () => triggerUpdate();
    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    triggerUpdate();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="brand" onClick={() => navigate("/")}>
          <span className="logo-emoji">🎪</span>
          <div>
            <div className="brand-title">Event Idea Marketplace</div>
            <div className="brand-sub">Clubs • Ideas • Votes</div>
          </div>
        </div>

        <nav className="navlinks">
          {!isAdmin && !isSuperAdmin && <Link to="/">Home</Link>}
          {token && !isAdmin && !isSuperAdmin && <Link to="/clubs">Clubs</Link>}
          {token && !isAdmin && !isSuperAdmin && <Link to="/topics">Club Topics</Link>}
          {token && !isAdmin && !isSuperAdmin && <Link to="/leaderboard">🏆 Leaderboard</Link>}
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-outline">Register</Link>
            </>
          ) : (
            <div className="user-actions">
              {isSuperAdmin && <span className="admin-badge">🔐 Super Admin</span>}
              {!isAdmin && !isSuperAdmin && <AchievementBadge />}
              {!isAdmin && !isSuperAdmin && <NotificationBell />}
              <button className="btn-ghost" onClick={logout}>Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
