import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import { KybBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const FAQ = [
  {
    q: "Quand puis-je commencer à encaisser des paiements ?",
    a: "Dès que votre dossier KYB est validé par un agent AfriPay depuis le back office. Suivez le statut dans la section 'Validation du compte'.",
  },
  {
    q: 'Comment fonctionne le scan de paiement ?',
    a: "Le client affiche un QR code sur son application AfriPay (écran « Payer »). Vous scannez ce code avec la caméra pour encaisser le montant — il remplace la reconnaissance de paume de main réelle dans cette version.",
  },
  {
    q: "Le code PIN est-il obligatoire ?",
    a: "Il est requis uniquement pour confirmer les transferts (Mobile Money ou compte AfriPay) d'un montant supérieur ou égal à 50 000 FCFA.",
  },
];

export default function SettingsScreen({ navigation }) {
  const { merchant, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Paramètres</Text>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="store" size={26} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{merchant?.raison_sociale || 'Marchand AfriPay'}</Text>
            <Text style={styles.profilePhone}>{merchant?.telephone}</Text>
          </View>
          <KybBadge statut={merchant?.statut_kyb} />
        </View>
        <View style={styles.profileDetails}>
          <DetailRow label="Type de compte" value={merchant?.type === 'entreprise' ? 'Entreprise' : 'Particulier'} />
          {merchant?.email ? <DetailRow label="Email" value={merchant.email} /> : null}
          {merchant?.rccm ? <DetailRow label="RCCM" value={merchant.rccm} /> : null}
          {merchant?.ncc ? <DetailRow label="NCC / NIF" value={merchant.ncc} /> : null}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Compte</Text>
      <MenuItem icon="shield-halved" label="Validation du compte (KYB)" onPress={() => navigation.navigate('Kyb')} />
      <MenuItem icon="key" label="Changer mon code PIN" onPress={() => navigation.navigate('ChangePin')} />

      <Text style={styles.sectionTitle}>Aide</Text>
      {FAQ.map((item, index) => (
        <TouchableOpacity key={item.q} onPress={() => setOpenFaq(openFaq === index ? null : index)} activeOpacity={0.8}>
          <Card style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Icon name={openFaq === index ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>
            {openFaq === index ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
          </Card>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="right-from-bracket" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.menuCard}>
        <View style={styles.menuRow}>
          <Icon name={icon} size={20} color={colors.turquoise} />
          <Text style={styles.menuLabel}>{label}</Text>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  profileCard: { marginBottom: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radii.lg,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  profilePhone: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  profileDetails: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { color: colors.textMuted, fontSize: 12.5 },
  detailValue: { color: colors.text, fontSize: 12.5, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  menuCard: { marginBottom: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  faqCard: { marginBottom: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600', marginRight: 8 },
  faqAnswer: { color: colors.textSecondary, fontSize: 12.5, marginTop: 10, lineHeight: 18 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: { color: colors.error, fontSize: 14, fontWeight: '700' },
});
