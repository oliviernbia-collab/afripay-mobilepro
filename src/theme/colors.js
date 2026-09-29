// AfriPay Pro — Design tokens (see DESIGN_TOKENS.md)

export const colors = {
  background: '#000000',
  backgroundAlt: '#0B0B0F',
  card: '#15151C',
  border: '#2A2A33',
  text: '#FFFFFF',
  textSecondary: '#B9B9C2',
  textMuted: '#7A7A85',

  magenta: '#E6007E',
  red: '#E30613',
  orange: '#F7941D',
  gold: '#FFC20E',
  green: '#39B54A',
  turquoise: '#00A99D',
  blue: '#27AAE1',
  violet: '#92278F',

  success: '#39B54A',
  warning: '#FFC20E',
  error: '#E30613',
};

export const gradients = {
  brand: [colors.magenta, colors.orange, colors.gold, colors.green, colors.turquoise, colors.blue],
  brandShort: [colors.magenta, colors.orange, colors.gold],
  cta: [colors.magenta, colors.orange],
  balance: [colors.turquoise, colors.blue],
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Label helpers take the i18next `t` function so every backend enum value renders in the app's
// current language (see src/i18n) — callers get `t` from `useTranslation()`. Miroir des helpers
// équivalents dans mobileclient/src/theme/colors.js.
export const txTypeLabel = (type, t) => t(`txType.${type}`, { defaultValue: type || '—' });

export const txMethodLabel = (m, t) => t(`txMethod.${m}`, { defaultValue: m || '—' });

export const statutLabel = (statut, t) => t(`status.tx.${statut}`, { defaultValue: statut || '—' });

export const kybStatusLabel = (statut, t) => t(`status.kyb.${statut}`, { defaultValue: statut || '—' });

export const providerLabel = (key, t) => t(`providers.${key}`, { defaultValue: key });

// Reconstruit le titre affiché ENTIÈREMENT côté client, dans la langue active à l'instant du
// rendu, à partir de champs structurés toujours frais (tx.type, tx.contrepartie — résolus à
// chaque lecture serveur, jamais figés) — jamais depuis `tx.libelle`, qui est un texte déjà
// traduit au moment de la création de la transaction et resterait donc coincé dans l'ancienne
// langue si l'utilisateur bascule ensuite (voir backend/src/services/transactionService.js).
export const txDisplayTitle = (tx, credit, t) => {
  if (tx.type === 'transfert') {
    if (tx.contrepartie?.externe) {
      const provider = providerLabel(tx.contrepartie.fournisseur, t);
      const name = tx.contrepartie.telephone ? `${provider} (${tx.contrepartie.telephone})` : provider;
      return t(credit ? 'historique.receivedFrom' : 'historique.sentTo', { name });
    }
    const name = tx.contrepartie?.nom || tx.contrepartie?.telephone;
    if (name) return t(credit ? 'historique.receivedFrom' : 'historique.sentTo', { name });
    return t(credit ? 'historique.transferReceived' : 'historique.transferSent');
  }
  // Côté Marchand, un 'achat' est un encaissement REÇU d'un client (jamais un achat que le
  // marchand ferait lui-même) — phrasé différemment de mobileclient, qui voit la même transaction
  // depuis le point de vue du client qui paie.
  if (tx.type === 'achat' && tx.contrepartie?.nom) {
    return t('historique.paymentFrom', { name: tx.contrepartie.nom });
  }
  if (tx.type === 'recharge' && tx.contrepartie?.fournisseur) {
    return t('historique.rechargeVia', { provider: providerLabel(tx.contrepartie.fournisseur, t) });
  }
  return txTypeLabel(tx.type, t);
};

// Retraduit une notification dans la langue active à l'instant du rendu (voir txDisplayTitle
// ci-dessus pour le même principe côté transactions) — repli sur `titre`/`contenu` bruts si
// aucune clé n'est fournie (notifications antérieures à cet ajout, ou messages diffusés librement
// par un admin, jamais gabarisés par nature). Voir backend/src/services/notificationService.js.
export const notificationText = (item, t) => {
  // Champs bruts renvoyés par l'API en snake_case (comme wallet_destination_id, date_heure...),
  // jamais camelCasés — voir database/schema.sql / notificationService.js.
  const titreCle = item.titre_cle;
  const contenuCle = item.contenu_cle;
  if (!titreCle || !contenuCle) {
    return { titre: item.titre, contenu: item.contenu };
  }
  let params = item.params || {};
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params);
    } catch {
      params = {};
    }
  }
  // `decision` (statut KYB brut, ex. 'rejeté') n'est jamais pré-traduit côté serveur — on le
  // retraduit ici avant interpolation.
  const resolvedParams = params.decision ? { ...params, decision: kybStatusLabel(params.decision, t) } : params;
  return {
    titre: t(titreCle),
    contenu: t(contenuCle, resolvedParams).trim(),
  };
};

export default colors;
