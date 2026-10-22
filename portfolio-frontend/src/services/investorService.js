import api from './api';
export const getInvestors = (params) => api.get('/investors', { params });
export const createInvestor = (data) => api.post('/investors', data);
export const updateInvestor = (id, data) => api.put(`/investors/${id}`, data);
export const deleteInvestor = (id) => api.delete(`/investors/${id}`);