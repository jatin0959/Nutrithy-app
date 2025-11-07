// src/screens/auth/RegisterScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // optional
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState('');

  // Phone is optional; button turns active when required fields are valid
  const valid = useMemo(
    () => !!name && !!email && pass.length >= 6 && pass === confirm,
    [name, email, pass, confirm]
  );

  const handleRegister = () => {
    setErr('');
    if (!name) return setErr('Please enter your full name.');
    if (!email) return setErr('Please enter an email.');
    if (pass.length < 6) return setErr('Password must be at least 6 characters.');
    if (pass !== confirm) return setErr('Passwords do not match.');
    // TODO: call signup API; on success:
    navigation.replace('ProfileCreation', { email });
  };

  return (
    <View style={s.container}>
      {/* Gradient Header */}
      <LinearGradient colors={['#ff5bbd', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.logoWrap}>
          <View style={s.logoTile}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 42, height: 42, resizeMode: 'contain' }}
            />
          </View>
        </View>
        <Text style={s.h1}>Create Account</Text>
        <Text style={s.sub}>Start your wellness journey today</Text>
      </LinearGradient>

      {/* Card */}
      <View style={s.card}>
        {/* Full Name */}
        <Text style={s.label}>Full Name</Text>
        <View style={s.inputWrap}>
          <User size={18} color="#9aa4b2" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#a8b0bb"
            style={s.input}
          />
        </View>

        {/* Email */}
        <Text style={[s.label, { marginTop: 12 }]}>Email Address</Text>
        <View style={s.inputWrap}>
          <Mail size={18} color="#9aa4b2" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            placeholderTextColor="#a8b0bb"
            autoCapitalize="none"
            keyboardType="email-address"
            style={s.input}
          />
        </View>

        {/* Phone (Optional) */}
        <View style={s.rowBetween}>
          <Text style={[s.label, { marginTop: 12 }]}>Phone Number</Text>
          <Text style={s.optional}>(Optional)</Text>
        </View>
        <View style={s.inputWrap}>
          <Phone size={18} color="#9aa4b2" />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="#a8b0bb"
            keyboardType="phone-pad"
            style={s.input}
          />
        </View>

        {/* Password */}
        <Text style={[s.label, { marginTop: 12 }]}>Password</Text>
        <View style={s.inputWrap}>
          <Lock size={18} color="#9aa4b2" />
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="Create a strong password"
            placeholderTextColor="#a8b0bb"
            secureTextEntry={!show1}
            style={s.input}
          />
          <Pressable onPress={() => setShow1(v => !v)} hitSlop={12}>
            {show1 ? <EyeOff size={18} color="#9aa4b2" /> : <Eye size={18} color="#9aa4b2" />}
          </Pressable>
        </View>

        {/* Confirm Password */}
        <Text style={[s.label, { marginTop: 12 }]}>Confirm Password</Text>
        <View style={s.inputWrap}>
          <Lock size={18} color="#9aa4b2" />
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter your password"
            placeholderTextColor="#a8b0bb"
            secureTextEntry={!show2}
            style={s.input}
          />
          <Pressable onPress={() => setShow2(v => !v)} hitSlop={12}>
            {show2 ? <EyeOff size={18} color="#9aa4b2" /> : <Eye size={18} color="#9aa4b2" />}
          </Pressable>
        </View>

        {!!err && <Text style={s.err}>{err}</Text>}

        {/* Create Account CTA */}
        <Pressable onPress={handleRegister} disabled={!valid} style={{ marginTop: 14 }}>
          {valid ? (
            <LinearGradient
              colors={['#ff5bbd', '#8b5cf6']}   // same as Login screen
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.ctaGrad}
            >
              <Text style={s.ctaText}>Create Account</Text>
            </LinearGradient>
          ) : (
            <View style={[s.ctaDisabled, s.shadowBtn]}>
              <Text style={[s.ctaText, { color: '#9aa4b2' }]}>Create Account</Text>
            </View>
          )}
        </Pressable>

        {/* Switch to Login */}
        <View style={s.switchRow}>
          <Text style={s.switchText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={s.switchLink}> Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const CARD_RADIUS = 18;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },

  header: {
    paddingTop: Platform.select({ ios: 72, android: 56 }),
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoWrap: { alignItems: 'center', marginBottom: 10 },
  logoTile: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  h1: { textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { textAlign: 'center', color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },

  card: {
    marginTop: -24, backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: CARD_RADIUS, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  label: { color: '#1f2937', fontWeight: '700', marginBottom: 8 },
  optional: { color: '#9aa4b2', fontWeight: '600', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { flex: 1, color: '#111827', paddingVertical: 2 },

  err: { color: '#b91c1c', fontWeight: '700', marginTop: 8 },

  ctaGrad: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 5,
  },
  ctaDisabled: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#eef1f6',
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  shadowBtn: {
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  switchText: { color: '#6b7280', fontWeight: '600' },
  switchLink: { color: '#8b5cf6', fontWeight: '800' },
});
