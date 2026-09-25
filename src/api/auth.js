import api from './client';

export async function requestMerchantOtp(telephone) {
  const { data } = await api.post('/auth/marchand/otp', { telephone });
  return data.data; // { sent, devCode? }
}

export async function registerMerchant(payload) {
  const { data } = await api.post('/auth/marchand/register', payload);
  return data.data; // { merchant, accessToken, refreshToken }
}

export async function loginMerchant({ telephone, motDePasse }) {
  const { data } = await api.post('/auth/marchand/login', { telephone, motDePasse });
  return data.data; // { merchant, accessToken, refreshToken }
}

export async function setMerchantPin(pin, pinActuel) {
  const { data } = await api.post('/auth/marchand/pin', { pin, pinActuel });
  return data.data; // { updated }
}

// Code PIN ou mot de passe oubliés — non authentifié (utilisable même sans session valide).
export async function requestMerchantResetOtp(telephone, type) {
  const { data } = await api.post('/auth/marchand/otp-reset', { telephone, type });
  return data.data; // { sent, devCode? }
}

export async function resetMerchantPin(telephone, otp, pin) {
  const { data } = await api.post('/auth/marchand/reset-pin', { telephone, otp, pin });
  return data.data; // { updated }
}

export async function resetMerchantPassword(telephone, otp, motDePasse) {
  const { data } = await api.post('/auth/marchand/reset-password', { telephone, otp, motDePasse });
  return data.data; // { updated }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data; // { type, merchant }
}
