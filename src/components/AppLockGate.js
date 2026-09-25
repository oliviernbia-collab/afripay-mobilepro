import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { useTranslation } from 'react-i18next';
import BrandHeader from './BrandHeader';
import GradientButton from './GradientButton';
import Icon from './Icon';
import colors from '../theme/colors';
import { isBiometricLockEnabled, promptBiometricUnlock } from '../utils/biometricLock';

// Verrouille l'accès à la partie authentifiée de l'app derrière Face ID / empreinte quand l'option
// est activée dans Paramètres — au démarrage et à chaque retour au premier plan. Pendant du
// composant du même nom dans mobileclient ; ne s'enroule qu'autour du Stack.Navigator authentifié
// (voir RootNavigator), jamais autour de l'écran de connexion.
export default function AppLockGate({ children }) {
  const { t } = useTranslation();
  const [lockEnabled, setLockEnabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const appState = useRef(AppState.currentState);

  const checkLockSetting = useCallback(async () => {
    const enabled = await isBiometricLockEnabled();
    setLockEnabled(enabled);
    if (!enabled) setUnlocked(true);
    return enabled;
  }, []);

  const attemptUnlock = useCallback(async () => {
    setError('');
    try {
      const ok = await promptBiometricUnlock();
      if (ok) setUnlocked(true);
      else setError(t('appLockGate.authCancelled'));
    } catch {
      setError(t('appLockGate.authUnavailable'));
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      const enabled = await checkLockSetting();
      setChecking(false);
      if (enabled) attemptUnlock();
    })();
  }, [checkLockSetting, attemptUnlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active' && lockEnabled) {
        setUnlocked(false);
        attemptUnlock();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lockEnabled, attemptUnlock]);

  if (checking) return null;
  if (unlocked) return children;

  return (
    <View style={styles.container}>
      <BrandHeader size="main" />
      <Icon name="lock" size={28} color={colors.textSecondary} style={{ marginTop: 30, marginBottom: 12 }} />
      <Text style={styles.title}>{t('appLockGate.title')}</Text>
      <Text style={styles.subtitle}>{t('appLockGate.subtitle')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <GradientButton title={t('appLockGate.unlock')} onPress={attemptUnlock} style={{ marginTop: 20, width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' },
  error: { color: colors.error, fontSize: 12, marginTop: 12, textAlign: 'center' },
});
