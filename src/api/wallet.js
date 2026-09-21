import api from './client';

export async function getMyWallet() {
  const { data } = await api.get('/wallets/me');
  return data.data;
}

export async function getMyHistory(params = {}) {
  const { data } = await api.get('/wallets/me/historique', { params });
  return data.data;
}

export async function getMyStats(period = 'jour') {
  const { data } = await api.get('/wallets/me/stats', { params: { period } });
  return data.data;
}
