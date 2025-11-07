// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationProp } from '@react-navigation/native';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Dot,
} from 'lucide-react-native';
import { Image } from "react-native";
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const goToMain = () => {
    navigation
      .getParent<NavigationProp<RootStackParamList>>() // parent = Root stack
      ?.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleLogin = () => {
    setErr('');
    if (!email || !pass) {
      setErr('Please enter email and password.');
      return;
    }
    // TODO: call your auth API; on success:
    goToMain();
  };

  return (
    <View style={s.container}>

      {/* Gradient Header */}
      <LinearGradient
        colors={['#ff5bbd', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.logoWrap}>
          <View style={s.logoTile}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
          </View>
        </View>
        <Text style={s.h1}>Welcome Back!</Text>
        <Text style={s.sub}>Continue your wellness journey</Text>
      </LinearGradient>

      {/* Card */}
      <View style={s.card}>
        {/* Email */}
        <Text style={s.label}>Email Address</Text>
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

        {/* Password */}
        <Text style={[s.label, { marginTop: 12 }]}>Password</Text>
        <View style={s.inputWrap}>
          <Lock size={18} color="#9aa4b2" />
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="Enter your password"
            placeholderTextColor="#a8b0bb"
            secureTextEntry={!show}
            style={s.input}
          />
          <Pressable onPress={() => setShow(v => !v)} hitSlop={12}>
            {show ? <EyeOff size={18} color="#9aa4b2" /> : <Eye size={18} color="#9aa4b2" />}
          </Pressable>
        </View>

        <Pressable onPress={() => {/* TODO: forgot flow */ }} style={s.forgotBtn}>
          <Text style={s.forgotText}>Forgot Password?</Text>
        </Pressable>

        {!!err && <Text style={s.err}>{err}</Text>}

        {/* Login CTA */}
        <Pressable onPress={handleLogin} style={{ marginTop: 6 }}>
          <LinearGradient
            colors={['#ff5bbd', '#8b5cf6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.loginGrad}
          >
            <Text style={s.loginText}>Login</Text>
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.divider} />
          <Text style={s.or}>or</Text>
          <View style={s.divider} />
        </View>

        {/* Social Buttons */}
        <View style={s.socialRow}>
          <Pressable onPress={() => { /* TODO */ }} style={[s.socialBtn, s.shadowLite]}>
            <View style={s.socialDot}><Dot size={12} color="#0ea5e9" /></View>
            <Text style={s.socialText}>Google</Text>
          </Pressable>
          <Pressable onPress={() => { /* TODO */ }} style={[s.socialBtn, s.shadowLite]}>
            <View style={s.socialDot}><Dot size={12} color="#2563eb" /></View>
            <Text style={s.socialText}>Facebook</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>
          Don’t have an account?
          <Text
            style={s.footerLink}
            onPress={() => navigation.navigate('Register')}
          > Sign Up</Text>
        </Text>

        <Text style={s.terms} numberOfLines={2}>
          By continuing, you agree to our <Text style={s.termsLink}>Terms</Text> &{' '}
          <Text style={s.termsLink}>Privacy Policy</Text>
        </Text>
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
    marginTop: -24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  label: { color: '#1f2937', fontWeight: '700', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, color: '#111827', paddingVertical: 2 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: '#ef4444', fontWeight: '700' },

  err: { color: '#b91c1c', fontWeight: '700', marginTop: 8 },

  loginGrad: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  loginText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginTop: 14,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  or: { color: '#6b7280', fontWeight: '700' },

  socialRow: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 12,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 8,
  },
  socialDot: {
    width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#eaf2ff',
  },
  socialText: { color: '#111827', fontWeight: '700' },
  shadowLite: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  footer: { alignItems: 'center', marginTop: 16, paddingHorizontal: 16 },
  footerText: { color: '#475569', fontWeight: '600' },
  footerLink: { color: '#ef3d8a', fontWeight: '800' },
  terms: { textAlign: 'center', color: '#94a3b8', marginTop: 8, fontSize: 12, lineHeight: 16 },
  termsLink: { color: '#6b21a8', fontWeight: '800' },
});
