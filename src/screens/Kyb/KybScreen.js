import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import { KybBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getMyMerchantDocuments } from '../../api/kyc';
import { extractErrorMessage } from '../../api/client';

function requiredDocsFor(type) {
  if (type === 'entreprise') {
    return ['cni', 'rccm', 'ncc', 'justificatif_activite', 'selfie'];
  }
  return ['cni', 'justificatif_domicile', 'justificatif_activite', 'selfie'];
}

export default function KybScreen({ navigation }) {
  const { t } = useTranslation();
  const { merchant, refreshMerchant } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const DOC_LABELS = t('kyb.home.docLabels', { returnObjects: true });

  const load = useCallback(async () => {
    setError('');
    try {
      const [docs] = await Promise.all([getMyMerchantDocuments(), refreshMerchant()]);
      setDocuments(docs);
    } catch (e) {
      setError(extractErrorMessage(e, t('kyb.home.loadError')));
    }
  }, [refreshMerchant, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const required = requiredDocsFor(merchant?.type);
  const submittedTypes = new Set(documents.map((d) => d.type_document));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.magenta} />}
    >
      <Card style={styles.statusCard}>
        <Text style={styles.statusLabel}>{t('kyb.home.statusLabel')}</Text>
        <KybBadge statut={merchant?.statut_kyb} style={{ marginTop: 8 }} />
        {merchant?.statut_kyb !== 'validé' ? (
          <Text style={styles.statusHint}>{t('kyb.home.statusPendingHint')}</Text>
        ) : (
          <Text style={styles.statusHintOk}>{t('kyb.home.statusOkHint')}</Text>
        )}
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>
        {t('kyb.home.requiredDocsLabel', {
          type: merchant?.type === 'entreprise' ? t('kyb.home.typeEntreprise') : t('kyb.home.typeParticulier'),
        })}
      </Text>

      {required.map((docType) => {
        const submitted = submittedTypes.has(docType);
        return (
          <TouchableOpacity
            key={docType}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('KybUpload', { typeDocument: docType, label: DOC_LABELS[docType] })}
          >
            <Card style={styles.docRow}>
              <View style={[styles.docIcon, { backgroundColor: submitted ? `${colors.success}22` : `${colors.textMuted}22` }]}>
                <Icon
                  name={submitted ? 'circle-check' : 'file-arrow-up'}
                  size={22}
                  color={submitted ? colors.success : colors.textMuted}
                />
              </View>
              <View style={styles.docText}>
                <Text style={styles.docLabel}>{DOC_LABELS[docType]}</Text>
                <Text style={styles.docStatus}>{submitted ? t('kyb.home.sentStatus') : t('kyb.home.notSentStatus')}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textMuted} />
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: { marginBottom: 20 },
  statusLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  statusHint: { color: colors.textSecondary, fontSize: 12.5, marginTop: 10, lineHeight: 18 },
  statusHintOk: { color: colors.success, fontSize: 12.5, marginTop: 10, lineHeight: 18, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1 },
  docLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  docStatus: { color: colors.textMuted, fontSize: 11.5, marginTop: 3 },
});
