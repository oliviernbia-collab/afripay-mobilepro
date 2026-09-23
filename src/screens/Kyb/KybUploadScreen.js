import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import GradientButton from '../../components/GradientButton';
import { uploadMerchantDocument } from '../../api/kyc';
import { extractErrorMessage } from '../../api/client';

export default function KybUploadScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { typeDocument, label } = route.params;
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pickImage = async (fromCamera) => {
    setError('');
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(t('kyb.upload.permissionDenied'));
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, mediaTypes: ['images'] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });

    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError(t('kyb.upload.photoRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await uploadMerchantDocument({
        uri: image.uri,
        typeDocument,
        fileName: image.fileName || `${typeDocument}.jpg`,
        mimeType: image.mimeType || 'image/jpeg',
      });
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(extractErrorMessage(e, t('kyb.upload.sendError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.subtitle}>{t('kyb.upload.subtitle')}</Text>

      <View style={styles.preview}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImg} resizeMode="cover" />
        ) : (
          <Icon name="image" size={48} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
          <Icon name="camera" size={20} color={colors.text} />
          <Text style={styles.pickBtnText}>{t('common.camera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
          <Icon name="images" size={20} color={colors.text} />
          <Text style={styles.pickBtnText}>{t('common.gallery')}</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{t('kyb.upload.sentSuccess')}</Text> : null}

      <GradientButton title={t('kyb.upload.send')} onPress={handleUpload} loading={loading} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 20 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6, marginBottom: 20 },
  preview: {
    height: 200,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImg: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  pickBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  successText: { color: colors.success, fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: '600' },
});
