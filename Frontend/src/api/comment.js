import http from './http.js';

const commentApi = {
  // Get comments for an idea
  getCommentsByIdea: async (ideaId) => {
    const response = await http.get(`/api/comments/idea/${ideaId}`);
    return response.data;
  },

  // Get comments by user
  getCommentsByUser: async (userId) => {
    const response = await http.get(`/api/comments/user/${userId}`);
    return response.data;
  },

  // Get replies to a comment
  getRepliesToComment: async (parentCommentId) => {
    const response = await http.get(`/api/comments/reply/${parentCommentId}`);
    return response.data;
  },

  // Get comment by ID
  getCommentById: async (id) => {
    const response = await http.get(`/api/comments/${id}`);
    return response.data;
  },

  // Create comment
  createComment: async (commentData, ideaId, userId, parentCommentId = null) => {
    const params = new URLSearchParams({
      ideaId: ideaId,
      userId: userId
    });
    
    if (parentCommentId) {
      params.append('parentCommentId', parentCommentId);
    }
    
    const response = await http.post(`/api/comments?${params}`, commentData);
    return response.data;
  },

  // Update comment
  updateComment: async (id, commentData, userId) => {
    const response = await http.put(`/api/comments/${id}?userId=${userId}`, commentData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (id, userId) => {
    const response = await http.delete(`/api/comments/${id}?userId=${userId}`);
    return response.data;
  }
};

export { commentApi };
