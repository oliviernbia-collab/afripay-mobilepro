import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import IconRow from '../../components/IconRow';
import { transferInterne, transferExterne, MOBILE_MONEY_OPERATORS } from '../../api/transferts';
import { extractErrorMessage } from '../../api/client';

const PIN_THRESHOLD = 50000;

const OPERATOR_META = {
  wave: { color: '#1DC8E3', icon: 'droplet' },
  orange_money: { color: colors.orange, icon: 'mobile-screen' },
  moov_money: { color: colors.blue, icon: 'tower-cell' },
  mtn_money: { color: colors.gold, icon: 'sim-card' },
};

export default function TransferScreen() {
  const [mode, setMode] = useState('externe'); // 'externe' | 'interne'

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Transférer</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'externe' && styles.tabActive]}
          onPress={() => setMode('externe')}
        >
          <Text style={[styles.tabText, mode === 'externe' && styles.tabTextActive]}>Vers Mobile Money</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'interne' && styles.tabActive]}
          onPress={() => setMode('interne')}
        >
          <Text style={[styles.tabText, mode === 'interne' && styles.tabTextActive]}>Vers un compte AfriPay</Text>
        </TouchableOpacity>
      </View>

      {mode === 'externe' ? <ExternalTransferForm /> : <InternalTransferForm />}
    </KeyboardAvoidingView>
  );
}

function ExternalTransferForm() {
  const [operateur, setOperateur] = useState(MOBILE_MONEY_OPERATORS[0].value);
  const [numero, setNumero] = useState('');
  const [montant, setMontant] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const montantValue = Number(montant || 0);
  const needsPin = montantValue >= PIN_THRESHOLD;

  const handleSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!numero || !montantValue) {
      setError('Renseignez le numéro de destination et le montant.');
      return;
    }
    if (needsPin && !pin) {
      setError(`Code PIN requis pour les transferts à partir de ${PIN_THRESHOLD.toLocaleString('fr-FR')} FCFA.`);
      return;
    }
    setLoading(true);
    try {
      const result = await transferExterne({
        operateurDestination: operateur,
        numeroDestinataire: numero,
        montant: montantValue,
        pin: needsPin ? pin : undefined,
      });
      setSuccess(result);
      setNumero('');
      setMontant('');
      setPin('');
    } catch (e) {
      setError(extractErrorMessage(e, 'Le transfert a échoué.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Opérateur</Text>
      {MOBILE_MONEY_OPERATORS.map((op) => {
        const meta = OPERATOR_META[op.value] || { color: colors.turquoise, icon: 'wallet' };
        return (
          <IconRow
            key={op.value}
            icon={meta.icon}
            iconColor={meta.color}
            label={op.label}
            selected={operateur === op.value}
            onPress={() => setOperateur(op.value)}
            showChevron={false}
            right={operateur === op.value ? <Icon name="circle-check" size={18} color={meta.color} /> : null}
          />
        );
      })}

      <Input label="Numéro destinataire" placeholder="Ex: 0700000000" keyboardType="phone-pad" value={numero} onChangeText={setNumero} />
      <Input label="Montant (FCFA)" placeholder="0" keyboardType="number-pad" value={montant} onChangeText={(v) => setMontant(v.replace(/[^0-9]/g, ''))} />
      {needsPin ? (
        <Input label="Code PIN AfriPay" placeholder="••••" secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPin} />
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Transfert envoyé avec succès vers {operateur}.</Text> : null}

      <GradientButton title="Envoyer" onPress={handleSubmit} loading={loading} icon={<Icon name="paper-plane" size={16} color={colors.text} />} />
    </ScrollView>
  );
}

function InternalTransferForm() {
  const [telephone, setTelephone] = useState('');
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const montantValue = Number(montant || 0);
  const needsPin = montantValue >= PIN_THRESHOLD;

  const handleSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!telephone || !montantValue) {
      setError('Renseignez le numéro du destinataire et le montant.');
      return;
    }
    if (needsPin && !pin) {
      setError(`Code PIN requis pour les transferts à partir de ${PIN_THRESHOLD.toLocaleString('fr-FR')} FCFA.`);
      return;
    }
    setLoading(true);
    try {
      const result = await transferInterne({
        telephoneDestinataire: telephone,
        montant: montantValue,
        libelle: libelle || undefined,
        pin: needsPin ? pin : undefined,
      });
      setSuccess(result);
      setTelephone('');
      setMontant('');
      setLibelle('');
      setPin('');
    } catch (e) {
      setError(extractErrorMessage(e, 'Le transfert a échoué.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Input label="Téléphone du destinataire" placeholder="Ex: 0700000000" keyboardType="phone-pad" value={telephone} onChangeText={setTelephone} />
      <Input label="Montant (FCFA)" placeholder="0" keyboardType="number-pad" value={montant} onChangeText={(v) => setMontant(v.replace(/[^0-9]/g, ''))} />
      <Input label="Note (optionnel)" placeholder="Motif du transfert" value={libelle} onChangeText={setLibelle} />
      {needsPin ? (
        <Input label="Code PIN AfriPay" placeholder="••••" secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPin} />
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Transfert AfriPay effectué avec succès.</Text> : null}

      <GradientButton title="Envoyer" onPress={handleSubmit} loading={loading} icon={<Icon name="paper-plane" size={16} color={colors.text} />} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.magenta },
  tabText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  form: { padding: 20, paddingBottom: 60 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  successText: { color: colors.success, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: '600' },
});
