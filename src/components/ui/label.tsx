import React from 'react';
import { Text, StyleSheet, TextProps, ViewStyle } from 'react-native';

/**
 * React Native equivalent of a Radix Label.
 * Preserves base styling and accessibility behavior.
 */

type LabelProps = TextProps & {
  disabled?: boolean;
  style?: ViewStyle;
};

export function Label({ children, disabled, style, ...props }: LabelProps) {
  return (
    <Text
      accessibilityRole="label"
      style={[
        styles.label,
        disabled && styles.disabled,
        style as any,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // roughly matches gap-2
    fontSize: 14, // text-sm
    lineHeight: 20,
    fontWeight: '500',
    color: '#0f172a', // text color
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Label;
