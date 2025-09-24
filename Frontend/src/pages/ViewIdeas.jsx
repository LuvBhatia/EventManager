import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../api/event';
import { voteApi } from '../api/vote';
import { getCurrentUser, hasAnyRole } from '../services/authService';
import '../styles/ViewIdeas.css';

const ViewIdeas = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedOutcome: '',
    studentId: '',
    studentEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [voteStats, setVoteStats] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [votingLoading, setVotingLoading] = useState({});
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, oldest
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user info first
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Check if user is admin
        const adminStatus = hasAnyRole(['ADMIN', 'CLUB_ADMIN', 'SUPER_ADMIN']);
        setIsAdmin(adminStatus);
        
        // Auto-populate form with user data
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            studentId: currentUser.id?.toString() || '',
            studentEmail: currentUser.email || ''
          }));
        }
        
        // Fetch event details and ideas in parallel
        const [eventData, ideasData] = await Promise.all([
          eventApi.getEventById(eventId),
          eventApi.getIdeasForEvent(eventId).catch(err => {
            console.warn('Error fetching ideas, will try with empty array:', err);
            return []; // Return empty array if there's an error
          })
        ]);
        
        setEvent(eventData);
        setIdeas(ideasData || []);
        
        // Load vote data for all ideas
        if (ideasData && ideasData.length > 0 && currentUser) {
          await loadVoteData(ideasData, currentUser);
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load event details. ' + (err.message || ''));
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const loadVoteData = async (ideasData, currentUser) => {
    try {
      const voteStatsPromises = ideasData.map(idea => 
        voteApi.getVoteStats(idea.id).catch(() => ({ upvotes: 0, downvotes: 0 }))
      );
      
      const userVotesPromises = ideasData.map(idea => 
        voteApi.getUserVote(idea.id, currentUser.id).catch(() => null)
      );

      const [statsResults, votesResults] = await Promise.all([
        Promise.all(voteStatsPromises),
        Promise.all(userVotesPromises)
      ]);

      const newVoteStats = {};
      const newUserVotes = {};

      ideasData.forEach((idea, index) => {
        newVoteStats[idea.id] = statsResults[index];
        newUserVotes[idea.id] = votesResults[index];
      });

      setVoteStats(newVoteStats);
      setUserVotes(newUserVotes);
    } catch (err) {
      console.error('Error loading vote data:', err);
    }
  };

  const handleVote = async (ideaId, voteType) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please sign in to vote');
      return;
    }

    setVotingLoading(prev => ({ ...prev, [ideaId]: true }));

    try {
      const currentVote = userVotes[ideaId];
      
      if (currentVote && currentVote.voteType === voteType) {
        // Remove vote if clicking the same vote type
        await voteApi.removeVote(ideaId, currentUser.id);
        setUserVotes(prev => ({ ...prev, [ideaId]: null }));
      } else {
        // Add or change vote
        await voteApi.voteOnIdea(ideaId, currentUser.id, voteType);
        setUserVotes(prev => ({ ...prev, [ideaId]: { voteType } }));
      }

      // Refresh vote stats
      const newStats = await voteApi.getVoteStats(ideaId);
      setVoteStats(prev => ({ ...prev, [ideaId]: newStats }));

    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setVotingLoading(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    setShowIdeaModal(true);
  };

  const closeIdeaModal = () => {
    setShowIdeaModal(false);
    setSelectedIdea(null);
  };

  const handleBackToEvent = () => {
    // Navigate based on user role
    console.log('Back to Event clicked - User is admin:', isAdmin);
    if (isAdmin) {
      // Admin users go to Club Admin Dashboard's Event Proposals tab
      console.log('Navigating to admin dashboard');
      navigate('/admin/dashboard?tab=proposals');
    } else {
      // Regular users (students) go to Topics page
      console.log('Navigating to topics page');
      navigate('/topics');
    }
  };

  const sortIdeas = (ideasToSort) => {
    return [...ideasToSort].sort((a, b) => {
      const aStats = voteStats[a.id] || { upvotes: 0, downvotes: 0 };
      const bStats = voteStats[b.id] || { upvotes: 0, downvotes: 0 };
      
      switch (sortBy) {
        case 'popular':
          // Sort by net score (upvotes - downvotes), then by total votes
          const aScore = aStats.upvotes - aStats.downvotes;
          const bScore = bStats.upvotes - bStats.downvotes;
          if (aScore !== bScore) {
            return bScore - aScore; // Higher score first
          }
          // If same score, sort by total engagement
          const aTotalVotes = aStats.upvotes + aStats.downvotes;
          const bTotalVotes = bStats.upvotes + bStats.downvotes;
          return bTotalVotes - aTotalVotes;
          
        case 'newest':
          const bDate = new Date(b.submittedAt || b.createdAt);
          const aDate = new Date(a.submittedAt || a.createdAt);
          return bDate.getTime() - aDate.getTime();
          
        case 'oldest':
          const aDateOld = new Date(a.submittedAt || a.createdAt);
          const bDateOld = new Date(b.submittedAt || b.createdAt);
          return aDateOld.getTime() - bDateOld.getTime();
          
        default:
          return 0;
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateFormData = (data) => {
    const newErrors = {};
    
    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (data.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }
    
    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    
    if (!data.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!data.studentEmail.trim()) {
      newErrors.studentEmail = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studentEmail)) {
      newErrors.studentEmail = 'Please enter a valid email address';
    }
    
    if (data.expectedOutcome && data.expectedOutcome.length > 1000) {
      newErrors.expectedOutcome = 'Expected outcome cannot exceed 1000 characters';
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = validateFormData(formData);
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT STARTED ===');
    console.log('Form data:', formData);
    
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    console.log('Current user in handleSubmit:', currentUser);
    
    if (!currentUser) {
      console.error('No current user found');
      setError('Please sign in to submit an idea');
      // Optionally redirect to login
      // navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    // Ensure studentId and studentEmail are populated from current user
    const updatedFormData = {
      ...formData,
      studentId: currentUser.id?.toString() || '',
      studentEmail: currentUser.email || ''
    };
    
    console.log('Updated form data with user info:', updatedFormData);
    
    // Update the form state
    setFormData(updatedFormData);
    
    // Validate form using the updated data
    const validationErrors = validateFormData(updatedFormData);
    console.log('Validation errors:', validationErrors);
    console.log('Validation errors keys:', Object.keys(validationErrors));
    console.log('Form data before validation:', updatedFormData);
    
    if (Object.keys(validationErrors).length > 0) {
      console.error('Form validation failed:', validationErrors);
      console.error('Failed validation details:');
      Object.keys(validationErrors).forEach(key => {
        console.error(`- ${key}: ${validationErrors[key]} (value: "${updatedFormData[key]}")`);
      });
      setErrors(validationErrors);
      return;
    }
    
    console.log('Starting idea submission...');
    setSubmitting(true);
    setError('');
    
    try {
      const ideaPayload = {
        title: updatedFormData.title,
        description: updatedFormData.description,
        expectedOutcome: updatedFormData.expectedOutcome,
        // Use current user's info
        studentId: updatedFormData.studentId,
        studentEmail: updatedFormData.studentEmail
      };
      
      console.log('Calling eventApi.submitIdea with:', { eventId, ideaPayload });
      
      await eventApi.submitIdea(eventId, ideaPayload);
      
      // Refresh ideas
      const updatedIdeas = await eventApi.getIdeasForEvent(eventId).catch(() => []);
      setIdeas(updatedIdeas || []);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        expectedOutcome: '',
        studentId: '',
        studentEmail: ''
      });
      setShowSubmitForm(false);
      
    } catch (err) {
      console.error('=== ERROR IN IDEA SUBMISSION ===');
      console.error('Error submitting idea:', err);
      console.error('Error details:', err.message, err.stack);
      setError(err.message || 'Failed to submit idea. Please try again.');
    } finally {
      console.log('=== FORM SUBMISSION COMPLETED ===');
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'Unknown date';
      }
      
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      // Format the date in a user-friendly way
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      // Show relative time for recent dates
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        // For older dates, show the actual date
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error && !event) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="view-ideas-container">
      <div className="header">
        <h1>Ideas for: {event?.title}</h1>
        <div className="header-actions">
          {!isAdmin && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowSubmitForm(!showSubmitForm)}
            >
              {showSubmitForm ? 'Cancel' : 'Submit New Idea'}
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={handleBackToEvent}
          >
            Back to Event
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showSubmitForm && !isAdmin && (
        <div className="submit-form-section">
          <h2>Submit Your Idea</h2>
          <form onSubmit={handleSubmit} className="idea-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your idea title"
                required
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your idea in detail"
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="expectedOutcome">Expected Outcome (Optional)</label>
              <textarea
                id="expectedOutcome"
                name="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={handleChange}
                rows={3}
                placeholder="What do you hope to achieve with this idea?"
              />
              {errors.expectedOutcome && <span className="error-text">{errors.expectedOutcome}</span>}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Idea'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ideas-section">
        <div className="ideas-header">
          <h2>Submitted Ideas ({ideas.length})</h2>
          
          {ideas.length > 0 && (
            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select 
                id="sortBy"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="newest">🕒 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
              </select>
            </div>
          )}
        </div>
        
        {ideas.length === 0 ? (
          <div className="no-ideas">
            <p>No ideas have been submitted for this event yet.</p>
          </div>
        ) : (
          <div className="ideas-list">
            {sortIdeas(ideas).map((idea, index) => {
              const stats = voteStats[idea.id] || { upvotes: 0, downvotes: 0 };
              const userVote = userVotes[idea.id];
              const isVotingLoading = votingLoading[idea.id];
              const netScore = stats.upvotes - stats.downvotes;

              return (
                <div key={idea.id || index} className={`idea-card ${netScore > 0 ? 'popular' : netScore < 0 ? 'unpopular' : ''}`}>
                  <div className="idea-header">
                    <div className="title-with-score">
                      <h3 
                        className="idea-title-clickable" 
                        onClick={() => handleIdeaClick(idea)}
                        title="Click to view full details"
                      >
                        {netScore > 5 && '🔥 '}
                        {netScore > 10 && '⭐ '}
                        {idea.title}
                      </h3>
                      {sortBy === 'popular' && (
                        <span className={`net-score ${netScore > 0 ? 'positive' : netScore < 0 ? 'negative' : 'neutral'}`}>
                          {netScore > 0 ? '+' : ''}{netScore}
                        </span>
                      )}
                    </div>
                    <span className="submitted-by">Submitted by: {idea.submittedBy}</span>
                  </div>
                  
                  <p className="idea-description">
                    {idea.description.length > 150 
                      ? `${idea.description.substring(0, 150)}...` 
                      : idea.description
                    }
                  </p>
                  
                  {idea.expectedOutcome && (
                    <div className="expected-outcome">
                      <strong>Expected Outcome:</strong> 
                      {idea.expectedOutcome.length > 100 
                        ? ` ${idea.expectedOutcome.substring(0, 100)}...` 
                        : ` ${idea.expectedOutcome}`
                      }
                    </div>
                  )}
                  
                  <div className="idea-footer">
                    <span className="idea-date">{formatDate(idea.submittedAt || idea.createdAt)}</span>
                    
                    <div className="vote-section">
                      {isAdmin ? (
                        // Admin view - show vote counts without voting buttons
                        <>
                          <div className="vote-display">
                            <span className="vote-count upvote-count">
                              👍 {stats.upvotes}
                            </span>
                            <span className="vote-count downvote-count">
                              👎 {stats.downvotes}
                            </span>
                          </div>
                          <button
                            className="view-details-btn"
                            onClick={() => handleIdeaClick(idea)}
                            title="View full details"
                          >
                            📄 Details
                          </button>
                        </>
                      ) : (
                        // Regular user view - show voting buttons
                        <>
                          <button
                            className={`vote-btn upvote ${userVote?.voteType === 'UP' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(idea.id, 'UP');
                            }}
                            disabled={isVotingLoading}
                            title="Upvote this idea"
                          >
                            👍 {stats.upvotes}
                          </button>
                          
                          <button
                            className={`vote-btn downvote ${userVote?.voteType === 'DOWN' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(idea.id, 'DOWN');
                            }}
                            disabled={isVotingLoading}
                            title="Downvote this idea"
                          >
                            👎 {stats.downvotes}
                          </button>
                          
                          <button
                            className="view-details-btn"
                            onClick={() => handleIdeaClick(idea)}
                            title="View full details"
                          >
                            📄 Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Detailed Idea Modal */}
      {showIdeaModal && selectedIdea && (
        <div className="modal-overlay" onClick={closeIdeaModal}>
          <div className="idea-modal enhanced" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Status Badge */}
            <div className="modal-header enhanced">
              <div className="header-content">
                <div className="title-section">
                  <h2 className="modal-title">{selectedIdea.title}</h2>
                  <div className="status-badges">
                    <span className="status-badge submitted">📝 Submitted</span>
                    {((voteStats[selectedIdea.id] || {}).upvotes || 0) > 5 && (
                      <span className="status-badge popular">🔥 Popular</span>
                    )}
                    {((voteStats[selectedIdea.id] || {}).upvotes || 0) > 10 && (
                      <span className="status-badge trending">⭐ Trending</span>
                    )}
                  </div>
                </div>
                <button className="close-btn enhanced" onClick={closeIdeaModal}>
                  <span>×</span>
                </button>
              </div>
              
              {/* Vote Stats Bar */}
              <div className="vote-stats-bar">
                <div className="vote-stat">
                  <span className="vote-icon">👍</span>
                  <span className="vote-count">{(voteStats[selectedIdea.id] || {}).upvotes || 0}</span>
                  <span className="vote-label">Upvotes</span>
                </div>
                <div className="vote-stat">
                  <span className="vote-icon">👎</span>
                  <span className="vote-count">{(voteStats[selectedIdea.id] || {}).downvotes || 0}</span>
                  <span className="vote-label">Downvotes</span>
                </div>
                <div className="vote-stat">
                  <span className="vote-icon">📊</span>
                  <span className="vote-count">
                    {((voteStats[selectedIdea.id] || {}).upvotes || 0) - ((voteStats[selectedIdea.id] || {}).downvotes || 0)}
                  </span>
                  <span className="vote-label">Net Score</span>
                </div>
              </div>
            </div>
            
            <div className="modal-content enhanced">
              {/* Author and Date Info */}
              <div className="author-section">
                <div className="author-info">
                  <div className="author-avatar">
                    {selectedIdea.submittedBy.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-details">
                    <h4 className="author-name">{selectedIdea.submittedBy}</h4>
                    <p className="submission-date">
                      <span className="date-icon">📅</span>
                      Submitted {formatDate(selectedIdea.submittedAt || selectedIdea.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Description Section */}
              <div className="content-section">
                <div className="section-header">
                  <span className="section-icon">📄</span>
                  <h3>Description</h3>
                </div>
                <div className="section-content">
                  <p className="description-text">{selectedIdea.description}</p>
                </div>
              </div>
              
              {/* Expected Outcome Section */}
              {selectedIdea.expectedOutcome && (
                <div className="content-section">
                  <div className="section-header">
                    <span className="section-icon">🎯</span>
                    <h3>Expected Outcome</h3>
                  </div>
                  <div className="section-content">
                    <p className="outcome-text">{selectedIdea.expectedOutcome}</p>
                  </div>
                </div>
              )}
              
              {/* Contact Section */}
              {selectedIdea.studentEmail && (
                <div className="content-section">
                  <div className="section-header">
                    <span className="section-icon">📧</span>
                    <h3>Contact Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="contact-info">
                      <a href={`mailto:${selectedIdea.studentEmail}`} className="email-link">
                        {selectedIdea.studentEmail}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Voting Section */}
              <div className="voting-section">
                <div className="section-header">
                  <span className="section-icon">🗳️</span>
                  <h3>{isAdmin ? 'Vote Statistics' : 'Cast Your Vote'}</h3>
                </div>
                <div className="voting-content">
                  {isAdmin ? (
                    // Admin view - show vote statistics only
                    <div className="admin-vote-stats">
                      <p className="voting-prompt">Vote statistics for this idea:</p>
                      <div className="vote-stats-display">
                        <div className="stat-item upvote-stat">
                          <span className="vote-emoji">👍</span>
                          <span className="vote-text">
                            <strong>Upvotes</strong>
                            <small>People who like this idea</small>
                          </span>
                          <span className="vote-count-badge">{(voteStats[selectedIdea.id] || {}).upvotes || 0}</span>
                        </div>
                        
                        <div className="stat-item downvote-stat">
                          <span className="vote-emoji">👎</span>
                          <span className="vote-text">
                            <strong>Downvotes</strong>
                            <small>People who think it needs improvement</small>
                          </span>
                          <span className="vote-count-badge">{(voteStats[selectedIdea.id] || {}).downvotes || 0}</span>
                        </div>
                        
                        <div className="stat-item net-score">
                          <span className="vote-emoji">📊</span>
                          <span className="vote-text">
                            <strong>Net Score</strong>
                            <small>Overall rating</small>
                          </span>
                          <span className="vote-count-badge">
                            {((voteStats[selectedIdea.id] || {}).upvotes || 0) - ((voteStats[selectedIdea.id] || {}).downvotes || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular user view - show voting buttons
                    <>
                      <p className="voting-prompt">What do you think about this idea?</p>
                      <div className="vote-buttons enhanced">
                        <button
                          className={`vote-btn upvote enhanced ${userVotes[selectedIdea.id]?.voteType === 'UP' ? 'active' : ''}`}
                          onClick={() => handleVote(selectedIdea.id, 'UP')}
                          disabled={votingLoading[selectedIdea.id]}
                        >
                          <span className="vote-emoji">👍</span>
                          <span className="vote-text">
                            <strong>Upvote</strong>
                            <small>I like this idea</small>
                          </span>
                          <span className="vote-count-badge">{(voteStats[selectedIdea.id] || {}).upvotes || 0}</span>
                        </button>
                        
                        <button
                          className={`vote-btn downvote enhanced ${userVotes[selectedIdea.id]?.voteType === 'DOWN' ? 'active' : ''}`}
                          onClick={() => handleVote(selectedIdea.id, 'DOWN')}
                          disabled={votingLoading[selectedIdea.id]}
                        >
                          <span className="vote-emoji">👎</span>
                          <span className="vote-text">
                            <strong>Downvote</strong>
                            <small>Needs improvement</small>
                          </span>
                          <span className="vote-count-badge">{(voteStats[selectedIdea.id] || {}).downvotes || 0}</span>
                        </button>
                      </div>
                      
                      {userVotes[selectedIdea.id] && (
                        <div className="user-vote-status">
                          <span className="status-icon">
                            {userVotes[selectedIdea.id].voteType === 'UP' ? '✅' : '❌'}
                          </span>
                          You {userVotes[selectedIdea.id].voteType === 'UP' ? 'upvoted' : 'downvoted'} this idea
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIdeas;
