import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native Separator (Radix-like)
 * Supports horizontal and vertical orientation
 * --------------------------------------------------------------------------- */

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
  style?: ViewStyle;
};

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  style,
}: SeparatorProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <View
      accessibilityRole={decorative ? undefined : 'separator'}
      style={[
        styles.base,
        isHorizontal ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(0,0,0,0.12)', // matches `bg-border`
    flexShrink: 0,
  },
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
});

export default Separator;
