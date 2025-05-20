// src/services/predictionsService.ts
import api from '../utils/api';

export const predictionsService = {
  // Get top selling products predictions for all horizons
  async getTopProducts(limit = 10, category = null, refresh = false) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (category) params.append('category', category);
      if (refresh) params.append('refresh', refresh.toString());
      
      // Use the exact route as shown in the curl example
      const response = await api.get(`/api/predictions/top-products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products predictions:', error);
      throw error;
    }
  },

  // Get prediction system diagnostics
  async getDiagnostics() {
    try {
      // Use the exact route pattern with /api prefix
      const response = await api.get('/api/predictions/diagnostics');
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction diagnostics:', error);
      throw error;
    }
  }
};