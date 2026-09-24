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

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data; // { type, merchant }
}
