import axios from 'axios';

// Set the base URL for the local FastAPI server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * GET /
   * Check API health status and loaded model configurations.
   */
  async getHealth() {
    try {
      const response = await client.get('/health');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * POST /crop-recommendation
   * Recommends optimal crops based on soil nutrients and weather inputs.
   */
  async recommendCrop(payload) {
    try {
      const response = await client.post('/crop-recommendation', payload);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * POST /yield-prediction
   * Forecasts expected crop yields (tons/ha) based on crop and location metrics.
   */
  async predictYield(payload) {
    try {
      const response = await client.post('/yield-prediction', payload);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * POST /smart-predict
   * Executes combined crop recommendation and yield prediction pipeline.
   */
  async predictCombined(payload) {
    try {
      const response = await client.post('/smart-predict', payload);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * Standard error extractor to format Axios errors consistently.
   */
  _handleError(error) {
    if (error.response) {
      // Server returned a status code outside the 2xx range
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 422 && data.errors) {
        // Validation errors
        const validationMsgs = data.errors.map(err => `${err.field}: ${err.error}`).join(' | ');
        throw new Error(`Validation Error: ${validationMsgs}`);
      }
      
      const message = data.detail || data.message || 'Server error occurred.';
      throw new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('API server is unreachable. Please verify the backend is running on port 8000.');
    } else {
      // Something happened in setting up the request
      throw new Error(error.message);
    }
  }
};
