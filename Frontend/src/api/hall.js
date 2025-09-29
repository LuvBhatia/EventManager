import { httpClient } from './http';

export const hallApi = {
  // Get all active halls
  getAllHalls: async () => {
    try {
      const response = await httpClient.get('/halls');
      return response.data;
    } catch (error) {
      console.error('Error fetching halls:', error);
      throw error;
    }
  },

  // Get hall by ID
  getHallById: async (id) => {
    try {
      const response = await httpClient.get(`/halls/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hall:', error);
      throw error;
    }
  },

  // Get available halls for given parameters
  getAvailableHalls: async (participants, startTime, endTime, excludeEventId = null) => {
    try {
      const params = {
        participants,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      if (excludeEventId) {
        params.excludeEventId = excludeEventId;
      }

      const response = await httpClient.get('/halls/available', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching available halls:', error);
      throw error;
    }
  },

  // Get best fit hall for given parameters
  getBestFitHall: async (participants, startTime, endTime) => {
    try {
      const params = {
        participants,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };

      const response = await httpClient.get('/halls/best-fit', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching best fit hall:', error);
      throw error;
    }
  },

  // Create new hall
  createHall: async (hallData) => {
    try {
      const response = await httpClient.post('/halls', hallData);
      return response.data;
    } catch (error) {
      console.error('Error creating hall:', error);
      throw error;
    }
  },

  // Update existing hall
  updateHall: async (id, hallData) => {
    try {
      const response = await httpClient.put(`/halls/${id}`, hallData);
      return response.data;
    } catch (error) {
      console.error('Error updating hall:', error);
      throw error;
    }
  },

  // Delete hall (soft delete)
  deleteHall: async (id) => {
    try {
      const response = await httpClient.delete(`/halls/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hall:', error);
      throw error;
    }
  }
};
