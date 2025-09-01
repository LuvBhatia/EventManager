import React, { useState, useEffect } from "react";
import ClubCard from "../components/ClubCard";
import { clubApi } from "../api/club";
import "./Home.css";

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['all', 'technology', 'design', 'engineering']);

  useEffect(() => {
    setIsVisible(true);
    // Start with sample data immediately to ensure rendering
    const sampleClubs = getSampleClubs();
    setClubs(sampleClubs);
    setFilteredClubs(sampleClubs);
    setLoading(false);
    
    // Then try to fetch real data
    fetchClubs();
    fetchCategories();
  }, []);

  const fetchClubs = async () => {
    try {
      const clubsData = await clubApi.getAllClubs();
      if (clubsData && clubsData.length > 0) {
        setClubs(clubsData);
        setFilteredClubs(clubsData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
      // Don't set error state, just keep using sample data
      console.log('Using sample data as fallback');
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await clubApi.getCategories();
      if (categoriesData && categoriesData.length > 0) {
        setCategories(['all', ...categoriesData.map(cat => cat.toLowerCase())]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Keep default categories
      console.log('Using default categories');
    }
  };

  const getSampleClubs = () => [
    {
      id: 1,
      name: "Coding Ninjas CUIET",
      description: "A coding community to enhance problem solving and interview skills.",
      shortName: "CN",
      memberCount: 150,
      eventCount: 12,
      category: "Technology",
      rating: 4.8
    },
    {
      id: 2,
      name: "Google Developer Groups (GDG)",
      description: "Learn Google tech and build real-world projects with peers.",
      shortName: "GD",
      memberCount: 89,
      eventCount: 8,
      category: "Technology",
      rating: 4.6
    },
    {
      id: 3,
      name: "Design Thinking Club CUIET",
      description: "Workshops and events focused on creative problem-solving.",
      shortName: "DT",
      memberCount: 67,
      eventCount: 6,
      category: "Design",
      rating: 4.7
    },
    {
      id: 4,
      name: "IEEE-CIET",
      description: "Professional chapter for research, workshops and competitions.",
      shortName: "IE",
      memberCount: 120,
      eventCount: 15,
      category: "Engineering",
      rating: 4.9
    },
  ];

  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (activeTab === 'all') {
        setFilteredClubs(clubs);
      } else {
        setFilteredClubs(clubs.filter(club => 
          club.category && club.category.toLowerCase() === activeTab
        ));
      }
    } else {
      const filtered = clubs.filter(club =>
        (club.name && club.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (club.category && club.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClubs(filtered);
    }
  }, [searchTerm, activeTab, clubs]);

  const handleGetStarted = () => {
    console.log("Get Started clicked");
  };

  const handleExploreClubs = () => {
    document.getElementById('clubs').scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm(''); // Clear search when changing tabs
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      if (activeTab === 'all') {
        setFilteredClubs(clubs);
      } else {
        setFilteredClubs(clubs.filter(club => 
          club.category && club.category.toLowerCase() === activeTab
        ));
      }
      return;
    }

    try {
      const searchResults = await clubApi.searchClubs(searchTerm);
      if (searchResults && searchResults.length > 0) {
        setFilteredClubs(searchResults);
      } else {
        // If no search results, show filtered local results
        const filtered = clubs.filter(club =>
          (club.name && club.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (club.category && club.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredClubs(filtered);
      }
    } catch (err) {
      console.error('Error searching clubs:', err);
      // Fallback to local filtering
      const filtered = clubs.filter(club =>
        (club.name && club.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (club.category && club.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClubs(filtered);
    }
  };

  return (
    <main className="home-main">
      <section className="hero full-height">
        <div className="hero-inner">
          <div className="hero-left">
            <h1 className={isVisible ? 'fade-in-up' : ''}>Event Idea Marketplace</h1>
            <p className={isVisible ? 'fade-in-up delay-1' : ''}>
              Clubs post event problems. Students submit creative proposals. Community votes for the best ideas.
            </p>
            <div className={`hero-cta ${isVisible ? 'fade-in-up delay-2' : ''}`}>
              <button onClick={handleGetStarted} className="btn-primary large">
                Get Started
              </button>
              <button onClick={handleExploreClubs} className="btn-outline">
                Explore Clubs
              </button>
            </div>
            <div className={`hero-stats ${isVisible ? 'fade-in-up delay-3' : ''}`}>
              <div className="stat-item">
                <span className="stat-number">{clubs.length > 0 ? clubs.reduce((sum, club) => sum + (club.memberCount || 0), 0) : '500+'}</span>
                <span className="stat-label">Active Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{clubs.length || '25+'}</span>
                <span className="stat-label">Clubs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{clubs.length > 0 ? clubs.reduce((sum, club) => sum + (club.eventCount || 0), 0) : '150+'}</span>
                <span className="stat-label">Events Created</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className={`hero-box ${isVisible ? 'fade-in-up delay-2' : ''}`}>
              <h3>🎉 Share Your Ideas</h3>
              <p>Submit your best event ideas and win recognition from top clubs!</p>
              <div className="idea-counter">
                <span className="counter-number">1,247</span>
                <span className="counter-label">Ideas Shared Today</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search clubs, events, or ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">🔍</button>
        </div>
      </section>

      <section id="clubs" className="clubs-section">
        <div className="section-header">
          <h2>Discover Amazing Clubs</h2>
          <p>Find your perfect community and start contributing today</p>
        </div>

        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${activeTab === category ? 'active' : ''}`}
              onClick={() => handleTabChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading clubs...</p>
          </div>
        ) : (
          <div className="clubs-grid">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                desc={club.description}
                shortName={club.shortName}
                members={club.memberCount}
                events={club.eventCount}
                category={club.category}
                rating={club.rating}
              />
            ))}
          </div>
        )}

        {!loading && filteredClubs.length === 0 && (
          <div className="no-results">
            <h3>No clubs found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to make a difference</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Submit Ideas</h3>
            <p>Share your creative event proposals with the community</p>
            <div className="feature-step">Step 1</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗳️</div>
            <h3>Vote & Discuss</h3>
            <p>Vote on the best ideas and participate in discussions</p>
            <div className="feature-step">Step 2</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Get Recognition</h3>
            <p>Winning ideas get implemented and you earn recognition</p>
            <div className="feature-step">Step 3</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of students and clubs creating amazing events together</p>
          <div className="cta-buttons">
            <button className="btn-primary large">Join Now</button>
            <button className="btn-outline">Learn More</button>
          </div>
        </div>
      </section>
    </main>
  );
}
