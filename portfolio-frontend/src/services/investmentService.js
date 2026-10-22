import api from './api';
export const getInvestments = (params) => api.get('/investments', { params });
export const createInvestment = (data) => api.post('/investments', data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);