import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

type ButtonProps = {
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
  textStyle?: TextStyle;
  asChild?: boolean; // kept for API parity (no-op in RN)
  accessibilityLabel?: string;
};

export const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className, // kept for API parity, ignored in RN
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) => {
  const containerBase: any[] = [styles.containerBase];
  const textBase: any[] = [styles.textBase];

  // Variant styles
  switch (variant) {
    case 'destructive':
      containerBase.push(styles.vDestructive);
      textBase.push(styles.tOnSolid);
      break;
    case 'outline':
      containerBase.push(styles.vOutline);
      textBase.push(styles.tOutline);
      break;
    case 'secondary':
      containerBase.push(styles.vSecondary);
      textBase.push(styles.tSecondary);
      break;
    case 'ghost':
      containerBase.push(styles.vGhost);
      textBase.push(styles.tGhost);
      break;
    case 'link':
      containerBase.push(styles.vLink);
      textBase.push(styles.tLink);
      break;
    default:
      containerBase.push(styles.vDefault);
      textBase.push(styles.tOnSolid);
  }

  // Size styles
  switch (size) {
    case 'sm':
      containerBase.push(styles.sSm);
      textBase.push(styles.tsSm);
      break;
    case 'lg':
      containerBase.push(styles.sLg);
      textBase.push(styles.tsLg);
      break;
    case 'icon':
      containerBase.push(styles.sIcon);
      break;
    default:
      containerBase.push(styles.sDefault);
  }

  return { container: containerBase, text: textBase, variant, size };
};

export function Button({
  children,
  onPress,
  disabled,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
  asChild,
  accessibilityLabel,
}: ButtonProps) {
  const { container, text } = buttonVariants({ variant, size });

  const content =
    typeof children === 'string' ? (
      <Text style={[...text, textStyle]} numberOfLines={1}>
        {children}
      </Text>
    ) : (
      // Allow custom children (icons, etc.). Wrap to apply spacing.
      <View style={styles.contentRow}>{children}</View>
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ...container,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Base container
  containerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8, // gap-2
  },

  // Base text
  textBase: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Variants (container)
  vDefault: {
    backgroundColor: '#0ea5e9', // primary
    borderColor: 'transparent',
  },
  vDestructive: {
    backgroundColor: '#ef4444',
    borderColor: 'transparent',
  },
  vOutline: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderColor: 'rgba(0,0,0,0.15)',
  },
  vSecondary: {
    backgroundColor: '#e2e8f0',
    borderColor: 'transparent',
  },
  vGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  vLink: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Variant text colors
  tOnSolid: { color: '#ffffff' },
  tOutline: { color: '#0f172a' },
  tSecondary: { color: '#0f172a' },
  tGhost: { color: '#0f172a' },
  tLink: {
    color: '#0ea5e9',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#0ea5e9',
  },

  // Sizes (container paddings / dimensions)
  sDefault: {
    height: 36, // h-9
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
  },
  sSm: {
    height: 32, // h-8
    paddingHorizontal: 12, // px-3
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6, // gap-1.5
  },
  sLg: {
    height: 40, // h-10
    paddingHorizontal: 24, // px-6
    paddingVertical: 10,
    borderRadius: 8,
  },
  sIcon: {
    width: 36, // size-9
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // Text size tweaks
  tsSm: { fontSize: 13 },
  tsLg: { fontSize: 15 },

  // Interaction states
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },

  // Layout for custom children (icons + text)
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
