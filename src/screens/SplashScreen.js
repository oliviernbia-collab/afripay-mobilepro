import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import colors from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <BrandHeader size="splash" showTagline />
      </View>
      <View style={styles.footer}>
        <ActivityIndicator color={colors.magenta} />
        <Text style={styles.hint}>AfriPay Pro — espace marchand</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
