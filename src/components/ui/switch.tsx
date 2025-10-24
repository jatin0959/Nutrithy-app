// Switch.tsx (React Native / Expo)
// Converted from @radix-ui/react-switch version
// Uses React Native's built-in Switch component

import React, { useState } from 'react';
import { View, Switch as RNSwitch, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

export function Switch({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled,
  style,
}: {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (val: boolean) => void;
  disabled?: boolean;
  style?: any;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Allow controlled/uncontrolled use
  const [internal, setInternal] = useState(defaultValue ?? false);
  const value = controlledValue ?? internal;

  const handleToggle = (val: boolean) => {
    if (controlledValue === undefined) setInternal(val);
    onValueChange?.(val);
  };

  return (
    <View style={[styles.container, style]}>
      <RNSwitch
        trackColor={{
          false: isDark ? '#374151' : '#E5E7EB', // unchecked bg
          true: isDark ? '#0EA5E9' : '#3B82F6',  // checked bg
        }}
        thumbColor={
          Platform.OS === 'android'
            ? value
              ? '#FFFFFF'
              : isDark
              ? '#D1D5DB'
              : '#FFFFFF'
            : undefined
        }
        ios_backgroundColor={isDark ? '#374151' : '#E5E7EB'}
        onValueChange={handleToggle}
        value={value}
        disabled={disabled}
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

export default Switch;
