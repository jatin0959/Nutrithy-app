import React, { forwardRef } from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

type RNInputProps = TextInputProps & {
  /** Web-like `type` hint. Maps to keyboardType/secureTextEntry. */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Combine with `style` to override container/text styles */
  style?: ViewStyle | TextStyle;
};

export const Input = forwardRef<TextInput, RNInputProps>(
  ({ type = 'text', editable = true, placeholderTextColor = '#94a3b8', style, ...props }, ref) => {
    const mapType = () => {
      switch (type) {
        case 'email':
          return { keyboardType: 'email-address' as const, autoCapitalize: 'none' as const };
        case 'password':
          return { secureTextEntry: true, autoCapitalize: 'none' as const };
        case 'number':
          return {
            keyboardType: Platform.OS === 'ios' ? ('number-pad' as const) : ('numeric' as const),
          };
        case 'tel':
          return { keyboardType: 'phone-pad' as const };
        case 'url':
          return { keyboardType: 'url' as const, autoCapitalize: 'none' as const };
        case 'search':
          return { returnKeyType: 'search' as const };
        default:
          return {};
      }
    };

    const disabled = editable === false;

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor}
        editable={editable}
        selectionColor="#0ea5e9" // selection:bg-primary
        {...mapType()}
        style={[
          styles.input,
          disabled && styles.inputDisabled,
          style as any,
        ]}
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create({
  input: {
    // layout
    height: 36, // h-9
    minWidth: 0,
    width: '100%',
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    // visuals
    backgroundColor: 'rgba(247, 248, 250, 1)', // bg-input-background
    borderColor: 'rgba(0,0,0,0.15)', // border-input
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    // text
    fontSize: 14, // md:text-sm
    color: '#0f172a',
  },
  inputDisabled: {
    opacity: 0.5,
  },
});

export default Input;
