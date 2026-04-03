import api from './api';

export const userService = {
  
  getAll: (params = {}) => api.get('/users', { params }),

  
  getOne: (id) => api.get(`/users/${id}`),

  
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),

  
  remove: (id) => api.delete(`/users/${id}`),
};
