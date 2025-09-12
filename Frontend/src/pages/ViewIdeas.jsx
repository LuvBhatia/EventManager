import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../api/event';
import { getCurrentUser } from '../services/authService';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user info first
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
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
        setLoading(false);
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load event details. ' + (err.message || ''));
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Please enter a valid email address';
    } else if (!formData.studentEmail.endsWith('@chitkara.edu.in')) {
      newErrors.studentEmail = 'Please use your official Chitkara University email (@chitkara.edu.in)';
    }
    
    if (formData.expectedOutcome && formData.expectedOutcome.length > 1000) {
      newErrors.expectedOutcome = 'Expected outcome cannot exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please sign in to submit an idea');
      // Optionally redirect to login
      // navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await eventApi.submitIdea(eventId, {
        title: formData.title,
        description: formData.description,
        expectedOutcome: formData.expectedOutcome,
        // Use current user's info
        studentId: currentUser.id,
        studentEmail: currentUser.email
      });
      
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
      console.error('Error submitting idea:', err);
      setError(err.message || 'Failed to submit idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
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
          <button 
            className="btn btn-primary"
            onClick={() => setShowSubmitForm(!showSubmitForm)}
          >
            {showSubmitForm ? 'Cancel' : 'Submit New Idea'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            Back to Event
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showSubmitForm && (
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
        <h2>Submitted Ideas ({ideas.length})</h2>
        
        {ideas.length === 0 ? (
          <div className="no-ideas">
            <p>No ideas have been submitted for this event yet.</p>
          </div>
        ) : (
          <div className="ideas-list">
            {ideas.map((idea, index) => (
              <div key={idea.id || index} className="idea-card">
                <div className="idea-header">
                  <h3>{idea.title}</h3>
                  <span className="submitted-by">Submitted by: {idea.submittedBy}</span>
                </div>
                <p className="idea-description">{idea.description}</p>
                {idea.expectedOutcome && (
                  <div className="expected-outcome">
                    <strong>Expected Outcome:</strong> {idea.expectedOutcome}
                  </div>
                )}
                <div className="idea-footer">
                  <span className="idea-date">{formatDate(idea.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewIdeas;
