import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import colors, { gradients } from '../theme/colors';

const LOGO_MAIN = require('../../assets/brand/logo-main.png');
const LOGO_SPLASH = require('../../assets/brand/logo-splash.png');
const LOGO_COMPACT = require('../../assets/brand/logo-compact.png');

// Épaisseur du liseré dégradé du cadre circulaire (prop `circle`).
const RING_WIDTH = 2.5;
// logo-main.png est le lockup complet (symbole + "AfriPay" + slogan) redimensionné tel
// quel, avec ses marges internes. Mesuré sur le fichier source : le point du dessin le
// plus excentré (la tiret du slogan) est à 1.044× la demi-largeur de l'image depuis son
// centre — 1.12 ajoute une marge de sécurité pour ne jamais rogner le texte.
const CIRCLE_RATIO = 1.12;

// size: 'splash' | 'main' | 'compact' | 'icon'
// showTagline: show "Payez. Envoyez. Progressez." under the logo
// circle: entoure le logo d'une pastille ronde (liseré dégradé) — écran de connexion
export default function BrandHeader({ size = 'main', showTagline = false, scale = 1, circle = false, style }) {
  const { t } = useTranslation();
  const source = size === 'splash' ? LOGO_SPLASH : size === 'compact' || size === 'icon' ? LOGO_COMPACT : LOGO_MAIN;
  const imgStyle =
    size === 'splash' ? styles.imgSplash : size === 'icon' ? styles.imgIcon : size === 'compact' ? styles.imgCompact : styles.imgMain;

  const logo = (
    <Image
      source={source}
      style={[imgStyle, scale !== 1 && { width: imgStyle.width * scale, height: imgStyle.height * scale }]}
      resizeMode="contain"
      accessibilityLabel="AfriPay"
    />
  );

  return (
    <View style={[styles.container, style]}>
      {circle ? <BrandCircle diameter={imgStyle.width * scale * CIRCLE_RATIO}>{logo}</BrandCircle> : logo}
      {showTagline ? <Text style={styles.tagline}>{t('brand.tagline')}</Text> : null}
    </View>
  );
}

/** Pastille ronde : liseré dégradé de marque + disque sombre, logo centré. */
function BrandCircle({ diameter, children }) {
  const inner = diameter - RING_WIDTH * 2;
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}
    >
      <View style={[styles.ringInner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        {children}
      </View>
    </LinearGradient>
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
  // Section 10.3 du cahier des charges : le logo doit aussi apparaître dans l'en-tête du tableau
  // de bord — trop petit pour "compact" (pensé pour un bloc de page pleine largeur, ex.
  // AboutScreen), ce format tient dans la ligne d'en-tête à côté du menu/de la cloche.
  imgIcon: {
    width: 34,
    height: 29,
  },
  tagline: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  ring: { alignItems: 'center', justifyContent: 'center', padding: RING_WIDTH },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
});
