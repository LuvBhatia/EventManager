import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// Create axios instance with auth header
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_BASE}/api/super-admin-requests`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const superAdminRequestApi = {
  // Get all pending super admin requests
  getPendingRequests: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/pending');
  },

  // Get all super admin requests (approved, rejected, pending)
  getAllRequests: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/all');
  },

  // Approve a super admin request
  approveRequest: async (requestId) => {
    const api = createAuthenticatedRequest();
    return api.post(`/${requestId}/approve`);
  },

  // Reject a super admin request
  rejectRequest: async (requestId, reason = '') => {
    const api = createAuthenticatedRequest();
    return api.post(`/${requestId}/reject`, { reason });
  },

  // Get pending requests count
  getPendingRequestsCount: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/count');
  }
};
