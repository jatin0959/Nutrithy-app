import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StoryCircle() {
  return (
    <View style={styles.circle}>
      <Text style={{ color: 'white' }}>S</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3A506B',
    alignItems: 'center',
    justifyContent: 'center'
  }
});