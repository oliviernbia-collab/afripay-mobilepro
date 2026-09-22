import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={[`${colors.orange}00`, `${colors.orange}33`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
        pointerEvents="none"
      />
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
  glow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
});
