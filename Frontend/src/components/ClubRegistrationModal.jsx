import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ClubRegistrationModal.css';

export default function ClubRegistrationModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    shortName: '',
    memberCount: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = ['Technology', 'Design', 'Engineering', 'Business', 'Arts', 'Sports', 'Science'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Club name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    } else if (formData.shortName.length > 10) {
      newErrors.shortName = 'Short name must be 10 characters or less';
    }
    
    if (!formData.memberCount || formData.memberCount === '') {
      newErrors.memberCount = 'Number of members is required';
    } else if (isNaN(formData.memberCount) || parseInt(formData.memberCount) < 0) {
      newErrors.memberCount = 'Please enter a valid number of members';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        shortName: '',
        memberCount: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ general: 'Failed to register club. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      shortName: '',
      memberCount: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Register New Club</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="club-registration-form">
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Club Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter club name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="shortName">Short Name *</label>
            <input
              id="shortName"
              name="shortName"
              type="text"
              placeholder="e.g., TCC, DC"
              value={formData.shortName}
              onChange={handleChange}
              className={errors.shortName ? 'error' : ''}
              maxLength="10"
              required
            />
            {errors.shortName && <span className="error-text">{errors.shortName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="memberCount">Number of Members *</label>
            <input
              id="memberCount"
              name="memberCount"
              type="number"
              placeholder="Enter current number of members"
              value={formData.memberCount}
              onChange={handleChange}
              className={errors.memberCount ? 'error' : ''}
              min="0"
              required
            />
            {errors.memberCount && <span className="error-text">{errors.memberCount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your club's purpose and activities"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows="4"
              required
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-notice">
            <p><strong>Note:</strong> Your club registration will be pending approval by a super admin before it becomes active.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
