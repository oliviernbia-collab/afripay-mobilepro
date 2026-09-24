# AfriPay Pro — Application Marchand

Application mobile Expo (React Native, JavaScript) pour les marchands AfriPay : encaissement instantané
par scan du QR de paiement présenté par le client (mock du paiement par reconnaissance de la paume de
main), gestion du portefeuille, transferts, historique et onboarding KYB.

## Lancer le projet

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer le backend (dans un autre terminal) :
   ```bash
   cd ../backend
   npm run dev
   ```
3. Vérifier `src/config/api.js` : par défaut l'app pointe vers `http://192.168.1.71:4000/api`
   (l'IP LAN de la machine de développement). Si votre PC a une IP différente sur le réseau Wi-Fi
   (trouvable avec `ipconfig`), modifiez `DEVICE_LAN_IP` dans ce fichier. Le fichier documente aussi
   les valeurs à utiliser pour un émulateur Android (`10.0.2.2`) ou un simulateur iOS (`localhost`).
   **Build de production** (EAS Build) : ces réglages ne s'appliquent qu'en développement — définissez
   `EXPO_PUBLIC_API_URL` (voir `.env.example`) avec une URL **https://**, sinon le démarrage échoue
   volontairement plutôt que de faire transiter PIN/mot de passe/tokens en clair sur le réseau.
4. Démarrer le serveur de développement Expo :
   ```bash
   npx expo start
   ```
5. Scanner le QR code affiché dans le terminal avec l'application **Expo Go** (Android/iOS), le
   téléphone devant être sur le **même réseau Wi-Fi** que le PC.

## Vérifications déjà effectuées

- `npx expo-doctor` : 21/21 checks passés.
- `npx expo export --platform android` : bundle complet (971 modules) sans erreur — valide que tous
  les écrans, imports et la navigation compilent correctement.
- Test de bout en bout contre le backend réel (voir résumé dans le rapport de livraison) : inscription
  marchand (OTP → register → login), upload de document KYC, validation KYB via le compte admin,
  récupération du portefeuille, et un encaissement complet (scan → `POST /marchand/encaisser` →
  reçu), y compris les cas d'erreur (KYB non validé, palmCode inconnu, solde insuffisant).

## Écrans construits

- **Splash** — logo AfriPay + slogan, redirige automatiquement vers Connexion ou Tableau de bord
  selon la présence d'un token stocké (`expo-secure-store`).
- **Connexion** — téléphone + mot de passe (`POST /auth/marchand/login`).
- **Inscription** — choix du type de compte (Entreprise / Particulier) → formulaire adapté
  (raison sociale, RCCM, NCC pour Entreprise) → vérification OTP (bannière "mode développement"
  affichant le `devCode` renvoyé par l'API) → définition du code PIN.
- **KYB (validation du compte)** — statut affiché en continu, liste des documents requis selon le
  type de marchand, envoi de documents (photo caméra ou galerie via `expo-image-picker`).
- **Tableau de bord** — carte de solde (`GET /wallets/me`, pull-to-refresh), badge de statut KYB,
  bannière de blocage si le compte n'est pas validé, trois actions principales (Encaisser,
  Transférer, Historique), aperçu des transactions récentes.
- **Encaisser** — saisie du montant (bloqué avec message explicite si KYB non validé) → écran
  caméra **"Scanner le paiement AfriPay"** (`expo-camera`, `CameraView` + scan QR natif) → appel de
  `POST /marchand/encaisser` avec état de chargement → reçu numérique (nom/prénom client, montant,
  référence, date/heure, coche verte) ou écran d'échec avec message clair et option de réessayer.
- **Transférer** — deux modes : vers Mobile Money externe (`POST /transferts/externe`) et vers un
  compte AfriPay (`POST /transferts/interne`), avec code PIN obligatoire à partir de 50 000 FCFA.
- **Historique** — liste des transactions avec filtres par type, sélecteur de période
  (aujourd'hui / cette semaine / ce mois) affichant les agrégats de `GET /wallets/me/stats`, détail
  de transaction au clic. Export CSV/PDF : **stub** ("Bientôt disponible") — génération réelle hors
  périmètre de cette passe.
- **Notifications** — liste, marquage lu / tout marquer lu.
- **Paramètres** — profil marchand, changement de code PIN, FAQ statique, déconnexion.

## Notes techniques

- Navigation avec `@react-navigation/native` + native-stack + bottom-tabs (pas d'Expo Router).
- Logo officiel (`assets/logo.png` à la racine du repo) redimensionné en plusieurs tailles
  dans `assets/brand/` et utilisé via `Image` dans `src/components/BrandHeader.js` (splash, connexion,
  en-tête du tableau de bord), ainsi que pour régénérer l'icône de l'app et le favicon.
- Jetons stockés avec `expo-secure-store` ; rafraîchissement automatique via `POST /auth/refresh`
  dans un intercepteur Axios (`src/api/client.js`).
- Palette et composants (`src/theme/colors.js`, `GradientButton`, `Card`, `StatusBadge`) suivent
  `DESIGN_TOKENS.md`.

## Limitations connues

- L'export CSV/PDF de l'historique est un bouton stub, non fonctionnel.
- "Changer mon code PIN" réutilise `POST /auth/marchand/pin` (l'API ne propose pas de vérification
  de l'ancien PIN avant modification).
- Le scan QR remplace la biométrie palmaire réelle, conformément à la section 4 du contrat d'API —
  l'UI ne présente jamais cela comme une vraie biométrie.
