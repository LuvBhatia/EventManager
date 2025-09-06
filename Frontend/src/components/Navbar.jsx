import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import AchievementBadge from "./AchievementBadge";
import "./Navbar.css";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  
  const isAdmin = role === 'ADMIN' || role === 'CLUB_ADMIN';

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
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
          {!isAdmin && <Link to="/">Home</Link>}
          {token && !isAdmin && <Link to="/clubs">Clubs</Link>}
          {token && !isAdmin && <Link to="/topics">Club Topics</Link>}
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-outline">Register</Link>
            </>
          ) : (
            <div className="user-actions">
              {!isAdmin && <AchievementBadge />}
              {!isAdmin && <NotificationBell />}
              <button className="btn-ghost" onClick={logout}>Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
