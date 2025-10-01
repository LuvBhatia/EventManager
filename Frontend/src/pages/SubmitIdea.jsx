import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../api/event';
import { getCurrentUser } from '../services/authService';
import '../styles/SubmitIdea.css';

const SubmitIdea = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedOutcome: '',
    studentId: '',
    studentEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await eventApi.getEventById(eventId);
        setEvent(eventData);
        
        // Get current user info
        const currentUser = getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        setUser(currentUser);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEvent();
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
      
      // Navigate to event details page on success
      navigate(`/events/${eventId}`);
    } catch (err) {
      setError('Failed to submit idea. Please try again.');
      console.error('Error submitting idea:', err);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="submit-idea-container">
      <h1>Submit Idea for: {event?.title}</h1>
      
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
          {errors.studentId && <span className="error-message">{errors.studentId}</span>}
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
          {errors.studentEmail && <span className="error-message">{errors.studentEmail}</span>}
        </div>
        
        <p className="user-name"><strong>Name:</strong> {user?.name || 'Not available'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="idea-form">
        {error && <div className="form-error">{error}</div>}
        
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
          {errors.title && <span className="error-message">{errors.title}</span>}
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
          {errors.description && <span className="error-message">{errors.description}</span>}
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
          {errors.expectedOutcome && <span className="error-message">{errors.expectedOutcome}</span>}
          <div className="character-count">{formData.expectedOutcome.length}/1000</div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit Idea
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitIdea;
