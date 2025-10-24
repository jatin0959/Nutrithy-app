import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function AchievementPopup() {
  return <View style={styles.pop}><Text>Achievement Unlocked!</Text></View>;
}
const styles = StyleSheet.create({
  pop:{ padding:16, backgroundColor:'white', borderRadius:12 }
});