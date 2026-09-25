import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import i18n from '../i18n';

// Verrouillage biométrique de l'app (Face ID / empreinte à l'ouverture) — jusqu'ici présent
// uniquement côté app Client (mobileclient), absent ici alors qu'un terminal marchand déverrouillé
// et laissé sans surveillance donne un accès immédiat à l'encaissement/aux virements. Même
// mécanisme que mobileclient/src/utils/biometricLock.js : préférence stockée en SecureStore
// puisqu'elle conditionne l'accès au compte.
const LOCK_ENABLED_KEY = 'afripay_pro_biometric_lock_enabled';

export async function isBiometricLockEnabled() {
  const value = await SecureStore.getItemAsync(LOCK_ENABLED_KEY);
  return value === 'true';
}

export async function setBiometricLockEnabled(enabled) {
  if (enabled) {
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY, 'true');
  } else {
    await SecureStore.deleteItemAsync(LOCK_ENABLED_KEY);
  }
}

export async function getBiometricCapability() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { available: hasHardware && isEnrolled, types };
}

export async function promptBiometricUnlock() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: i18n.t('appLockGate.promptMessage'),
    cancelLabel: i18n.t('appLockGate.promptCancelLabel'),
    disableDeviceFallback: false, // autorise le code de l'appareil en secours
  });
  return result.success;
}
