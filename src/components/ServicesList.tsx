import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Service = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string; // gradient tailwind-like key, we’ll map to real colors
};

const GRADIENT_MAP: Record<string, [string, string]> = {
  'from-pink-500 to-rose-500': ['#ec4899', '#f43f5e'],
  'from-purple-500 to-indigo-500': ['#8b5cf6', '#6366f1'],
  'from-orange-500 to-red-500': ['#f59e0b', '#ef4444'],
};

export default function ServicesList({
  services,
  onPressService,
  limit,
}: {
  services: Service[];
  onPressService: (id: string) => void;
  limit?: number;
}) {
  const list = typeof limit === 'number' ? services.slice(0, limit) : services;

  return (
    <View style={{ rowGap: 12 }}>
      {list.map((s) => {
        const colors = GRADIENT_MAP[s.color] ?? ['#111827', '#111827'];
        return (
          <Pressable
            key={s.id}
            onPress={() => onPressService(s.id)}
            style={styles.card}
          >
            <Image source={{ uri: s.image }} style={styles.bg} />
            <LinearGradient colors={colors} style={styles.overlay} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <View style={styles.content}>
              <View>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.sub}>{s.subtitle}</Text>
              </View>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Book Now</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 128, borderRadius: 16, overflow: 'hidden' },
  bg: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  overlay: { position: 'absolute', inset: 0, opacity: 0.8, borderRadius: 16 },
  content: { flex: 1, padding: 16, justifyContent: 'space-between' },
  title: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 4 },
  sub: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
  btn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
