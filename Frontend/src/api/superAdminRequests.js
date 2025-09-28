import http from './http';

// Create authenticated request function
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return http.create({
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
};

export const superAdminRequestApi = {
  // Get all pending super admin requests
  getPendingRequests: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/super-admin-requests/pending');
  },

  // Get all super admin requests (approved, rejected, pending)
  getAllRequests: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/super-admin-requests/all');
  },

  // Approve a super admin request
  approveRequest: async (requestId) => {
    const api = createAuthenticatedRequest();
    return api.post(`/super-admin-requests/${requestId}/approve`);
  },

  // Reject a super admin request
  rejectRequest: async (requestId, reason = '') => {
    const api = createAuthenticatedRequest();
    return api.post(`/super-admin-requests/${requestId}/reject`, { reason });
  },

  // Get pending requests count
  getPendingRequestsCount: async () => {
    const api = createAuthenticatedRequest();
    return api.get('/super-admin-requests/count');
  }
};
