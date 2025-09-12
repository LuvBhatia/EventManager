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
        // Fetch event details and ideas in parallel
        const [eventData, ideasData] = await Promise.all([
          eventApi.getEventById(eventId),
          eventApi.getIdeasForEvent(eventId)
        ]);
        
        setEvent(eventData);
        setIdeas(ideasData);
        
        // Get current user info
        const currentUser = getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        setUser(currentUser);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details or ideas');
        setLoading(false);
        console.error('Error fetching data:', err);
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
      newErrors.title = 'Idea title is required';
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        expectedOutcome: formData.expectedOutcome,
        studentId: formData.studentId,
        studentName: user?.name || '',
        studentEmail: formData.studentEmail
      };
      
      await eventApi.submitIdea(eventId, submissionData);
      
      // Refresh ideas list
      const updatedIdeas = await eventApi.getIdeasForEvent(eventId);
      setIdeas(updatedIdeas);
      
      // Reset form and hide it
      setFormData({
        title: '',
        description: '',
        expectedOutcome: '',
        studentId: '',
        studentEmail: ''
      });
      setShowSubmitForm(false);
      setError('');
      
    } catch (err) {
      setError('Failed to submit idea. Please try again.');
      console.error('Error submitting idea:', err);
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
          <h2>Submit New Idea</h2>
          
          <div className="user-info">
            <div className="form-group">
              <label htmlFor="studentId">Student ID *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="Enter your student ID"
                className={errors.studentId ? 'error' : ''}
              />
              {errors.studentId && <span className="error-text">{errors.studentId}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="studentEmail">Official College Email *</label>
              <input
                type="email"
                id="studentEmail"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                required
                placeholder="Enter your college email"
                className={errors.studentEmail ? 'error' : ''}
              />
              {errors.studentEmail && <span className="error-text">{errors.studentEmail}</span>}
            </div>
            
            <p className="user-name"><strong>Name:</strong> {user?.name || 'Not available'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="idea-form">
            <div className="form-group">
              <label htmlFor="title">Idea Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                className={errors.title ? 'error' : ''}
                placeholder="Enter a clear and concise title for your idea"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
              <div className="character-count">{formData.title.length}/200</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                maxLength={2000}
                className={errors.description ? 'error' : ''}
                placeholder="Describe your idea in detail. What problem does it solve? How will it work?"
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
              <div className="character-count">{formData.description.length}/2000</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="expectedOutcome">Expected Outcome / Advantage / Impact</label>
              <textarea
                id="expectedOutcome"
                name="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={handleChange}
                rows={4}
                maxLength={1000}
                className={errors.expectedOutcome ? 'error' : ''}
                placeholder="What impact do you expect this idea to have? (Optional)"
              />
              {errors.expectedOutcome && <span className="error-text">{errors.expectedOutcome}</span>}
              <div className="character-count">{formData.expectedOutcome.length}/1000</div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowSubmitForm(false)}
              >
                Cancel
              </button>
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
            <p>Be the first to share your innovative idea!</p>
          </div>
        ) : (
          <div className="ideas-list">
            {ideas.map((idea, index) => (
              <div key={idea.id || index} className="idea-card">
                <div className="idea-header">
                  <h3 className="idea-title">{idea.title}</h3>
                  <div className="idea-meta">
                    <span className="submitted-by">By: {idea.submittedBy}</span>
                    <span className="submitted-date">{formatDate(idea.submittedAt)}</span>
                  </div>
                </div>
                
                <div className="idea-content">
                  <div className="idea-description">
                    <h4>Description:</h4>
                    <p>{idea.description}</p>
                  </div>
                  
                  {idea.expectedOutcome && (
                    <div className="idea-outcome">
                      <h4>Expected Outcome:</h4>
                      <p>{idea.expectedOutcome}</p>
                    </div>
                  )}
                </div>
                
                <div className="idea-footer">
                  <span className="idea-number">Idea #{index + 1}</span>
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
