import api from './api';
export const getPortfolios = (params) => api.get('/portfolios', { params });
export const getPortfolio = (id) => api.get(`/portfolios/${id}`);
export const createPortfolio = (data) => api.post('/portfolios', data);
export const updatePortfolio = (id, data) => api.put(`/portfolios/${id}`, data);
export const deletePortfolio = (id) => api.delete(`/portfolios/${id}`);