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
