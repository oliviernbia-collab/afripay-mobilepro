import api from './client';

export const MOBILE_MONEY_OPERATORS = [
  { value: 'wave', label: 'Wave' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'mtn_money', label: 'MTN Money' },
];

export async function transferInterne({ telephoneDestinataire, montant, libelle, pin }) {
  const { data } = await api.post('/transferts/interne', {
    telephoneDestinataire,
    montant,
    libelle,
    pin,
  });
  return data.data; // { transaction }
}

export async function transferExterne({ operateurDestination, numeroDestinataire, montant, pin }) {
  const { data } = await api.post('/transferts/externe', {
    'opérateurDestination': operateurDestination,
    'numéroDestinataire': numeroDestinataire,
    montant,
    pin,
  });
  return data.data; // { transaction, wallet }
}
