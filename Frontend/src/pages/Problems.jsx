import React, { useState, useEffect } from "react";
import { problemApi } from "../api/problem";
import { clubApi } from "../api/club";
import "./Problems.css";

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');

  useEffect(() => {
    fetchProblems();
    fetchClubs();
  }, []);

  const fetchProblems = async () => {
    try {
      const problemsData = await problemApi.getAllProblems();
      setProblems(problemsData);
      setFilteredProblems(problemsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const clubsData = await clubApi.getAllClubs();
      setClubs(clubsData);
    } catch (err) {
      console.error('Error fetching clubs:', err);
    }
  };

  useEffect(() => {
    let filtered = problems;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(problem => 
        problem.category && problem.category.toLowerCase() === activeTab
      );
    }

    // Filter by club
    if (selectedClub !== 'all') {
      filtered = filtered.filter(problem => 
        problem.clubId.toString() === selectedClub
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.clubName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProblems(filtered);
  }, [problems, activeTab, selectedClub, searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="problems-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problems-container">
      <div className="problems-header">
        <h1>Club Problems</h1>
        <p>Discover challenges posted by clubs and contribute your ideas</p>
      </div>

      <div className="problems-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search problems, clubs, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">🔍</button>
        </div>

        <div className="filter-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => handleTabChange('all')}
          >
            All Problems
          </button>
          <button
            className={activeTab === 'technology' ? 'active' : ''}
            onClick={() => handleTabChange('technology')}
          >
            Technology
          </button>
          <button
            className={activeTab === 'design' ? 'active' : ''}
            onClick={() => handleTabChange('design')}
          >
            Design
          </button>
          <button
            className={activeTab === 'engineering' ? 'active' : ''}
            onClick={() => handleTabChange('engineering')}
          >
            Engineering
          </button>
        </div>

        <div className="club-filter">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="club-select"
          >
            <option value="all">All Clubs</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProblems}>Try Again</button>
        </div>
      )}

      <div className="problems-grid">
        {filteredProblems.map((problem) => (
          <div key={problem.id} className="problem-card">
            <div className="problem-header">
              <div className="problem-priority">
                <span className="priority-icon">
                  {getPriorityIcon(problem.priority)}
                </span>
                <span 
                  className="priority-text"
                  style={{ color: getPriorityColor(problem.priority) }}
                >
                  {problem.priority || 'Normal'}
                </span>
              </div>
              <div className="problem-category">
                {problem.category}
              </div>
            </div>

            <h3 className="problem-title">{problem.title}</h3>
            <p className="problem-description">{problem.description}</p>

            <div className="problem-meta">
              <div className="problem-club">
                <span className="club-icon">🏛️</span>
                <span>{problem.clubName}</span>
              </div>
              <div className="problem-date">
                {new Date(problem.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Deadline Status */}
            {problem.deadline && (
              <div className="deadline-status">
                {problem.isExpired ? (
                  <div className="deadline-expired">
                    <span className="status-icon">⏰</span>
                    <span>Topic Expired</span>
                  </div>
                ) : problem.isViewOnly ? (
                  <div className="deadline-view-only">
                    <span className="status-icon">👁️</span>
                    <span>View Only - Deadline Passed</span>
                  </div>
                ) : (
                  <div className="deadline-active">
                    <span className="status-icon">⏳</span>
                    <span>Deadline: {new Date(problem.deadline).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="problem-actions">
              <button className="btn-primary">
                View Ideas ({problem.ideaCount || 0})
              </button>
              {!problem.isExpired && (
                <button 
                  className={`btn-secondary ${problem.isViewOnly ? 'disabled' : ''}`}
                  disabled={problem.isViewOnly}
                  title={problem.isViewOnly ? 'Deadline has passed - submissions closed' : 'Submit your idea'}
                >
                  {problem.isViewOnly ? 'Submissions Closed' : 'Submit Idea'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredProblems.length === 0 && (
        <div className="no-results">
          <h3>No problems found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
