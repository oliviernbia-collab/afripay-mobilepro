import api from './client';

// Deux chemins d'identification du client (voir ScanScreen.js) : soit palmCode (option 2, QR),
// soit recognitionSessionId/recognitionUserId/recognitionScore (option 1, reconnaissance Tencent
// réelle) — les champs non pertinents pour le chemin utilisé restent undefined et ne sont pas
// envoyés (axios/JSON.stringify les omet).
export async function encaisser({
  montant,
  palmCode,
  clientPin,
  recognitionSessionId,
  recognitionUserId,
  recognitionScore,
}) {
  const { data } = await api.post('/marchand/encaisser', {
    montant,
    palmCode,
    clientPin,
    recognitionSessionId,
    recognitionUserId,
    recognitionScore,
  });
  return data.data; // { transaction, client: { nom }, reçu } — nom déjà anonymisé (initiales)
}
