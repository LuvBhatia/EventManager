import React from "react";
import ClubCard from "../components/ClubCard";
import "./Home.css";

const clubs = [
  { name: "Coding Ninjas CUIET", desc: "A coding community to enhance problem solving and interview skills." },
  { name: "Google Developer Groups (GDG)", desc: "Learn Google tech and build real-world projects with peers." },
  { name: "Design Thinking Club CUIET", desc: "Workshops and events focused on creative problem-solving." },
  { name: "IEEE-CIET", desc: "Professional chapter for research, workshops and competitions." },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <h1>Event Idea Marketplace</h1>
            <p>Clubs post event problems. Students submit creative proposals. Community votes for the best ideas.</p>
            <div className="hero-cta">
              <a href="/register" className="btn-primary large">Get Started</a>
              <a href="#clubs" className="btn-outline">Explore Clubs</a>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-box">Share your best idea and win club recognition 🎉</div>
          </div>
        </div>
      </section>

      <section id="clubs" className="container clubs-section">
        <h2>Popular Clubs</h2>
        <div className="clubs-grid">
          {clubs.map((c, i) => <ClubCard key={i} name={c.name} desc={c.desc} />)}
        </div>
      </section>
    </main>
  );
}
