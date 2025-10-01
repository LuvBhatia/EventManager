import { httpClient } from './http';

export const analyticsApi = {
  getDashboardAnalytics: async () => {
    try {
      const response = await httpClient.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  getSystemAnalytics: async () => {
    try {
      const response = await httpClient.get('/analytics/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }
};