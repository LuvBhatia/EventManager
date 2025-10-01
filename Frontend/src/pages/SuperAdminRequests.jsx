import React, { useState, useEffect } from 'react';
import { superAdminRequestApi } from '../api/superAdminRequests';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle } from 'lucide-react';
import './SuperAdminRequests.css';

export default function SuperAdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, all
  const [processingRequest, setProcessingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = filter === 'pending' 
        ? await superAdminRequestApi.getPendingRequests()
        : await superAdminRequestApi.getAllRequests();
      setRequests(response.data);
    } catch (err) {
      setError('Failed to load super admin requests');
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      await superAdminRequestApi.approveRequest(requestId);
      
      // Show success message and reload
      alert('Super admin request approved successfully!');
      loadRequests();
    } catch (err) {
      alert('Failed to approve request: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectClick = (request) => {
    setRequestToReject(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!requestToReject) return;
    
    try {
      setProcessingRequest(requestToReject.id);
      await superAdminRequestApi.rejectRequest(requestToReject.id, rejectionReason);
      
      // Show success message and reload
      alert('Super admin request rejected successfully!');
      setShowRejectModal(false);
      setRequestToReject(null);
      setRejectionReason('');
      loadRequests();
    } catch (err) {
      alert('Failed to reject request: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="status-icon pending" />;
      case 'APPROVED':
        return <CheckCircle className="status-icon approved" />;
      case 'REJECTED':
        return <XCircle className="status-icon rejected" />;
      default:
        return <AlertCircle className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="super-admin-requests">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading super admin requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-requests">
      <div className="page-header">
        <h1>Super Admin Requests</h1>
        <p>Manage requests from users who want to become super administrators</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Requests
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Requests
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <h3>No {filter === 'pending' ? 'pending ' : ''}requests found</h3>
          <p>
            {filter === 'pending' 
              ? 'There are no pending super admin requests at the moment.'
              : 'No super admin requests have been submitted yet.'
            }
          </p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className={`request-card ${getStatusClass(request.status)}`}>
              <div className="request-header">
                <div className="user-info">
                  <User size={20} />
                  <span className="user-name">{request.name}</span>
                </div>
                <div className={`status-badge ${getStatusClass(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </div>
              </div>

              <div className="request-details">
                <div className="detail-item">
                  <Mail size={16} />
                  <span>{request.email}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Requested: {formatDate(request.requestedAt)}</span>
                </div>
                {request.approvedAt && (
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>
                      {request.status === 'APPROVED' ? 'Approved' : 'Rejected'}: {formatDate(request.approvedAt)}
                    </span>
                  </div>
                )}
                {request.rejectionReason && (
                  <div className="detail-item rejection-reason">
                    <AlertCircle size={16} />
                    <span>Reason: {request.rejectionReason}</span>
                  </div>
                )}
              </div>

              {request.status === 'PENDING' && (
                <div className="request-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? (
                      <>
                        <div className="spinner-small"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleRejectClick(request)}
                    disabled={processingRequest === request.id}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reject Super Admin Request</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to reject the super admin request from{' '}
                <strong>{requestToReject?.name}</strong> ({requestToReject?.email})?
              </p>
              <div className="form-group">
                <label htmlFor="rejectionReason">Reason for rejection (optional):</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="reject-confirm-btn"
                onClick={handleRejectConfirm}
                disabled={processingRequest === requestToReject?.id}
              >
                {processingRequest === requestToReject?.id ? (
                  <>
                    <div className="spinner-small"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
