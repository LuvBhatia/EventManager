import React, { useState, useEffect } from 'react';
import { eventApi } from '../api/event';
import './EventManagementModal.css';

export default function EventManagementModal({ 
  isOpen, 
  onClose, 
  event = null, 
  onEventSaved,
  clubs = [] 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    ideaSubmissionDeadline: '',
    acceptsIdeas: false,
    location: '',
    maxParticipants: '',
    registrationFee: '0',
    type: 'WORKSHOP',
    clubId: '',
    tags: '',
    imageUrl: '',
    externalLink: '',
    status: 'DRAFT',
    poster: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);

  const eventTypes = [
    'WORKSHOP', 'SEMINAR', 'COMPETITION', 'HACKATHON', 
    'CONFERENCE', 'NETWORKING', 'SOCIAL', 'SPORTS', 
    'CULTURAL', 'TECHNICAL', 'OTHER'
  ];

  const eventStatuses = [
    'DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 
    'ONGOING', 'COMPLETED', 'CANCELLED'
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        ideaSubmissionDeadline: event.ideaSubmissionDeadline ? new Date(event.ideaSubmissionDeadline).toISOString().slice(0, 16) : '',
        acceptsIdeas: event.acceptsIdeas || false,
        location: event.location || '',
        maxParticipants: event.maxParticipants?.toString() || '',
        registrationFee: event.registrationFee?.toString() || '0',
        type: event.type || 'WORKSHOP',
        clubId: event.clubId?.toString() || '',
        tags: event.tags || '',
        imageUrl: event.imageUrl || '',
        externalLink: event.externalLink || '',
        status: event.status || 'DRAFT'
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        ideaSubmissionDeadline: '',
        acceptsIdeas: false,
        location: '',
        maxParticipants: '',
        registrationFee: '0',
        type: 'WORKSHOP',
        clubId: clubs.length > 0 ? clubs[0].id.toString() : '',
        tags: '',
        imageUrl: '',
        externalLink: '',
        status: 'DRAFT'
      });
    }
    setErrors({});
  }, [event, clubs, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for deadline
    if (name === 'ideaSubmissionDeadline' && value) {
      const selectedDateTime = new Date(value);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        setErrors(prev => ({
          ...prev,
          ideaSubmissionDeadline: 'Deadline must be in the future'
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          poster: 'Please select a valid image file (JPEG, PNG, GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          poster: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        poster: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors(prev => ({
        ...prev,
        poster: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Topic title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Topic description is required';
    }

    if (!formData.clubId) {
      newErrors.clubId = 'Club selection is required';
    }

    // Validate deadline is not in the past
    if (formData.ideaSubmissionDeadline) {
      const selectedDateTime = new Date(formData.ideaSubmissionDeadline);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        newErrors.ideaSubmissionDeadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields before sending
      if (!formData.title || !formData.title.trim()) {
        setErrors({ title: 'Title is required' });
        return;
      }
      
      if (!formData.clubId) {
        setErrors({ clubId: 'Club selection is required' });
        return;
      }

      // If there's a poster file, upload it first
      let imageUrl = formData.imageUrl;
      if (formData.poster) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.poster);
        
        const uploadResponse = await fetch('http://localhost:8080/api/upload/poster', {
          method: 'POST',
          body: uploadFormData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } else {
          throw new Error('Failed to upload poster');
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : null,
        type: formData.type || 'WORKSHOP',
        clubId: parseInt(formData.clubId),
        startDate: null,
        endDate: null,
        registrationDeadline: null,
        location: null,
        maxParticipants: null,
        registrationFee: 0.0,
        ideaSubmissionDeadline: formData.ideaSubmissionDeadline ? formData.ideaSubmissionDeadline : null,
        acceptsIdeas: true,
        status: 'PUBLISHED',
        tags: null,
        imageUrl: imageUrl
      };

      console.log('Sending event data:', eventData);

      let savedEvent;
      if (event) {
        savedEvent = await eventApi.updateEvent(event.id, eventData);
      } else {
        savedEvent = await eventApi.createEvent(eventData);
      }

      onEventSaved(savedEvent);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString();
  };

  // Get current datetime in datetime-local format (YYYY-MM-DDTHH:MM)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content event-modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Topic' : 'Create New Topic'}</h2>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn-preview"
            >
              {showPreview ? '👁️‍🗨️' : '👁️'}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="event-preview">
            <div className="preview-header">
              <h3>{formData.title || 'Event Title'}</h3>
              <span className={`status ${formData.status.toLowerCase()}`}>
                {formData.status}
              </span>
            </div>
            
            <div className="preview-details">
              <div className="detail-item">
                📅
                <span>
                  {formData.startDate ? formatDateTime(formData.startDate) : 'Start date not set'}
                  {formData.endDate && ` - ${formatDateTime(formData.endDate)}`}
                </span>
              </div>
              
              <div className="detail-item">
📍
                <span>{formData.location || 'Location not set'}</span>
              </div>
              
              {formData.maxParticipants && (
                <div className="detail-item">
                  👥
                  <span>Max {formData.maxParticipants} participants</span>
                </div>
              )}
              
              {formData.registrationFee > 0 && (
                <div className="detail-item">
                  💰
                  <span>${formData.registrationFee}</span>
                </div>
              )}
              
              {formData.registrationDeadline && (
                <div className="detail-item">
                  🕒
                  <span>Register by {formatDateTime(formData.registrationDeadline)}</span>
                </div>
              )}
              
              {formData.acceptsIdeas && (
                <div className="detail-item">
                  🏷️
                  <span>
                    Accepts Ideas
                    {formData.ideaSubmissionDeadline && ` until ${formatDateTime(formData.ideaSubmissionDeadline)}`}
                  </span>
                </div>
              )}
            </div>
            
            {formData.description && (
              <div className="preview-description">
                <h4>Description</h4>
                <p>{formData.description}</p>
              </div>
            )}
            
            {formData.tags && (
              <div className="preview-tags">
                <h4>Tags</h4>
                <div className="tag-list">
                  {formData.tags.split(',').map((tag, index) => (
                    <span key={index} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="event-form">
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Topic Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter topic title (e.g., AI Workshop Ideas, Hackathon Themes)"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Event Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Topic Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what kind of ideas you're looking for. Be specific about the topic scope, goals, and any requirements..."
              />
              <small className="help-text">This helps students understand what types of ideas to propose</small>
            </div>


            <div className="form-group">
              <label htmlFor="clubId">Organizing Club *</label>
              <select
                id="clubId"
                name="clubId"
                value={formData.clubId}
                onChange={handleInputChange}
                className={errors.clubId ? 'error' : ''}
              >
                <option value="">Select a club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
              {errors.clubId && <span className="error-text">{errors.clubId}</span>}
            </div>



            <div className="form-group">
              <label htmlFor="ideaSubmissionDeadline">Idea Submission Deadline</label>
              <input
                type="datetime-local"
                id="ideaSubmissionDeadline"
                name="ideaSubmissionDeadline"
                value={formData.ideaSubmissionDeadline}
                min={getCurrentDateTime()}
                onChange={handleInputChange}
                className={errors.ideaSubmissionDeadline ? 'error' : ''}
              />
              {errors.ideaSubmissionDeadline && <span className="error-text">{errors.ideaSubmissionDeadline}</span>}
              <small className="help-text">Leave empty for no deadline. Only future dates and times are allowed.</small>
            </div>

            <div className="form-group">
              <label htmlFor="poster">Event Poster (Optional)</label>
              <input
                type="file"
                id="poster"
                name="poster"
                onChange={handleFileChange}
                accept="image/*"
                className={errors.poster ? 'error' : ''}
              />
              {errors.poster && <span className="error-text">{errors.poster}</span>}
              <small className="help-text">Upload event poster (JPEG, PNG, GIF - Max 5MB)</small>
              
              {posterPreview && (
                <div className="poster-preview" style={{ marginTop: '10px', maxWidth: '300px' }}>
                  <img src={posterPreview} alt="Poster preview" style={{ width: '100%', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                💾
                {isSubmitting ? 'Saving...' : (event ? 'Update Topic' : 'Create Topic')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
