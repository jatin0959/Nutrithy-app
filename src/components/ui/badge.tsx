import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

type BadgeProps = {
  children?: React.ReactNode;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const badgeVariants = (variant: Variant = 'default') => {
  switch (variant) {
    case 'secondary':
      return { container: [styles.base, styles.secondary], text: [styles.textBase, styles.textSecondary] };
    case 'destructive':
      return { container: [styles.base, styles.destructive], text: [styles.textBase, styles.textDestructive] };
    case 'outline':
      return { container: [styles.base, styles.outline], text: [styles.textBase, styles.textOutline] };
    default:
      return { container: [styles.base, styles.default], text: [styles.textBase, styles.textDefault] };
  }
};

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  const { container, text } = badgeVariants(variant);
  return (
    <View style={[...container, style]}>
      <Text style={[...text, textStyle]} numberOfLines={1}>
        {children as any}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8, // px-2
    paddingVertical: 4,   // py-0.5 (~4px)
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    overflow: 'hidden',
  },
  // Variants (container)
  default: {
    backgroundColor: '#0ea5e9', // primary
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#e2e8f0', // secondary
    borderColor: 'transparent',
  },
  destructive: {
    backgroundColor: '#ef4444',
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.15)',
  },
  // Text styles per variant
  textBase: {
    fontSize: 12,
    fontWeight: '600',
  },
  textDefault: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#0f172a',
  },
  textDestructive: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#0f172a',
  },
});
