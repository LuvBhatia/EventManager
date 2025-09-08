import http from './http.js';

const problemApi = {
  // Get all active problems
  getAllProblems: async () => {
    const response = await http.get('/problems');
    return response.data;
  },

  // Get trending problems
  getTrendingProblems: async () => {
    const response = await http.get('/problems/trending');
    return response.data;
  },

  // Get problems by club
  getProblemsByClub: async (clubId) => {
    const response = await http.get(`/problems/club/${clubId}`);
    return response.data;
  },

  // Get problems by category
  getProblemsByCategory: async (category) => {
    const response = await http.get(`/problems/category/${category}`);
    return response.data;
  },

  // Search problems
  searchProblems: async (query) => {
    const response = await http.get(`/problems/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get problem by ID
  getProblemById: async (id) => {
    const response = await http.get(`/problems/${id}`);
    return response.data;
  },

  // Create problem (requires authentication)
  createProblem: async (problemData, clubId, userId) => {
    const response = await http.post(`/problems?clubId=${clubId}&userId=${userId}`, problemData);
    return response.data;
  },

  // Update problem
  updateProblem: async (id, problemData, userId) => {
    const response = await http.put(`/problems/${id}?userId=${userId}`, problemData);
    return response.data;
  },

  // Delete problem
  deleteProblem: async (id, userId) => {
    const response = await http.delete(`/problems/${id}?userId=${userId}`);
    return response.data;
  }
};

export { problemApi };
