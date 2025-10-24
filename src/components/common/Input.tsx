import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white'
  }
});