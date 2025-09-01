import React from "react";
import "./ClubCard.css";

export default function ClubCard({ name, desc }) {
  return (
    <div className="club-card">
      <div className="club-avatar">{name.split(" ").slice(0,2).map(w=>w[0]).join("")}</div>
      <div className="club-body">
        <h3>{name}</h3>
        <p>{desc}</p>
        <div className="club-actions">
          <button className="btn-primary">View Ideas</button>
          <button className="btn-outline">Follow</button>
        </div>
      </div>
    </div>
  );
}
