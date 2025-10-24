// ToggleGroup.tsx (React Native / Expo)
// Converted from Radix Toggle Group to a lightweight RN implementation.
// Supports `type="single" | "multiple"`, controlled/uncontrolled value(s),
// and style variants/sizes similar to your original `toggleVariants`.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';

type Variant = 'default' | 'outline';
type Size = 'sm' | 'default' | 'lg';

type Ctx = {
  type: 'single' | 'multiple';
  value: string | string[] | undefined;
  setValue: (next: string | string[]) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
};

const ToggleGroupCtx = createContext<Ctx | null>(null);
const useTG = () => {
  const ctx = useContext(ToggleGroupCtx);
  if (!ctx) throw new Error('ToggleGroupItem must be used within ToggleGroup');
  return ctx;
};

/* ------------------------------ Root ------------------------------ */

type ToggleGroupProps =
  | {
      type?: 'single';
      value?: string;
      defaultValue?: string;
      onValueChange?: (val: string | undefined) => void;
      variant?: Variant;
      size?: Size;
      disabled?: boolean;
      style?: ViewStyle;
      children: React.ReactNode;
    }
  | {
      type: 'multiple';
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (val: string[]) => void;
      variant?: Variant;
      size?: Size;
      disabled?: boolean;
      style?: ViewStyle;
      children: React.ReactNode;
    };

export function ToggleGroup({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  variant = 'default',
  size = 'default',
  disabled,
  style,
  children,
}: ToggleGroupProps) {
  // controlled/uncontrolled
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<any>(
    defaultValue ?? (type === 'multiple' ? [] : undefined)
  );
  const cur = isControlled ? (value as any) : internal;

  const setValue = useCallback(
    (next: any) => {
      if (!isControlled) setInternal(next);
      (onValueChange as any)?.(next);
    },
    [isControlled, onValueChange]
  );

  const ctx = useMemo<Ctx>(
    () => ({ type, value: cur, setValue, variant, size, disabled }),
    [type, cur, setValue, variant, size, disabled]
  );

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <ToggleGroupCtx.Provider value={ctx}>
      <View
        style={[
          styles.row,
          {
            borderRadius: 8,
            shadowOpacity: variant === 'outline' ? 0.08 : 0,
            backgroundColor: 'transparent',
          },
          style,
        ]}
        accessibilityRole="tablist"
      >
        {/* background “group” container similar to your inline-flex rounded group */}
        <View
          style={[
            styles.groupBg,
            {
              backgroundColor: isDark ? '#0F172A' : '#F3F4F6',
              padding: 3,
              borderRadius: 8,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </ToggleGroupCtx.Provider>
  );
}

/* ------------------------------ Item ------------------------------ */

type ToggleGroupItemProps = {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  first?: boolean; // optional hint for rounded corners if you need manual control
  last?: boolean;
};

export function ToggleGroupItem({
  value,
  children,
  disabled,
  style,
  textStyle,
  first,
  last,
}: ToggleGroupItemProps) {
  const { type, value: cur, setValue, size = 'default', variant = 'default', disabled: groupDisabled } = useTG();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const selected =
    type === 'multiple'
      ? Array.isArray(cur) && cur.includes(value)
      : cur === value;

  const handlePress = () => {
    if (groupDisabled || disabled) return;
    if (type === 'single') {
      setValue(selected ? undefined : value);
    } else {
      const arr = Array.isArray(cur) ? cur.slice() : [];
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      setValue(arr);
    }
  };

  // sizing
  const dims =
    size === 'sm'
      ? { h: 28, ph: 8, fs: 12 }
      : size === 'lg'
      ? { h: 44, ph: 14, fs: 15 }
      : { h: 36, ph: 10, fs: 14 };

  // colors (approx to your web tokens)
  const activeBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
  const inactiveFg = isDark ? '#9CA3AF' : '#6B7280';
  const activeFg = isDark ? '#F9FAFB' : '#111827';
  const borderClr = isDark ? '#1F2937' : '#E5E7EB';

  return (
    <Pressable
      onPress={handlePress}
      disabled={groupDisabled || disabled}
      style={[
        styles.item,
        {
          height: dims.h,
          paddingHorizontal: dims.ph,
          backgroundColor:
            variant === 'outline'
              ? selected
                ? activeBg
                : 'transparent'
              : selected
              ? activeBg
              : 'transparent',
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
          borderColor: borderClr,
          opacity: groupDisabled || disabled ? 0.5 : 1,
        },
        // group item rounding (first/last) – RN has no :first/:last; pass flags or rely on natural rounded group
        first && { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
        last && { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!(groupDisabled || disabled) }}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.itemText,
          { fontSize: dims.fs, color: selected ? activeFg : inactiveFg, fontWeight: selected ? '600' : '500' },
          textStyle,
        ]}
      >
        {typeof children === 'string' ? children : (children as any)}
      </Text>
    </Pressable>
  );
}

/* ------------------------------ Styles ------------------------------ */

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: 'auto',
  },
  groupBg: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    // padding set in component
  },
  item: {
    borderRadius: 8, // softened; you can pass first/last to square middle edges if desired
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  itemText: {
    // font size dynamic
  },
});

export default ToggleGroup;
