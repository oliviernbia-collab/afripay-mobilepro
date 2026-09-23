import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../theme/colors';

const LOGO_MAIN = require('../../assets/brand/logo-main.png');
const LOGO_SPLASH = require('../../assets/brand/logo-splash.png');
const LOGO_COMPACT = require('../../assets/brand/logo-compact.png');

// size: 'splash' | 'main' | 'compact'
// showTagline: show "Payez. Envoyez. Progressez." under the logo
export default function BrandHeader({ size = 'main', showTagline = false, style }) {
  const { t } = useTranslation();
  const source = size === 'splash' ? LOGO_SPLASH : size === 'compact' ? LOGO_COMPACT : LOGO_MAIN;
  const imgStyle = size === 'splash' ? styles.imgSplash : size === 'compact' ? styles.imgCompact : styles.imgMain;

  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={imgStyle} resizeMode="contain" />
      {showTagline ? <Text style={styles.tagline}>{t('brand.tagline')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgSplash: {
    width: 220,
    height: 187,
  },
  imgMain: {
    width: 180,
    height: 154,
  },
  imgCompact: {
    width: 110,
    height: 94,
  },
  tagline: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});
