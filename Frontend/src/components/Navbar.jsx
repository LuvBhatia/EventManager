import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
          <Link to="/">Home</Link>
          <Link to="/clubs">Clubs</Link>
          {token && <Link to="/topics">Club Topics</Link>}
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-outline">Register</Link>
            </>
          ) : (
            <button className="btn-ghost" onClick={logout}>Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
