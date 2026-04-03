import api from './api';

export const recordService = {
  
  getAll: (params = {}) => api.get('/records', { params }),

  
  getOne: (id) => api.get(`/records/${id}`),

  
  create: (data) => api.post('/records', data),

  
  update: (id, data) => api.put(`/records/${id}`, data),

  
  remove: (id) => api.delete(`/records/${id}`),
};
