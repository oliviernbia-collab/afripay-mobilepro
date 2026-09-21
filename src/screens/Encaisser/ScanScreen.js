import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import GradientButton from '../../components/GradientButton';
import { formatFcfa } from '../../utils/format';
import { encaisser } from '../../api/marchand';
import { extractErrorMessage } from '../../api/client';

export default function ScanScreen({ route, navigation }) {
  const { montant } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const scannedRef = useRef(false);

  // Reset the scan lock whenever this screen regains focus (e.g. after "Réessayer").
  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      setScanning(true);
      setProcessing(false);
    }, [])
  );

  const handleBarcodeScanned = async ({ data }) => {
    if (scannedRef.current || processing) return;
    scannedRef.current = true;
    setScanning(false);
    setProcessing(true);

    try {
      const result = await encaisser({ montant, palmCode: data });
      navigation.replace('EncaisserReceipt', { success: true, montant, result });
    } catch (e) {
      navigation.replace('EncaisserReceipt', {
        success: false,
        montant,
        errorMessage: extractErrorMessage(e, 'Le paiement a échoué.'),
      });
    }
  };

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
        <Text style={styles.permTitle}>Accès à la caméra requis</Text>
        <Text style={styles.permText}>
          AfriPay Pro a besoin de la caméra pour scanner le QR code de paiement présenté par le client.
        </Text>
        <GradientButton title="Autoriser la caméra" onPress={requestPermission} style={{ marginTop: 20, width: '100%' }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.amountBar}>
        <Text style={styles.amountLabel}>Montant à encaisser</Text>
        <Text style={styles.amountValue}>{formatFcfa(montant)}</Text>
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
        />
        <View style={styles.frame} />
        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={styles.processingText}>Vérification du paiement…</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.instructions}>
        Placez le QR code affiché sur l'écran "Payer" du client dans le cadre.
      </Text>
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
    borderWidth: 3,
    borderColor: colors.turquoise,
    borderRadius: radii.lg,
  },
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
