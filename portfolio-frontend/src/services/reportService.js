import api from './api';

export const exportTransactionsCSV = async () => {
  const res = await api.get('/reports/transactions', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPortfolioPDF = async (portfolioId) => {
  const res = await api.get(`/reports/portfolio/${portfolioId}`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio_${portfolioId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};