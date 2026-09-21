import React from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import colors from '../theme/colors';

/**
 * Centralized icon component for the app. Wraps FontAwesome6 (bundled with
 * @expo/vector-icons) so every screen imports `Icon` instead of importing an
 * icon family directly — keeps the icon set swappable in one place.
 *
 * Solid style is used by default (per ICON_MIGRATION.md); pass `variant` to
 * use another FontAwesome6 style ("regular", "brand", etc.) when needed.
 */
export default function Icon({ name, size = 20, color = colors.text, variant = 'solid', style, ...rest }) {
  return (
    <FontAwesome6
      name={name}
      size={size}
      color={color}
      style={style}
      {...{ [variant]: true }}
      {...rest}
    />
  );
}
