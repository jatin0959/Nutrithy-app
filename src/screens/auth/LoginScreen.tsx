import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Truck, Zap, Sparkles } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const handleLogin = () => {
    setErr('');
    if (!email || !password) {
      setErr('Please enter email and password.');
      return;
    }
    // TODO: integrate real auth API
    navigation.replace('MainTabs');
  };

  return (
    <View style={s.container}>
      {/* Hero */}
      <LinearGradient colors={['#1e3a8a', '#7c3aed', '#db2777']} style={s.hero} />
      <View style={s.heroCard}>
        <View style={s.logoBox}>
          <Truck size={36} color="#fff" />
        </View>
        <Text style={s.title}>
          <Text style={{ color: '#fbbf24' }}>Nutri</Text>
          <Text style={{ color: '#fff' }}>Thy</Text> World
        </Text>
        <Text style={s.subtitle}>Return to your adventure</Text>
      </View>

      {/* Form */}
      <View style={s.form}>
        <View style={s.group}>
          <Text style={s.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@nutrithy.world"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            style={s.input}
          />
        </View>

        <View style={s.group}>
          <Text style={s.label}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!show}
              style={[s.input, { paddingRight: 48 }]}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShow(v => !v)}>
              {show ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </Pressable>
          </View>
        </View>

        {!!err && <Text style={s.err}>{err}</Text>}

        <Pressable onPress={handleLogin} style={s.cta}>
          <LinearGradient colors={['#06b6d4', '#8b5cf6']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.ctaGrad}>
            <Zap size={18} color="#fff" />
            <Text style={s.ctaText}>Enter the World</Text>
            <Sparkles size={16} color="#fff" />
          </LinearGradient>
        </Pressable>

        <View style={s.rowCenter}>
          <Text style={s.help}>New here?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={s.link}> Create an account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  hero: { position: 'absolute', inset: 0, opacity: 0.6 },
  heroCard: { alignItems: 'center', marginTop: 80 },
  logoBox: {
    width: 76, height: 76, borderRadius: 20, backgroundColor: 'rgba(250,204,21,0.25)',
    borderWidth: 2, borderColor: 'rgba(250,204,21,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  title: { marginTop: 14, fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#a5b4fc', marginTop: 4 },
  form: { marginTop: 40, paddingHorizontal: 20 },
  group: { marginBottom: 14 },
  label: { color: '#e5e7eb', fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(2,6,23,0.6)', borderWidth: 2, borderColor: 'rgba(148,163,184,0.3)',
    borderRadius: 14, color: '#fff', paddingHorizontal: 14, paddingVertical: 12,
  },
  eyeBtn: { position: 'absolute', right: 12, top: 10, padding: 6, borderRadius: 9999 },
  err: { color: '#fca5a5', marginBottom: 8, fontWeight: '600' },
  cta: { marginTop: 6 },
  ctaGrad: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', columnGap: 8,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  help: { color: '#cbd5e1' },
  link: { color: '#22d3ee', fontWeight: '700' },
});
