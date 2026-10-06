import { io } from 'socket.io-client';
import { SERVER_ORIGIN } from '../config/api';
import { getAccessToken } from '../api/client';

/**
 * Instance Socket.IO UNIQUE pour toute la durée de vie de l'app (autoConnect: false — voir
 * connectRealtime ci-dessous). Les écrans peuvent s'abonner (`socket.on(...)`) dès leur montage,
 * avant même que la connexion ne soit établie : socket.io-client ne perd aucun écouteur enregistré
 * tôt, il attend juste que `connect()` aboutisse — pas besoin d'un Context React pour distribuer
 * l'instance, `import { socket } from '../realtime/socket'` suffit partout.
 *
 * Remplace le seul moyen qu'avait l'app de savoir qu'un webhook Jèko venait de confirmer un
 * retrait : revenir sur l'écran (useFocusEffect) ou tirer pour rafraîchir. Voir
 * backend/src/realtime/socket.js pour le pendant serveur (mêmes noms d'événements) et
 * mobileclient/src/realtime/socket.js pour l'équivalent côté Client.
 */
export const socket = io(SERVER_ORIGIN, {
  autoConnect: false,
  transports: ['websocket'],
  // Fonction plutôt qu'un objet statique : rappelée à CHAQUE tentative de connexion, y compris les
  // reconnexions automatiques après une coupure réseau — donc toujours le jeton d'accès COURANT,
  // même s'il a été rafraîchi entre-temps. Un objet figé au premier connect() ferait silencieusement
  // échouer toute reconnexion après l'expiration de ce jeton initial (15 min).
  auth: (cb) => {
    getAccessToken().then((token) => cb({ token }));
  },
});

export function connectRealtime() {
  if (!socket.connected) socket.connect();
}

export function disconnectRealtime() {
  socket.disconnect();
}
