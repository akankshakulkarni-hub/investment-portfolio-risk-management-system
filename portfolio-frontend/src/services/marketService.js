import api from './api';
export const getMarketData = (params) => api.get('/market-data', { params });
export const updateMarketData = (id, data) => api.put(`/market-data/${id}`, data);