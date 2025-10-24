// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState('');

  const valid = email && pass.length >= 6 && pass === confirm;

  const handleRegister = () => {
    setErr('');
    if (!email) return setErr('Please enter an email.');
    if (pass.length < 6) return setErr('Password must be at least 6 characters.');
    if (pass !== confirm) return setErr('Passwords do not match.');
    // TODO: call signup API; on success:
    navigation.replace('ProfileCreation', { email });
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#0ea5e9', '#8b5cf6']} style={s.header}>
        <Text style={s.headerTitle}>Create Account</Text>
        <Text style={s.headerSub}>Start your wellness journey</Text>
      </LinearGradient>

      <View style={s.form}>
        <View style={s.group}>
          <Text style={s.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
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
              value={pass}
              onChangeText={setPass}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!show1}
              style={[s.input, { paddingRight: 48 }]}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShow1(v => !v)}>
              {show1 ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </Pressable>
          </View>
        </View>

        <View style={s.group}>
          <Text style={s.label}>Confirm Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!show2}
              style={[s.input, { paddingRight: 48 }]}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShow2(v => !v)}>
              {show2 ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </Pressable>
          </View>
        </View>

        {!!err && <Text style={s.err}>{err}</Text>}

        <Pressable onPress={handleRegister} disabled={!valid} style={[s.cta, !valid && { opacity: 0.6 }]}>
          <LinearGradient colors={['#ec4899', '#8b5cf6']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.ctaGrad}>
            <Check size={18} color="#fff" />
            <Text style={s.ctaText}>Create Account</Text>
          </LinearGradient>
        </Pressable>

        <View style={s.rowCenter}>
          <Text style={s.help}>Already have an account?</Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={s.link}> Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 72, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  form: { padding: 20 },
  group: { marginBottom: 14 },
  label: { color: '#111827', fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#111827' },
  eyeBtn: { position: 'absolute', right: 12, top: 10, padding: 6, borderRadius: 9999 },
  err: { color: '#b91c1c', marginBottom: 8, fontWeight: '600' },
  cta: { marginTop: 6 },
  ctaGrad: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', columnGap: 8 },
  ctaText: { color: '#fff', fontWeight: '800' },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  help: { color: '#6b7280' },
  link: { color: '#8b5cf6', fontWeight: '700' },
});
