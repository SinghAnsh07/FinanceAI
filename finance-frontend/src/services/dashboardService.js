import api from './api';

export const dashboardService = {
  
  getSummary: () => api.get('/dashboard/summary'),

  
  getTrends: (period = 'monthly') => api.get(`/dashboard/trends?period=${period}`),

  
  getCategorySummary: () => api.get('/dashboard/category-summary'),
};
