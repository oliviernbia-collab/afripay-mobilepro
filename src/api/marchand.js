import api from './client';

// Deux chemins d'identification du client (voir ScanScreen.js) :
//  - palmCode (option 2, repli QR) : envoyé en JSON.
//  - photoUri (option 1, reconnaissance de paume réelle et locale — voir
//    backend/src/services/palmVisionService.js) : la photo capturée est envoyée en multipart, le
//    backend fait l'extraction + la comparaison 1:N dans la même requête qui débite/crédite.
export async function encaisser({ montant, palmCode, clientPin, photoUri }) {
  if (photoUri) {
    const form = new FormData();
    form.append('montant', String(montant));
    if (clientPin) form.append('clientPin', clientPin);
    form.append('photo', {
      uri: photoUri,
      name: `paume.${photoUri.split('.').pop() || 'jpg'}`,
      type: 'image/jpeg',
    });
    // Ne pas fixer Content-Type manuellement : la couche réseau React Native doit générer
    // elle-même la frontière ("boundary") multipart à partir du corps FormData.
    const { data } = await api.post('/marchand/encaisser', form);
    return data.data;
  }

  const { data } = await api.post('/marchand/encaisser', { montant, palmCode, clientPin });
  return data.data; // { transaction, client: { nom }, reçu } — nom déjà anonymisé (initiales)
}
