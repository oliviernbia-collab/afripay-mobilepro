import api from './client';

export async function encaisser({ montant, palmCode }) {
  const { data } = await api.post('/marchand/encaisser', { montant, palmCode });
  return data.data; // { transaction, client: { nom, prenom }, reçu }
}
