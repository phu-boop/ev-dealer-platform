import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:8500/api/ai';

/**
 * Service để gọi AI Service APIs
 */
class AIForecastService {
  
  /**
   * Generate forecast
   */
  async generateForecast(request) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/forecast/generate`, request);
      return response.data;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  /**
   * Get forecast by region
   */
  async getForecastByRegion(region, startDate, endDate) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/forecast/region/${region}`,
        {
          params: { startDate, endDate }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting forecast by region:', error);
      throw error;
    }
  }

  /**
   * Get forecast by dealer
   */
  async getForecastByDealer(dealerId, startDate, endDate) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/forecast/dealer/${dealerId}`,
        {
          params: { startDate, endDate }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting forecast by dealer:', error);
      throw error;
    }
  }

  /**
   * Quick forecast for variant
   */
  async quickForecast(variantId, daysToForecast = 30, method = 'AUTO') {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/forecast/variant/${variantId}`,
        {
          params: { daysToForecast, method }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in quick forecast:', error);
      throw error;
    }
  }

  /**
   * Generate production plan
   */
  async generateProductionPlan(planMonth) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/production-plan/generate`,
        null,
        {
          params: { planMonth }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating production plan:', error);
      throw error;
    }
  }

  /**
   * Get production plans
   */
  async getProductionPlans(month) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/production-plan`,
        {
          params: { month }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting production plans:', error);
      throw error;
    }
  }

  /**
   * Approve production plan
   */
  async approveProductionPlan(planId) {
    try {
      const response = await axios.put(
        `${AI_SERVICE_URL}/production-plan/${planId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error('Error approving production plan:', error);
      throw error;
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboard(daysBack = 30) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/analytics/dashboard`,
        {
          params: { daysBack }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard:', error);
      throw error;
    }
  }
}

export default new AIForecastService();
