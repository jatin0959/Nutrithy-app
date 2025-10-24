import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View, StyleSheet, ViewStyle, AccessibilityState } from 'react-native';
import { Feather } from '@expo/vector-icons';

type CheckboxState = boolean | 'indeterminate';

type CheckboxProps = {
  checked?: CheckboxState;            // controlled
  defaultChecked?: CheckboxState;     // uncontrolled initial
  onCheckedChange?: (next: CheckboxState) => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: number;                      // box size (px). default 16
};

/**
 * React Native replacement for Radix Checkbox.
 * Supports controlled/uncontrolled, disabled, and an 'indeterminate' state.
 */
export function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  style,
  size = 16,
}: CheckboxProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState<CheckboxState>(defaultChecked);
  const value = isControlled ? checked! : internal;

  const setValue = useCallback(
    (v: CheckboxState) => {
      onCheckedChange?.(v);
      if (!isControlled) setInternal(v);
    },
    [isControlled, onCheckedChange]
  );

  // Toggle cycles: false -> true -> false (indeterminate is only set externally)
  const onPress = () => {
    if (disabled) return;
    setValue(value === true ? false : true);
  };

  useEffect(() => {
    // keep internal in sync if parent forces a value (controlled)
    if (isControlled) setInternal(checked!);
  }, [checked, isControlled]);

  const radius = 4;
  const boxStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
  };

  const selected = value === true;
  const indeterminate = value === 'indeterminate';

  const accessibilityState: AccessibilityState = {
    disabled,
    checked: indeterminate ? 'mixed' : selected,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        styles.base,
        {
          ...boxStyle,
          borderColor: selected ? '#0ea5e9' : 'rgba(0,0,0,0.25)',
          backgroundColor: selected ? '#0ea5e9' : 'rgba(0,0,0,0.03)',
          opacity: disabled ? 0.5 : 1,
        },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {selected ? (
        <Feather name="check" size={Math.max(10, Math.round(size * 0.75))} color="#ffffff" />
      ) : indeterminate ? (
        <View
          style={{
            width: Math.max(8, Math.round(size * 0.6)),
            height: Math.max(2, Math.round(size * 0.125)),
            borderRadius: 1,
            backgroundColor: '#0ea5e9',
          }}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: { opacity: 0.85 },
});
