import api from './client';

// Real palm biometric recognition session for the "Encaisser" scan screen — option 1 (see
// ScanScreen.js), QR-code scan stays option 2. Backend returns 503 until a real Tencent tenant is
// configured (see config/features.js).
export async function getRecognitionSession() {
  const { data } = await api.post('/biometrie/marchand/session-reconnaissance');
  return data.data; // { sessionId, token, userId, userName, phoneNo, appId, sdkHost, mode }
}
