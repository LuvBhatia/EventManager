import http from './http.js';

const ideaApi = {
  // Get all active ideas
  getAllIdeas: async () => {
    const response = await http.get('/api/ideas');
    return response.data;
  },

  // Get top ideas
  getTopIdeas: async () => {
    const response = await http.get('/api/ideas/top');
    return response.data;
  },

  // Get featured ideas
  getFeaturedIdeas: async () => {
    const response = await http.get('/api/ideas/featured');
    return response.data;
  },

  // Get ideas by problem
  getIdeasByProblem: async (problemId) => {
    const response = await http.get(`/api/ideas/problem/${problemId}`);
    return response.data;
  },

  // Get ideas by user
  getIdeasByUser: async (userId) => {
    const response = await http.get(`/api/ideas/user/${userId}`);
    return response.data;
  },

  // Get ideas by status
  getIdeasByStatus: async (status) => {
    const response = await http.get(`/api/ideas/status/${status}`);
    return response.data;
  },

  // Search ideas
  searchIdeas: async (query) => {
    const response = await http.get(`/api/ideas/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get idea by ID
  getIdeaById: async (id) => {
    const response = await http.get(`/api/ideas/${id}`);
    return response.data;
  },

  // Create idea
  createIdea: async (ideaData, problemId, userId) => {
    const response = await http.post(`/api/ideas?problemId=${problemId}&userId=${userId}`, ideaData);
    return response.data;
  },

  // Update idea
  updateIdea: async (id, ideaData, userId) => {
    const response = await http.put(`/api/ideas/${id}?userId=${userId}`, ideaData);
    return response.data;
  },

  // Update idea status
  updateIdeaStatus: async (id, status, userId) => {
    const response = await http.put(`/api/ideas/${id}/status?status=${status}&userId=${userId}`);
    return response.data;
  },

  // Delete idea
  deleteIdea: async (id, userId) => {
    const response = await http.delete(`/api/ideas/${id}?userId=${userId}`);
    return response.data;
  }
};

export { ideaApi };
