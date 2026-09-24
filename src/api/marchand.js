import api from './client';

export async function encaisser({ montant, palmCode, clientPin }) {
  const { data } = await api.post('/marchand/encaisser', { montant, palmCode, clientPin });
  return data.data; // { transaction, client: { nom }, reçu } — nom déjà anonymisé (initiales)
}
