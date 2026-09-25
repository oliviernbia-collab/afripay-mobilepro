import api from './client';

export const MERCHANT_DOC_TYPES = [
  'cni',
  'passeport',
  'carte_sejour',
  'selfie',
  'rccm',
  'ncc',
  'justificatif_domicile',
  'justificatif_activite',
];

export async function uploadMerchantDocument({ uri, typeDocument, fileName, mimeType }) {
  const form = new FormData();
  form.append('typeDocument', typeDocument);
  form.append('document', {
    uri,
    name: fileName || `${typeDocument}.jpg`,
    type: mimeType || 'image/jpeg',
  });

  // Do not set Content-Type manually: React Native's networking layer needs to
  // generate the multipart boundary itself from the FormData body. Forcing the
  // header here would strip the boundary and break the server-side multer parser.
  const { data } = await api.post('/kyc/marchand/documents', form);
  return data.data; // { id, fichierRef }
}

export async function getMyMerchantDocuments() {
  const { data } = await api.get('/kyc/marchand/documents');
  return data.data;
}

function mimeFromUri(uri) {
  const filename = uri.split('/').pop() || '';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  return ext === 'png' ? 'image/png' : 'image/jpeg';
}

export async function uploadMyLogo(uri) {
  const form = new FormData();
  form.append('logo', {
    uri,
    name: `logo.${uri.split('.').pop() || 'jpg'}`,
    type: mimeFromUri(uri),
  });

  // Do not set Content-Type manually: React Native's networking layer needs to
  // generate the multipart boundary itself from the FormData body.
  const { data } = await api.post('/kyc/marchand/logo', form);
  return data.data; // marchand à jour (avec logo_url)
}

export async function removeMyLogo() {
  const { data } = await api.delete('/kyc/marchand/logo');
  return data.data;
}
