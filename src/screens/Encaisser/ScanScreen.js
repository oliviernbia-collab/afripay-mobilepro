import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { gradients } from '../../theme/colors';
import GradientButton from '../../components/GradientButton';
import PinDots from '../../components/PinDots';
import PinKeypad from '../../components/PinKeypad';
import { formatFcfa } from '../../utils/format';
import { encaisser } from '../../api/marchand';
import { extractErrorMessage } from '../../api/client';

const PIN_LENGTH = 4;

function ModeToggle({ mode, onChange }) {
  const { t } = useTranslation();
  return (
    <View style={styles.modeToggle}>
      <Pressable style={[styles.modeTab, mode === 'recognition' && styles.modeTabActive]} onPress={() => onChange('recognition')}>
        <Icon name="hand" size={13} color={mode === 'recognition' ? colors.text : colors.textMuted} />
        <Text style={[styles.modeTabText, mode === 'recognition' && styles.modeTabTextActive]}>
          {t('encaisser.scan.modePalm')}
        </Text>
      </Pressable>
      <Pressable style={[styles.modeTab, mode === 'qr' && styles.modeTabActive]} onPress={() => onChange('qr')}>
        <Icon name="qrcode" size={13} color={mode === 'qr' ? colors.text : colors.textMuted} />
        <Text style={[styles.modeTabText, mode === 'qr' && styles.modeTabTextActive]}>{t('encaisser.scan.modeQr')}</Text>
      </Pressable>
    </View>
  );
}

// Deux méthodes d'identification du client (cahier des charges 4.2/6.3) :
//  - 'recognition' (option 1, par défaut) : le marchand photographie directement la paume du
//    client (caméra native) ; le backend extrait le gabarit et le compare 1:N localement (voir
//    backend/src/services/palmVisionService.js) — pas d'API biométrique externe, pas d'action
//    requise sur le téléphone du client.
//  - 'qr' (option 2, repli) : le client affiche un QR sur son écran "Payer", le marchand le
//    scanne — utile si la caméra/l'éclairage posent problème côté reconnaissance.
export default function ScanScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { montant } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('recognition');
  const [recognitionError, setRecognitionError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  // Au-delà d'un certain montant, le backend exige une confirmation par PIN CLIENT (cahier des
  // charges 4.3 pt.12) — comme un code PIN saisi sur un TPE physique. Plutôt que de dupliquer ce
  // seuil ici, on tente d'abord sans PIN et on ne bascule sur ce clavier que si le serveur le
  // demande explicitement (réponse 400 "Code PIN requis...") : le seuil reste une seule source de
  // vérité, côté backend.
  const [needsClientPin, setNeedsClientPin] = useState(false);
  const [clientPin, setClientPin] = useState('');
  const [pinError, setPinError] = useState('');
  const scannedRef = useRef(false);
  const identificationRef = useRef(null);

  // Reset the scan lock whenever this screen regains focus (e.g. after "Réessayer").
  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      setScanning(true);
      setProcessing(false);
      setNeedsClientPin(false);
      setClientPin('');
      setPinError('');
      setRecognitionError('');
      setMode('recognition');
    }, [])
  );

  const handleModeChange = (m) => setMode(m);

  const attemptEncaisser = async (identification, pin) => {
    setProcessing(true);
    try {
      const result = await encaisser({ montant, clientPin: pin, ...identification });
      navigation.replace('EncaisserReceipt', { success: true, montant, result });
    } catch (e) {
      const status = e?.response?.status;
      const message = extractErrorMessage(e, t('encaisser.scan.paymentFailed'));
      if (status === 400 && !pin && /code pin/i.test(message)) {
        // Le serveur demande une confirmation PIN pour ce montant : on garde l'identification déjà
        // établie et on bascule sur le clavier PIN plutôt que de recommencer l'identification.
        identificationRef.current = identification;
        setNeedsClientPin(true);
        setProcessing(false);
        return;
      }
      if (pin) {
        // PIN client incorrect (ou verrouillage anti brute-force) : on reste sur le clavier PIN
        // pour laisser une nouvelle tentative, plutôt que de renvoyer au scan.
        setPinError(message);
        setClientPin('');
        setProcessing(false);
        return;
      }
      if (identification.photoUri) {
        // Échec de la reconnaissance (aucune main détectée, score insuffisant...) : on reste sur
        // l'écran de capture pour permettre un nouvel essai plutôt que d'aller au reçu d'échec.
        setRecognitionError(message);
        setProcessing(false);
        return;
      }
      navigation.replace('EncaisserReceipt', { success: false, montant, errorMessage: message });
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scannedRef.current || processing) return;
    scannedRef.current = true;
    setScanning(false);
    attemptEncaisser({ palmCode: data }, undefined);
  };

  const captureAndRecognize = useCallback(async () => {
    if (processing) return;
    setRecognitionError('');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setRecognitionError(t('encaisser.scan.cameraPermissionDenied'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    attemptEncaisser({ photoUri: result.assets[0].uri }, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing, montant]);

  const onPinDigit = (d) => {
    if (processing || clientPin.length >= PIN_LENGTH) return;
    setPinError('');
    const next = clientPin + d;
    setClientPin(next);
    if (next.length === PIN_LENGTH) {
      attemptEncaisser(identificationRef.current, next);
    }
  };

  const onPinBackspace = () => {
    if (processing) return;
    setClientPin((p) => p.slice(0, -1));
  };

  if (needsClientPin) {
    return (
      <View style={styles.container}>
        <View style={styles.amountBar}>
          <Text style={styles.amountLabel}>{t('encaisser.scan.amountLabel')}</Text>
          <Text style={styles.amountValue}>{formatFcfa(montant)}</Text>
        </View>
        <View style={styles.pinContainer}>
          <Icon name="shield-halved" size={40} color={colors.magenta} />
          <Text style={styles.pinTitle}>{t('encaisser.scan.clientPinTitle')}</Text>
          <Text style={styles.pinSubtitle}>{t('encaisser.scan.clientPinSubtitle')}</Text>
          {pinError ? <Text style={styles.errorTextPin}>{pinError}</Text> : null}
          <PinDots length={clientPin.length} minSlots={PIN_LENGTH} />
          {processing ? (
            <ActivityIndicator color={colors.magenta} style={{ marginTop: 20 }} />
          ) : (
            <PinKeypad onDigit={onPinDigit} onBackspace={onPinBackspace} disabled={processing} />
          )}
          <GradientButton
            title={t('encaisser.scan.clientPinCancel')}
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }


  if (mode === 'recognition') {
    return (
      <View style={styles.container}>
        <View style={styles.amountBar}>
          <Text style={styles.amountLabel}>{t('encaisser.scan.amountLabel')}</Text>
          <Text style={styles.amountValue}>{formatFcfa(montant)}</Text>
        </View>
        <ModeToggle mode={mode} onChange={handleModeChange} />
        <View style={styles.centered}>
          {processing ? (
            <>
              <ActivityIndicator size="large" color={colors.text} />
              <Text style={styles.processingText}>{t('encaisser.scan.verifying')}</Text>
            </>
          ) : (
            <>
              <Icon name="hand" size={48} color={colors.magenta} />
              <Text style={styles.permTitle}>{t('encaisser.scan.recognitionTitle')}</Text>
              <Text style={styles.permText}>{t('encaisser.scan.recognitionInstructions')}</Text>
              {recognitionError ? <Text style={styles.errorTextPin}>{recognitionError}</Text> : null}
              <GradientButton
                title={t('encaisser.scan.capturePalm')}
                onPress={captureAndRecognize}
                style={{ marginTop: 20, width: '100%' }}
              />
            </>
          )}
        </View>
        <Pressable onPress={() => setMode('qr')} style={styles.fallbackLink}>
          <Text style={styles.fallbackLinkText}>{t('encaisser.scan.useQr')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.magenta} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Icon name="camera" size={48} color={colors.textMuted} />
        <Text style={styles.permTitle}>{t('encaisser.scan.cameraPermTitle')}</Text>
        <Text style={styles.permText}>{t('encaisser.scan.cameraPermText')}</Text>
        <GradientButton
          title={t('encaisser.scan.allowCamera')}
          onPress={requestPermission}
          style={{ marginTop: 20, width: '100%' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.amountBar}>
        <Text style={styles.amountLabel}>{t('encaisser.scan.amountLabel')}</Text>
        <Text style={styles.amountValue}>{formatFcfa(montant)}</Text>
      </View>
      <ModeToggle mode={mode} onChange={handleModeChange} />

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
        />
        <View style={styles.frame} pointerEvents="none">
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.frameBarH} />
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.frameBarH, styles.frameBarBottom]}
          />
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.frameBarV} />
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.frameBarV, styles.frameBarRight]}
          />
        </View>
        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={styles.processingText}>{t('encaisser.scan.verifying')}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.instructions}>{t('encaisser.scan.instructions')}</Text>
      <Pressable onPress={() => setMode('recognition')} style={styles.fallbackLink}>
        <Text style={styles.fallbackLinkText}>{t('encaisser.scan.usePalm')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  permText: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  amountBar: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  amountLabel: { color: colors.textMuted, fontSize: 12 },
  amountValue: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  modeToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  modeTabActive: { backgroundColor: colors.magenta },
  modeTabText: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600' },
  modeTabTextActive: { color: colors.text },
  fallbackLink: { alignItems: 'center', paddingVertical: 16 },
  fallbackLinkText: { color: colors.turquoise, fontSize: 13, fontWeight: '600' },
  pinContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  pinTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  pinSubtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  errorTextPin: { color: colors.error, fontSize: 13, marginTop: 12, textAlign: 'center' },
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  frame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '25%',
  },
  frameBarH: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: 2 },
  frameBarBottom: { top: undefined, bottom: 0 },
  frameBarV: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, borderRadius: 2 },
  frameBarRight: { left: undefined, right: 0 },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000CC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  processingText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  instructions: {
    color: colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    padding: 16,
  },
});
