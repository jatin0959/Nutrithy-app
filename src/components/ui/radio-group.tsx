import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Text,
  TextStyle,
  AccessibilityState,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native Radio Group (Radix-like)
 * Exports: RadioGroup, RadioGroupItem
 * --------------------------------------------------------------------------- */

type RadioGroupContext = {
  value?: string;
  setValue: (v: string) => void;
  disabled?: boolean;
  color: string;
  size: number;
};
const Ctx = createContext<RadioGroupContext | null>(null);
function useRG() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('RadioGroupItem must be used within <RadioGroup>');
  return ctx;
}

type RadioGroupProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  gap?: number;
  style?: ViewStyle;
  /** indicator color */
  color?: string;
  /** radio diameter in px */
  size?: number;
  children?: React.ReactNode;
};

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  disabled,
  orientation = 'vertical',
  gap = 12,
  style,
  color = '#0ea5e9',
  size = 16,
  children,
}: RadioGroupProps) {
  const controlled = typeof value === 'string';
  const [internal, setInternal] = useState(defaultValue);
  const val = controlled ? value : internal;

  const setValue = useCallback(
    (v: string) => {
      onValueChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onValueChange]
  );

  const ctx = useMemo<RadioGroupContext>(
    () => ({ value: val, setValue, disabled, color, size }),
    [val, setValue, disabled, color, size]
  );

  return (
    <Ctx.Provider value={ctx}>
      <View
        accessibilityRole="radiogroup"
        style={[
          styles.group,
          { flexDirection: orientation === 'horizontal' ? 'row' : 'column', gap },
          style,
        ]}
      >
        {children}
      </View>
    </Ctx.Provider>
  );
}

type RadioGroupItemProps = {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  /** override per-item size/color if needed */
  size?: number;
  color?: string;
};

export function RadioGroupItem({
  value,
  label,
  disabled: itemDisabled,
  style,
  labelStyle,
  size,
  color,
}: RadioGroupItemProps) {
  const ctx = useRG();
  const selected = ctx.value === value;
  const disabled = ctx.disabled || itemDisabled;

  const s = size ?? ctx.size;
  const c = color ?? ctx.color;
  const borderColor = disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)';

  const accessibilityState: AccessibilityState = { selected, disabled };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={accessibilityState}
      onPress={() => !disabled && ctx.setValue(value)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && { opacity: 0.9 },
        style,
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            width: s,
            height: s,
            borderRadius: s / 2,
            borderColor,
            backgroundColor: disabled ? 'rgba(0,0,0,0.03)' : 'transparent',
          },
        ]}
      >
        {selected ? (
          <View
            style={{
              width: Math.max(2, s * 0.5),
              height: Math.max(2, s * 0.5),
              borderRadius: s,
              backgroundColor: c,
            }}
          />
        ) : null}
      </View>
      {label != null ? (
        <Text style={[styles.label, disabled && styles.labelDisabled, labelStyle]} numberOfLines={1}>
          {label as any}
        </Text>
      ) : null}
    </Pressable>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  group: {
    display: 'flex',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8, // gap-2
  },
  radio: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: '#0f172a',
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
