import React, { useState, useEffect } from "react";
import { problemApi } from "../api/problem";
import { ideaApi } from "../api/idea";
import { voteApi } from "../api/vote";
import { clubApi } from "../api/club";
import "./ClubTopics.css";

export default function ClubTopics() {
  const [problems, setProblems] = useState([]);
  const [ideas, setIdeas] = useState({});
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [showIdeaForm, setShowIdeaForm] = useState(null);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', implementationPlan: '', expectedOutcome: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [problemsData, clubsData] = await Promise.all([
        problemApi.getAllProblems(),
        clubApi.getAllClubs()
      ]);
      
      setProblems(problemsData);
      setClubs(clubsData);
      
      // Fetch ideas for each problem
      const ideasPromises = problemsData.map(problem => 
        ideaApi.getIdeasByProblem(problem.id)
      );
      const ideasResults = await Promise.all(ideasPromises);
      
      const ideasMap = {};
      problemsData.forEach((problem, index) => {
        ideasMap[problem.id] = ideasResults[index];
      });
      setIdeas(ideasMap);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load club topics');
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesTab = activeTab === 'all' || 
      (problem.category && problem.category.toLowerCase() === activeTab);
    const matchesClub = selectedClub === 'all' || 
      problem.clubId.toString() === selectedClub;
    const matchesSearch = searchTerm === '' || 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.clubName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesClub && matchesSearch;
  });

  const handleVote = async (ideaId, voteType) => {
    try {
      // For now, using a mock userId - in real app, get from auth context
      const userId = 1;
      await voteApi.voteOnIdea(ideaId, userId, voteType);
      
      // Refresh ideas for this problem
      const problemId = Object.keys(ideas).find(id => 
        ideas[id].some(idea => idea.id === ideaId)
      );
      if (problemId) {
        const updatedIdeas = await ideaApi.getIdeasByProblem(problemId);
        setIdeas(prev => ({ ...prev, [problemId]: updatedIdeas }));
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleSubmitIdea = async (problemId) => {
    try {
      if (!newIdea.title.trim() || !newIdea.description.trim()) {
        alert('Please fill in title and description');
        return;
      }
      
      // For now, using mock userId - in real app, get from auth context
      const userId = 1;
      await ideaApi.createIdea(newIdea, problemId, userId);
      
      // Refresh ideas for this problem
      const updatedIdeas = await ideaApi.getIdeasByProblem(problemId);
      setIdeas(prev => ({ ...prev, [problemId]: updatedIdeas }));
      
      // Reset form
      setNewIdea({ title: '', description: '', implementationPlan: '', expectedOutcome: '' });
      setShowIdeaForm(null);
    } catch (err) {
      console.error('Error submitting idea:', err);
      alert('Failed to submit idea');
    }
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
      <div className="club-topics-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading club topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="club-topics-container">
      <div className="topics-header">
        <h1>Club Topics & Ideas</h1>
        <p>Explore club challenges and contribute your creative solutions</p>
      </div>

      <div className="topics-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search topics, clubs, or ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filter-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            All Topics
          </button>
          <button
            className={activeTab === 'technology' ? 'active' : ''}
            onClick={() => setActiveTab('technology')}
          >
            Technology
          </button>
          <button
            className={activeTab === 'design' ? 'active' : ''}
            onClick={() => setActiveTab('design')}
          >
            Design
          </button>
          <button
            className={activeTab === 'engineering' ? 'active' : ''}
            onClick={() => setActiveTab('engineering')}
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
          <button onClick={fetchData}>Try Again</button>
        </div>
      )}

      <div className="topics-list">
        {filteredProblems.map((problem) => (
          <div key={problem.id} className="topic-card">
            <div className="topic-header">
              <div className="topic-priority">
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
              <div className="topic-category">
                {problem.category}
              </div>
            </div>

            <h3 className="topic-title">{problem.title}</h3>
            <p className="topic-description">{problem.description}</p>

            <div className="topic-meta">
              <div className="topic-club">
                <span className="club-icon">🏛️</span>
                <span>{problem.clubName}</span>
              </div>
              <div className="topic-stats">
                <span className="ideas-count">
                  💡 {ideas[problem.id]?.length || 0} ideas
                </span>
              </div>
            </div>

            <div className="topic-actions">
              <button 
                className="btn-primary"
                onClick={() => setExpandedProblem(expandedProblem === problem.id ? null : problem.id)}
              >
                {expandedProblem === problem.id ? 'Hide Ideas' : 'View Ideas'} 
                ({ideas[problem.id]?.length || 0})
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowIdeaForm(showIdeaForm === problem.id ? null : problem.id)}
              >
                Submit Idea
              </button>
            </div>

            {/* Ideas Section */}
            {expandedProblem === problem.id && (
              <div className="ideas-section">
                <div className="ideas-header">
                  <h4>Ideas for "{problem.title}"</h4>
                  <p>Sorted by popularity (upvotes)</p>
                </div>
                
                {ideas[problem.id]?.length > 0 ? (
                  <div className="ideas-list">
                    {ideas[problem.id]
                      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
                      .map((idea) => (
                        <div key={idea.id} className="idea-card">
                          <div className="idea-header">
                            <h5 className="idea-title">{idea.title}</h5>
                            <div className="idea-votes">
                              <button 
                                className="vote-btn upvote"
                                onClick={() => handleVote(idea.id, 'UPVOTE')}
                              >
                                👍 {idea.upvotes || 0}
                              </button>
                              <button 
                                className="vote-btn downvote"
                                onClick={() => handleVote(idea.id, 'DOWNVOTE')}
                              >
                                👎 {idea.downvotes || 0}
                              </button>
                            </div>
                          </div>
                          
                          <p className="idea-description">{idea.description}</p>
                          
                          {idea.implementationPlan && (
                            <div className="idea-implementation">
                              <strong>Implementation Plan:</strong>
                              <p>{idea.implementationPlan}</p>
                            </div>
                          )}
                          
                          {idea.expectedOutcome && (
                            <div className="idea-outcome">
                              <strong>Expected Outcome:</strong>
                              <p>{idea.expectedOutcome}</p>
                            </div>
                          )}
                          
                          <div className="idea-meta">
                            <span className="idea-author">👤 {idea.submittedByName}</span>
                            <span className="idea-status status-{idea.status?.toLowerCase()}">
                              {idea.status}
                            </span>
                            <span className="idea-date">
                              {new Date(idea.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="no-ideas">
                    <p>No ideas submitted yet. Be the first to contribute!</p>
                  </div>
                )}
              </div>
            )}

            {/* Idea Submission Form */}
            {showIdeaForm === problem.id && (
              <div className="idea-form">
                <h4>Submit Your Idea for "{problem.title}"</h4>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitIdea(problem.id); }}>
                  <div className="form-group">
                    <label>Idea Title *</label>
                    <input
                      type="text"
                      value={newIdea.title}
                      onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                      placeholder="Give your idea a catchy title"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={newIdea.description}
                      onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                      placeholder="Describe your idea in detail"
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Implementation Plan</label>
                    <textarea
                      value={newIdea.implementationPlan}
                      onChange={(e) => setNewIdea({...newIdea, implementationPlan: e.target.value})}
                      placeholder="How would you implement this idea?"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expected Outcome</label>
                    <textarea
                      value={newIdea.expectedOutcome}
                      onChange={(e) => setNewIdea({...newIdea, expectedOutcome: e.target.value})}
                      placeholder="What results do you expect?"
                      rows="2"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Submit Idea</button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowIdeaForm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && filteredProblems.length === 0 && (
        <div className="no-results">
          <h3>No topics found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
