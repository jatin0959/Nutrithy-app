import React from 'react';
import { View, StyleSheet } from 'react-native';
export default function GameProgressBar() {
  return <View style={styles.bar}><View style={styles.fill}/></View>;
}
const styles = StyleSheet.create({
  bar:{ height:10, backgroundColor:'#E2E8F0', borderRadius:8},
  fill:{ height:10, width:'40%', backgroundColor:'#5BC0BE', borderRadius:8}
});