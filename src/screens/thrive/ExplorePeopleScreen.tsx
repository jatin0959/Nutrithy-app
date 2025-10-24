import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ExplorePeopleScreen() {
  return (
    <LinearGradient colors={['#0B132B', '#1C2541']} style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.container}>
          <Ionicons name="sparkles-outline" size={48} />
          <Text style={styles.title}>ExplorePeople</Text>
          <Text style={styles.subtitle}>Explore people</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white'
  }
});