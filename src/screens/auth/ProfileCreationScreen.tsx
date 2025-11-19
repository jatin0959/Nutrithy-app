// src/screens/auth/ProfileCreationScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User as UserIcon,
  Activity,
  Target,
  Heart,
  Brain,
  Dumbbell,
  Moon,
  Wind,
  Bike,
  Droplets,
  Footprints,
  Utensils,
  UtensilsCrossed,
  Mountain,
  Sparkles,
  Trophy,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import {
  useNavigation,
  NavigationProp,
  CommonActions,
} from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/AppNavigator';
import { updateProfile } from '../../api/profile';

type Profile = {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  goals: string[];
  interests: string[];
  dietPreference: string;
  activityLevel: string;
  sleepHours: string;
};

const TOTAL_STEPS = 5;

const goals = [
  { id: 'weight-loss', label: 'Weight Loss', icon: Target, color: ['#ec4899', '#f97316'], description: 'Shed those extra pounds' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: Dumbbell, color: ['#fb923c', '#ef4444'], description: 'Build strength & muscle' },
  { id: 'mental-wellness', label: 'Mental Wellness', icon: Brain, color: ['#a78bfa', '#6366f1'], description: 'Peace of mind' },
  { id: 'better-sleep', label: 'Better Sleep', icon: Moon, color: ['#60a5fa', '#6366f1'], description: 'Quality rest' },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: ['#34d399', '#10b981'], description: 'Eat healthier' },
  { id: 'More Energy', label: 'More Energy', icon: Activity, color: ['#fbbf24', '#f59e0b'], description: 'Feel more active' },
];

const interests = [
  { id: 'yoga', label: 'Yoga', icon: Wind, color: ['#ec4899', '#8b5cf6'] },
  { id: 'running', label: 'Running', icon: Footprints, color: ['#38bdf8', '#06b6d4'] },
  { id: 'gym', label: 'Gym', icon: Dumbbell, color: ['#fb7185', '#fb923c'] },
  { id: 'cycling', label: 'Cycling', icon: Bike, color: ['#2dd4bf', '#22c55e'] },
  { id: 'swimming', label: 'Swimming', icon: Droplets, color: ['#22d3ee', '#60a5fa'] },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: ['#818cf8', '#a78bfa'] },
  { id: 'cooking', label: 'Healthy Cooking', icon: UtensilsCrossed, color: ['#fb923c', '#f59e0b'] },
  { id: 'hiking', label: 'Hiking', icon: Mountain, color: ['#2dd4bf', '#22c55e'] },
];

export default function ProfileCreationScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    goals: [],
    interests: [],
    dietPreference: '',
    activityLevel: '',
    sleepHours: '',
  });

  // 👇 EXACT SAME PATTERN AS LoginScreen.goToMain
  const goToMain = () => {
    const rootNav = navigation.getParent<NavigationProp<RootStackParamList>>();
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const handleSkip = () => {
    goToMain();
  };

  const progressPct = (step / TOTAL_STEPS) * 100;

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!(profile.name && profile.age && profile.gender);
      case 2: return !!(profile.weight && profile.height);
      case 3: return profile.goals.length > 0;
      case 4: return profile.interests.length > 0;
      case 5: return !!(profile.dietPreference && profile.activityLevel && profile.sleepHours);
      default: return false;
    }
  }, [step, profile]);

  const bmi = useMemo(() => {
    if (!profile.weight || !profile.height) return null;
    const kg = parseFloat(profile.weight);
    const m = parseFloat(profile.height) / 100;
    if (!kg || !m) return null;
    return (kg / (m * m)).toFixed(1);
  }, [profile.weight, profile.height]);

  const toggleSelection = (key: 'goals' | 'interests', value: string) => {
    const arr = profile[key];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    setProfile({ ...profile, [key]: next });
  };

  const handleBack = () => step > 1 && !saving && setStep(step - 1);

  const handleComplete = async () => {
    try {
      setSaving(true);
      setSaveError('');

      const payload = {
        name: profile.name,
        age: profile.age ? Number(profile.age) : undefined,
        gender: profile.gender || undefined,
        weight: profile.weight ? Number(profile.weight) : undefined,
        height: profile.height ? Number(profile.height) : undefined,
        goals: profile.goals,
        interests: profile.interests,
        dietPreference: profile.dietPreference || undefined,
        activityLevel: profile.activityLevel || undefined,
        sleepHours: profile.sleepHours || undefined,
        wizardCompleted: true,
      };

      await updateProfile(payload);

      // ✅ After successful save, go to Main (root stack)
      goToMain();
    } catch (error: any) {
      console.log('[PROFILE_SAVE_ERROR]', error?.response?.data || error.message);
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to save profile. Please try again.';
      setSaveError(msg);
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  /** Gradient primary button */
  const PrimaryCTA = ({ text }: { text: string }) => (
    <LinearGradient
      colors={['#7c3aed', '#ec4899']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.ctaGrad}
    >
      <Text style={styles.ctaText}>{text}</Text>
      <ChevronRight size={18} color="#fff" />
    </LinearGradient>
  );

  /** Gradient pill (for active chips) */
  const GradientChip: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
    <LinearGradient
      colors={['#8b5cf6', '#ec4899']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.gradChipBase, style]}
    >
      {children}
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* App bar */}
        <View style={styles.appbar}>
          <View style={styles.appbarLeft}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.appLogo}
            />
            <Text style={styles.appTitle}>Create Profile</Text>
          </View>

          <Pressable onPress={handleSkip} disabled={saving}>
            <Text style={[styles.skip, saving && { opacity: 0.5 }]}>Skip</Text>
          </Pressable>
        </View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#ec4899', '#8b5cf6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>


        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* STEP 1 */}
          {step === 1 && (
            <View style={styles.card}>
              <LinearGradient colors={['#ec4899', '#8b5cf6']} style={styles.hero}>
                <UserIcon size={28} color="#fff" />
              </LinearGradient>

              <Text style={styles.title}>Let's get to know you!</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

              <Text style={styles.label}>What's your name?</Text>
              <TextInput
                value={profile.name}
                onChangeText={(t) => setProfile({ ...profile, name: t })}
                placeholder="What should we call you?"
                placeholderTextColor="#9aa4b2"
                style={styles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>How old are you?</Text>
              <TextInput
                value={profile.age}
                onChangeText={(t) => setProfile({ ...profile, age: t })}
                placeholder="Your age"
                placeholderTextColor="#9aa4b2"
                keyboardType="number-pad"
                style={styles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => {
                  const active = profile.gender === g;
                  if (active) {
                    return (
                      <Pressable key={g} onPress={() => setProfile({ ...profile, gender: g })} style={{ flex: 1 }}>
                        <GradientChip style={{ borderRadius: 14 }}>
                          <Text style={[styles.genderText, { color: '#fff' }]}>{g}</Text>
                        </GradientChip>
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setProfile({ ...profile, gender: g })}
                      style={[styles.genderChip]}
                    >
                      <Text style={[styles.genderText, { color: '#334155' }]}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <View style={styles.card}>
              <LinearGradient colors={['#ff7a3d', '#ff3d6e']} style={styles.hero}>
                <Activity size={28} color="#fff" />
              </LinearGradient>

              <Text style={styles.title}>Your body metrics</Text>
              <Text style={styles.subtitle}>Help us personalize your journey</Text>

              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.affixWrap}>
                <TextInput
                  value={profile.weight}
                  onChangeText={(t) => setProfile({ ...profile, weight: t })}
                  placeholder="72"
                  placeholderTextColor="#9aa4b2"
                  keyboardType="decimal-pad"
                  style={[styles.input, { paddingRight: 46 }]}
                />
                <Text style={styles.affix}>kg</Text>
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>Height (cm)</Text>
              <View style={styles.affixWrap}>
                <TextInput
                  value={profile.height}
                  onChangeText={(t) => setProfile({ ...profile, height: t })}
                  placeholder="162"
                  placeholderTextColor="#9aa4b2"
                  keyboardType="decimal-pad"
                  style={[styles.input, { paddingRight: 46 }]}
                />
                <Text style={styles.affix}>cm</Text>
              </View>

              {bmi && (
                <View style={styles.bmiCard}>
                  <View>
                    <Text style={styles.bmiLabel}>Your BMI</Text>
                    <Text style={styles.bmiValue}>{bmi}</Text>
                  </View>
                  <View style={styles.bmiBadge}>
                    <Target size={20} color="#ff7a3d" />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <View style={styles.card}>
              <LinearGradient colors={['#22c55e', '#10b981']} style={styles.hero}>
                <Trophy size={28} color="#fff" />
              </LinearGradient>

              <Text style={styles.title}>Let’s personalize your plan</Text>
              <Text style={styles.subtitle}>Select all that apply</Text>

              <View style={styles.grid2}>
                {goals.map((g) => {
                  const selected = profile.goals.includes(g.id);
                  const Icon = g.icon;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => toggleSelection('goals', g.id)}
                      style={[styles.goalCard, selected && styles.goalCardSel]}
                    >
                      <LinearGradient colors={g.color} style={styles.goalIcon}>
                        <Icon size={20} color="#fff" />
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.goalTitle, selected && { color: '#065f46' }]}>{g.label}</Text>
                        <Text style={styles.goalSub}>{g.description}</Text>
                      </View>
                      {selected && <View style={styles.tickGreen}><Check size={12} color="#fff" /></View>}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <View style={styles.card}>
              <LinearGradient colors={['#60a5fa', '#818cf8']} style={styles.hero}>
                <Sparkles size={28} color="#fff" />
              </LinearGradient>

              <Text style={styles.title}>Your interests</Text>
              <Text style={styles.subtitle}>We’ll connect you with like-minded people</Text>

              <View style={styles.grid2}>
                {interests.map((it) => {
                  const selected = profile.interests.includes(it.id);
                  const Icon = it.icon;
                  return (
                    <Pressable
                      key={it.id}
                      onPress={() => toggleSelection('interests', it.id)}
                      style={[styles.intCard, selected && styles.intCardSel]}
                    >
                      <LinearGradient colors={it.color} style={styles.intIcon}>
                        <Icon size={22} color="#fff" />
                      </LinearGradient>
                      <Text style={[styles.intText, selected && { color: '#7c3aed' }]}>{it.label}</Text>
                      {selected && <View style={styles.tickPurple}><Check size={12} color="#fff" /></View>}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <View style={styles.card}>
              <LinearGradient colors={['#ec4899', '#8b5cf6']} style={styles.hero}>
                <Heart size={28} color="#fff" />
              </LinearGradient>

              <Text style={styles.title}>Lifestyle preferences</Text>
              <Text style={styles.subtitle}>Almost done! Just a few more details</Text>

              <Text style={styles.label}>Diet Preference</Text>
              <View style={styles.grid2}>
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto'].map((d) => {
                  const active = profile.dietPreference === d;
                  return active ? (
                    <Pressable key={d} onPress={() => setProfile({ ...profile, dietPreference: d })} style={{ width: '48%' }}>
                      <GradientChip>
                        <Text style={{ color: '#fff', fontWeight: '800' }}>{d}</Text>
                      </GradientChip>
                    </Pressable>
                  ) : (
                    <Pressable
                      key={d}
                      onPress={() => setProfile({ ...profile, dietPreference: d })}
                      style={styles.choiceChip}
                    >
                      <Text style={{ color: '#374151', fontWeight: '800' }}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>Activity Level</Text>
              <View style={{ rowGap: 10 }}>
                {[
                  { value: 'Sedentary', desc: 'Little or no exercise' },
                  { value: 'Moderate', desc: 'Exercise 3-4 times/week' },
                  { value: 'Active', desc: 'Exercise 5+ times/week' },
                ].map((a) => {
                  const active = profile.activityLevel === a.value;
                  return (
                    <Pressable
                      key={a.value}
                      onPress={() => setProfile({ ...profile, activityLevel: a.value })}
                      style={[styles.activityRow, active && styles.activityRowActive]}
                    >
                      <Text style={[styles.activityTitle, active && { color: '#fff' }]}>{a.value}</Text>
                      <Text style={[styles.activityDesc, active && { color: 'rgba(255,255,255,0.9)' }]}>{a.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>Average Sleep (hours)</Text>
              <View style={styles.grid4}>
                {['4-5', '6-7', '7-8', '8+'].map((h) => {
                  const active = profile.sleepHours === h;
                  return active ? (
                    <GradientChip key={h}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>{h}</Text>
                    </GradientChip>
                  ) : (
                    <Pressable key={h} onPress={() => setProfile({ ...profile, sleepHours: h })} style={styles.sleepChip}>
                      <Text style={{ color: '#374151', fontWeight: '800' }}>{h}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {!!saveError && (
            <Text style={{ color: '#b91c1c', fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
              {saveError}
            </Text>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            disabled={step === 1 || saving}
            onPress={handleBack}
            style={[styles.backBtn, (step === 1 || saving) && { opacity: 0.6 }]}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Pressable
            disabled={!canProceed || saving}
            onPress={handleNext}
            style={{ flex: 1 }}
          >
            {canProceed ? (
              <PrimaryCTA text={saving ? 'Saving...' : step === TOTAL_STEPS ? 'Complete' : 'Continue'} />
            ) : (
              <View style={styles.ctaDisabled}>
                <Text style={[styles.ctaText, { color: '#9aa4b2' }]}>
                  {step === TOTAL_STEPS ? 'Complete' : 'Continue'}
                </Text>
                <ChevronRight size={18} color="#9aa4b2" />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const R = 18;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7fb' },
  container: { flex: 1, backgroundColor: '#f7f7fb' },

  /** Appbar (matches mockup proportions) */
  appbar: {
    paddingTop: Platform.select({ ios: 14, android: 12 }), // adds breathing space under status bar
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e9e8f2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64, // fixed consistent bar height
  },

  appbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  appLogo: {
    width: 28,   // slightly wider, more rectangular
    height: 28,  // balanced height (was too tall before)
    borderRadius: 6,
    resizeMode: 'contain',
  },

  appTitle: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: 17,
    letterSpacing: 0.3,
  },

  skip: {
    color: '#6b7280',
    fontWeight: '700',
    fontSize: 15,
  },

  /** Progress */
  progressTrack: {
    height: 6,
    backgroundColor: '#eceff4',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },

  /** Section card */
  card: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eceaf4',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  /** Hero badge */
  hero: {
    width: 86, height: 86, borderRadius: 43, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 4,
    marginBottom: 12,
  },

  /** Headings */
  title: { textAlign: 'center', fontSize: 24, lineHeight: 30, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  subtitle: { textAlign: 'center', color: '#838aa3', marginTop: 6, marginBottom: 14, fontWeight: '600' },

  /** Labels & Inputs */
  label: { color: '#0f172a', fontWeight: '800', marginBottom: 8, fontSize: 15 },
  input: {
    height: 54,
    backgroundColor: '#fff',
    borderColor: '#e6e6ef',
    borderWidth: 1.5,
    borderRadius: R,
    paddingHorizontal: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  affixWrap: { position: 'relative' },
  affix: { position: 'absolute', right: 16, top: 15, color: '#9aa4b2', fontWeight: '700' },

  /** Gender pills */
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  genderChip: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e6e6ef',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  genderText: { fontWeight: '800' },

  /** Small gradient chip base (for active pills) */
  gradChipBase: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  /** Goals (grid, icon above text, matches mockup) */
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  goalCard: {
    width: '47.5%',
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e6e6ef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,

    // Soft shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      },
      android: {
        elevation: 3,
      },
    }),
  },

  goalCardSel: {
    backgroundColor: '#ecfdf5',
    borderColor: '#22c55e',
  },

  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // spacing below icon
  },

  goalTitle: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },

  goalSub: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  tickGreen: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },



  /** Interests */
  intCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e6e6ef',
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  intCardSel: { backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' },
  intIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  intText: { fontWeight: '800', color: '#374151' },
  tickPurple: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#8b5cf6',
    alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 8, top: 8,
  },

  /** Lifestyle chips/rows */
  choiceChip: {
    width: '48%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e6e6ef',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRow: {
    borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#e6e6ef', backgroundColor: '#fff',
  },
  activityRowActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  activityTitle: { fontWeight: '900', color: '#111827', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#6b7280' },
  grid4: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  sleepChip: {
    height: 46, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#e6e6ef', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },

  /** BMI card */
  bmiCard: {
    borderWidth: 2, borderColor: '#fed7aa', backgroundColor: '#fff7ed',
    padding: 14, borderRadius: 16, marginTop: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  bmiLabel: { color: '#9a6a3a', fontWeight: '700' },
  bmiValue: { color: '#fb923c', fontWeight: '900', fontSize: 28 },
  bmiBadge: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },

  /** Footer */
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eceaf4',
    flexDirection: 'row', gap: 12, alignItems: 'center',
  },
  backBtn: { paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#eef2f7', borderRadius: 16 },
  backText: { color: '#374151', fontWeight: '900' },

  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 16, paddingVertical: 14,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 10 }, elevation: 5,
  },
  ctaDisabled: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 16, paddingVertical: 14, backgroundColor: '#eceff4',
  },
  ctaText: { color: '#fff', fontWeight: '900' },
});

