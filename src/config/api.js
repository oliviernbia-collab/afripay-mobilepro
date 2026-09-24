// AfriPay Pro — API base URL configuration
//
// Choose the value that matches how you're running the app and edit
// DEVICE_LAN_IP below if your machine's LAN IP is different from the
// default used during development.
//
//  - Physical device via Expo Go (default, most common): use your computer's
//    LAN IP so the phone (on the same Wi-Fi) can reach the backend, e.g.
//    "http://192.168.1.71:4000/api". Find your IP with `ipconfig` (Windows).
//  - Android emulator: the emulator maps the host machine to 10.0.2.2, so use
//    "http://10.0.2.2:4000/api".
//  - iOS simulator: the simulator shares the host's network stack, so
//    "http://localhost:4000/api" works.

const DEVICE_LAN_IP = '192.168.1.71';

const HOSTS = {
  device: `http://${DEVICE_LAN_IP}:4000/api`,
  androidEmulator: 'http://10.0.2.2:4000/api',
  iosSimulator: 'http://localhost:4000/api',
};

// En build de production (__DEV__ === false), l'URL de l'API doit venir de EXPO_PUBLIC_API_URL
// (définie au build, ex. via eas.json) et être en HTTPS — jamais l'IP locale de développement en
// clair, qui exposerait PIN, mot de passe et tokens sur le réseau (Wi-Fi public/partagé, marché,
// boutique). Le démarrage échoue volontairement si ce n'est pas configuré, plutôt que de se
// rabattre silencieusement sur du HTTP.
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!__DEV__ && (!PROD_API_URL || !PROD_API_URL.startsWith('https://'))) {
  throw new Error(
    'EXPO_PUBLIC_API_URL doit être défini avec une URL https:// pour un build de production (voir src/config/api.js).'
  );
}

// Default target — change this line if you're on an emulator/simulator instead of a physical
// device (uniquement en développement : __DEV__ est toujours vrai dans Expo Go / dev client).
export const API_BASE_URL = __DEV__ ? HOSTS.device : `${PROD_API_URL.replace(/\/$/, '')}/api`;

// Used to build absolute URLs for legacy files served under /uploads/<file>
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// Photos / documents (KYB, etc.) are stored on Cloudinary and come back as
// absolute https:// URLs. Older records may still hold a relative
// "/uploads/<file>" path, so only prefix with SERVER_ORIGIN when the value
// isn't already absolute.
export function resolveMediaUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `${SERVER_ORIGIN}${url}`;
}

export default API_BASE_URL;
