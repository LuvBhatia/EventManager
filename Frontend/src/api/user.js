import { httpClient } from './http';

export const userApi = {
  getAllUsers: async () => {
    try {
      const response = await httpClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserAnalytics: async () => {
    try {
      const response = await httpClient.get('/users/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await httpClient.get(`/users/by-role/${role}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      throw error;
    }
  },

  getUserCounts: async () => {
    try {
      const response = await httpClient.get('/users/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching user counts:', error);
      throw error;
    }
  }
};