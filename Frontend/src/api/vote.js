import http from './http.js';

const voteApi = {
  // Vote on an idea
  voteOnIdea: async (ideaId, userId, voteType) => {
    const response = await http.post(`/api/votes/idea/${ideaId}?userId=${userId}&voteType=${voteType}`);
    return response.data;
  },

  // Get vote statistics for an idea
  getVoteStats: async (ideaId) => {
    const response = await http.get(`/api/votes/idea/${ideaId}/stats`);
    return response.data;
  },

  // Get user's vote on an idea
  getUserVote: async (ideaId, userId) => {
    const response = await http.get(`/api/votes/idea/${ideaId}/user/${userId}`);
    return response.data;
  },

  // Remove user's vote on an idea
  removeVote: async (ideaId, userId) => {
    const response = await http.delete(`/api/votes/idea/${ideaId}/user/${userId}`);
    return response.data;
  }
};

export { voteApi };
