// Textarea.tsx (React Native / Expo)
// Converted from your web textarea component

import React, { useState } from 'react';
import { TextInput, StyleSheet, View, useColorScheme } from 'react-native';

type TextareaProps = React.ComponentProps<typeof TextInput> & {
  error?: boolean;
};

export function Textarea({
  style,
  editable = true,
  error = false,
  placeholder,
  ...props
}: TextareaProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: error
            ? '#EF4444'
            : focused
            ? '#3B82F6'
            : isDark
            ? 'rgba(255,255,255,0.1)'
            : '#E5E7EB',
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        editable={editable}
        multiline
        numberOfLines={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.textarea,
          { color: isDark ? '#F9FAFB' : '#111827' },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 64, // equivalent to min-h-16
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    transition: 'border-color 0.2s ease, shadow 0.2s ease',
  },
  textarea: {
    fontSize: 16, // text-base
    textAlignVertical: 'top',
    padding: 0,
  },
});

export default Textarea;
