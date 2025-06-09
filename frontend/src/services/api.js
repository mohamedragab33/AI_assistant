import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const tradingAPI = {
  // Health and status
  getHealth: () => api.get('/health'),
  getCurrentPrice: () => api.get('/api/current-price'),
  
  // Trading signals
  generateManualSignal: (timeframe = '15m') => 
    api.post('/api/new-trade', { timeframe }),
  getTradeHistory: () => api.get('/api/trade-history'),
  
  // Auto-trading
  getAutoTradingStatus: () => api.get('/api/auto-trading/status'),
  startAutoTrading: () => api.post('/api/auto-trading/start'),
  stopAutoTrading: () => api.post('/api/auto-trading/stop'),
  configureAutoTrading: (config) => api.post('/api/auto-trading/configure', config),
  
  // AI Training
  getAITrainingData: () => api.get('/api/ai-training-data'),
  simulateAIResult: (data) => api.post('/api/simulate-ai-result', data),
  
  // MongoDB
  getMongoDBConfig: () => api.get('/api/mongodb/config'),
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 