import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function Button({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]}>
      <Text style={styles.txt}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#5BC0BE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center'
  },
  txt: {
    color: 'white',
    fontWeight: '700'
  }
});