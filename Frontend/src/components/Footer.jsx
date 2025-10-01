import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Event Idea Marketplace</h4>
            <p>Connecting clubs and students to create better events.</p>
          </div>
          <div>
            <h5>Clubs</h5>
            <ul>
              <li>Coding Ninjas CUIET</li>
              <li>Google Developer Groups (GDG)</li>
              <li>Design Thinking Club CUIET</li>
              <li>IEEE-CIET</li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <p>email: contact@ideamarket.local</p>
          </div>
        </div>

        <div className="footer-bottom">© 2025 Event Idea Marketplace — All rights reserved.</div>
      </div>
    </footer>
  );
}
