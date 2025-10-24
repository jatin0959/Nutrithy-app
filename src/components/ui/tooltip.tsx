// toggle.tsx (React Native / Expo)
// Converted from @radix-ui/react-toggle to a mobile-friendly Pressable.
// API parity: `pressed`, `defaultPressed`, `onPressedChange`, `variant`, `size`.
// Exports `Toggle` and a lightweight `toggleVariants` helper for styling parity.

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  useColorScheme,
  View,
  Platform,
} from 'react-native';

type Variant = 'default' | 'outline';
type Size = 'sm' | 'default' | 'lg';

type ToggleProps = {
  pressed?: boolean;                  // controlled
  defaultPressed?: boolean;           // uncontrolled
  onPressedChange?: (pressed: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;                  // maps to aria-invalid styles
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
};

export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  variant = 'default',
  size = 'default',
  disabled,
  invalid,
  style,
  textStyle,
  children,
  onPress,
}: ToggleProps) {
  const isControlled = pressed !== undefined;
  const [inner, setInner] = useState<boolean>(!!defaultPressed);
  const isOn = isControlled ? !!pressed : inner;

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const stylesFromVariant = useMemo(
    () => toggleVariants({ variant, size, isOn, disabled: !!disabled, invalid: !!invalid, isDark }),
    [variant, size, isOn, disabled, invalid, isDark]
  );

  const handlePress = (e: GestureResponderEvent) => {
    if (!isControlled) setInner(!isOn);
    onPressedChange?.(!isOn);
    onPress?.(e);
  };

  const content =
    typeof children === 'string' ? (
      <Text style={[baseStyles.text, stylesFromVariant.text, textStyle]} numberOfLines={1}>
        {children}
      </Text>
    ) : (
      // If children contain icons, keep layout consistent
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{children}</View>
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: isOn }}
      disabled={disabled}
      onPress={handlePress}
      style={[baseStyles.btn, stylesFromVariant.container, style]}
      android_ripple={
        Platform.OS === 'android'
          ? { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }
          : undefined
      }
    >
      {content}
    </Pressable>
  );
}

/* -----------------------------------------------------------------------------
   toggleVariants helper (RN equivalent of your CVA)
   Produces container/text styles based on {variant, size, state}.
----------------------------------------------------------------------------- */

export function toggleVariants({
  variant,
  size,
  isOn,
  disabled,
  invalid,
  isDark,
}: {
  variant: Variant;
  size: Size;
  isOn: boolean;
  disabled: boolean;
  invalid: boolean;
  isDark: boolean | null;
}): { container: ViewStyle; text: TextStyle } {
  // sizing
  const sizing =
    size === 'sm'
      ? { h: 32, px: 6, minW: 32, fs: 12 }
      : size === 'lg'
      ? { h: 40, px: 10, minW: 40, fs: 15 }
      : { h: 36, px: 8, minW: 36, fs: 14 };

  // base colors (approximate to your tokens)
  const fg = isDark ? '#E5E7EB' : '#111827';
  const fgMuted = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#0EA5E9' : '#0EA5E9';
  const accentFg = isDark ? '#0B1220' : '#FFFFFF';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const border = isDark ? '#1F2937' : '#E5E7EB';
  const invalidRing = isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)';

  const container: ViewStyle = {
    height: sizing.h,
    minWidth: sizing.minW,
    paddingHorizontal: sizing.px,
    borderRadius: 8,
    borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
    borderColor: variant === 'outline' ? border : 'transparent',
    backgroundColor: isOn
      ? // data-[state=on]:bg-accent
        (isDark ? 'rgba(14,165,233,0.2)' : '#0EA5E9')
      : // hover is not 1:1 on RN; base stays transparent
        'transparent',
    // focus ring analogue — RN doesn't have focus-visible; we can tint border via invalid
    ...(invalid ? { shadowColor: invalidRing, shadowOpacity: 0.6, shadowRadius: 4 } : null),
    opacity: disabled ? 0.5 : 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  };

  const text: TextStyle = {
    fontSize: sizing.fs,
    fontWeight: isOn ? '600' : '500',
    color: isOn ? accentTextColor(accentFg, isDark) : fg,
  };

  // For outline variant + not pressed, emulate hover color by using muted fg
  if (variant === 'outline' && !isOn) {
    text.color = fgMuted;
  }

  return { container, text };
}

function accentTextColor(accentFg: string, isDark: boolean | null) {
  // When selected, web used `text-accent-foreground`; keep readable white on light, near-white on dark
  return accentFg || (isDark ? '#0B1220' : '#FFFFFF');
}

/* -------------------------------- Base styles ------------------------------- */

const baseStyles = StyleSheet.create({
  btn: {
    // transition approximation
  },
  text: {
    // shared text rules
  },
});
