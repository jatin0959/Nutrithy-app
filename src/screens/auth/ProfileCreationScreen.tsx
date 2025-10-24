import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  User as UserIcon,
  Target,
  Activity,
  Utensils,
  Dumbbell,
  Brain,
  Moon,
  ChevronRight,
  Check,
  Wind,
  Bike,
  Droplets,
  Footprints,
  UtensilsCrossed,
  Mountain,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react-native';

type Props = {
  onComplete: () => void;
  logoUri?: string; // optional app logo
};

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
  { id: 'weight-loss', label: 'Weight Loss', icon: Target, color: ['#f472b6', '#f43f5e'], description: 'Shed those extra pounds' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: Dumbbell, color: ['#fb923c', '#ef4444'], description: 'Build strength & muscle' },
  { id: 'mental-wellness', label: 'Mental Wellness', icon: Brain, color: ['#a78bfa', '#6366f1'], description: 'Peace of mind' },
  { id: 'better-sleep', label: 'Better Sleep', icon: Moon, color: ['#60a5fa', '#6366f1'], description: 'Quality rest' },
  { id: 'more-energy', label: 'More Energy', icon: Zap, color: ['#facc15', '#fb923c'], description: 'Stay active all day' },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: ['#34d399', '#10b981'], description: 'Eat healthier' },
];

const interests = [
  { id: 'yoga', label: 'Yoga', icon: Wind, color: ['#a78bfa', '#ec4899'] },
  { id: 'running', label: 'Running', icon: Footprints, color: ['#60a5fa', '#06b6d4'] },
  { id: 'gym', label: 'Gym', icon: Dumbbell, color: ['#f87171', '#fb923c'] },
  { id: 'cycling', label: 'Cycling', icon: Bike, color: ['#34d399', '#10b981'] },
  { id: 'swimming', label: 'Swimming', icon: Droplets, color: ['#22d3ee', '#60a5fa'] },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: ['#818cf8', '#a78bfa'] },
  { id: 'cooking', label: 'Healthy Cooking', icon: UtensilsCrossed, color: ['#fb923c', '#f59e0b'] },
  { id: 'hiking', label: 'Hiking', icon: Mountain, color: ['#2dd4bf', '#22c55e'] },
];

export default function ProfileCreationScreen({ onComplete, logoUri }: Props) {
  const [step, setStep] = useState(1);
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

  const progressPct = (step / TOTAL_STEPS) * 100;

  const toggleSelection = (key: 'goals' | 'interests', value: string) => {
    const arr = profile[key];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    setProfile({ ...profile, [key]: next });
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onComplete();
  };
  const handleBack = () => step > 1 && setStep(step - 1);

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

  return (
    <View style={s.container}>
      {/* Header + Progress */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.brandRow}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={s.logo} />
            ) : (
              <View style={[s.logo, s.logoFallback]} />
            )}
            <Text style={s.headerTitle}>Create Profile</Text>
          </View>
          <Text style={s.stepText}>Step {step}/{TOTAL_STEPS}</Text>
        </View>

        <View style={s.progressTrack}>
          <LinearGradient
            colors={['#ec4899', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[s.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <View style={s.stepWrap}>
            <View style={s.stepHero}>
              <LinearGradient colors={['#ec4899', '#8b5cf6']} style={s.heroCircle}>
                <UserIcon size={36} color="#fff" />
              </LinearGradient>
              <Text style={s.h2}>Let's get to know you!</Text>
              <Text style={s.muted}>Tell us a bit about yourself</Text>
            </View>

            <View style={s.group}>
              <Text style={s.label}>What's your name?</Text>
              <TextInput
                value={profile.name}
                onChangeText={(t) => setProfile({ ...profile, name: t })}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                style={s.input}
              />
            </View>

            <View style={s.group}>
              <Text style={s.label}>How old are you?</Text>
              <TextInput
                value={profile.age}
                onChangeText={(t) => setProfile({ ...profile, age: t })}
                placeholder="Your age"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                style={s.input}
              />
            </View>

            <View style={s.group}>
              <Text style={s.label}>Gender</Text>
              <View style={s.grid3}>
                {['Male', 'Female', 'Other'].map((g) => {
                  const active = profile.gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setProfile({ ...profile, gender: g })}
                      style={[s.pill, active ? s.pillActive : s.pillInactive]}
                    >
                      <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: Physical Stats */}
        {step === 2 && (
          <View style={s.stepWrap}>
            <View style={s.stepHero}>
              <LinearGradient colors={['#fb923c', '#ef4444']} style={s.heroCircle}>
                <Activity size={36} color="#fff" />
              </LinearGradient>
              <Text style={s.h2}>Your body metrics</Text>
              <Text style={s.muted}>Help us personalize your journey</Text>
            </View>

            <View style={s.group}>
              <Text style={s.label}>Weight (kg)</Text>
              <View style={s.inputWrap}>
                <TextInput
                  value={profile.weight}
                  onChangeText={(t) => setProfile({ ...profile, weight: t })}
                  placeholder="Enter your weight"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  style={[s.input, { paddingRight: 40 }]}
                />
                <Text style={s.suffix}>kg</Text>
              </View>
            </View>

            <View style={s.group}>
              <Text style={s.label}>Height (cm)</Text>
              <View style={s.inputWrap}>
                <TextInput
                  value={profile.height}
                  onChangeText={(t) => setProfile({ ...profile, height: t })}
                  placeholder="Enter your height"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  style={[s.input, { paddingRight: 40 }]}
                />
                <Text style={s.suffix}>cm</Text>
              </View>
            </View>

            {bmi && (
              <View style={s.bmiCard}>
                <View>
                  <Text style={s.muted}>Your BMI</Text>
                  <Text style={s.bmiValue}>{bmi}</Text>
                </View>
                <View style={s.bmiIconWrap}>
                  <Target size={32} color="#fb923c" />
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <View style={s.stepWrap}>
            <View style={s.stepHero}>
              <LinearGradient colors={['#22c55e', '#10b981']} style={s.heroCircle}>
                <Trophy size={36} color="#fff" />
              </LinearGradient>
              <Text style={s.h2}>What are your goals?</Text>
              <Text style={s.muted}>Select all that apply</Text>
            </View>

            <View style={s.grid2}>
              {goals.map((g) => {
                const selected = profile.goals.includes(g.id);
                const Icon = g.icon;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleSelection('goals', g.id)}
                    style={[s.card, selected ? s.cardSelectedGreen : null]}
                  >
                    <LinearGradient colors={g.color} style={s.goalIconBox}>
                      <Icon size={24} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, selected ? s.cardTitleGreen : null]}>{g.label}</Text>
                      <Text style={s.cardSub}>{g.description}</Text>
                    </View>
                    {selected && (
                      <View style={s.tickGreen}>
                        <Check size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <View style={s.stepWrap}>
            <View style={s.stepHero}>
              <LinearGradient colors={['#3b82f6', '#6366f1']} style={s.heroCircle}>
                <Sparkles size={36} color="#fff" />
              </LinearGradient>
              <Text style={s.h2}>Your interests</Text>
              <Text style={s.muted}>We'll connect you with like-minded people</Text>
            </View>

            <View style={s.grid2}>
              {interests.map((it) => {
                const selected = profile.interests.includes(it.id);
                const Icon = it.icon;
                return (
                  <Pressable
                    key={it.id}
                    onPress={() => toggleSelection('interests', it.id)}
                    style={[s.cardCenter, selected ? s.cardSelectedPurple : null]}
                  >
                    <LinearGradient colors={it.color} style={s.interestIconBox}>
                      <Icon size={28} color="#fff" />
                    </LinearGradient>
                    <Text style={[s.interestLabel, selected ? s.interestLabelPurple : null]}>
                      {it.label}
                    </Text>
                    {selected && (
                      <View style={s.tickPurple}>
                        <Check size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 5: Lifestyle */}
        {step === 5 && (
          <View style={s.stepWrap}>
            <View style={s.stepHero}>
              <LinearGradient colors={['#8b5cf6', '#ec4899']} style={s.heroCircle}>
                <Heart size={36} color="#fff" />
              </LinearGradient>
              <Text style={s.h2}>Lifestyle preferences</Text>
              <Text style={s.muted}>Almost done! Just a few more details</Text>
            </View>

            {/* Diet */}
            <View style={s.group}>
              <Text style={s.label}>Diet Preference</Text>
              <View style={s.grid2}>
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto'].map((diet) => {
                  const active = profile.dietPreference === diet;
                  return (
                    <Pressable
                      key={diet}
                      onPress={() => setProfile({ ...profile, dietPreference: diet })}
                      style={[s.pillBig, active ? s.pillGradPink : s.pillOutline]}
                    >
                      <Text style={[s.pillBigText, active ? s.pillBigTextActive : s.pillBigTextInactive]}>
                        {diet}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Activity level */}
            <View style={s.group}>
              <Text style={s.label}>Activity Level</Text>
              <View style={{ rowGap: 8 }}>
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
                      style={[s.activityRow, active ? s.activityRowActive : s.activityRowInactive]}
                    >
                      <Text style={[s.activityTitle, active ? { color: '#fff' } : null]}>{a.value}</Text>
                      <Text style={[s.activityDesc, active ? { color: 'rgba(255,255,255,0.85)' } : null]}>{a.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Sleep */}
            <View style={s.group}>
              <Text style={s.label}>Average Sleep (hours)</Text>
              <View style={s.grid4}>
                {['4-5', '6-7', '7-8', '8+'].map((h) => {
                  const active = profile.sleepHours === h;
                  return (
                    <Pressable
                      key={h}
                      onPress={() => setProfile({ ...profile, sleepHours: h })}
                      style={[s.pill, active ? s.pillGradPink : s.pillOutline]}
                    >
                      <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>{h}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={s.footer}>
        <View style={{ flexDirection: 'row', columnGap: 12 }}>
          {step > 1 && (
            <Pressable onPress={handleBack} style={s.btnBack}>
              <Text style={s.btnBackText}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleNext}
            disabled={!canProceed}
            style={[s.btnNext, !canProceed ? s.btnNextDisabled : null]}
          >
            <Text style={[s.btnNextText, !canProceed ? { color: '#9ca3af' } : null]}>
              {step === TOTAL_STEPS ? 'Complete' : 'Continue'}
            </Text>
            <ChevronRight size={20} color={canProceed ? '#fff' : '#9ca3af'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const CARD_RADIUS = 18;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 24, height: 24, borderRadius: 6, marginRight: 8 },
  logoFallback: { backgroundColor: '#f3f4f6' },
  headerTitle: { fontWeight: '700', color: '#111827', fontSize: 16 },
  stepText: { color: '#4b5563', fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' },
  progressFill: { height: '100%' },

  stepWrap: { rowGap: 14 },
  stepHero: { alignItems: 'center', marginBottom: 8 },
  heroCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 5,
    marginBottom: 12,
  },
  h2: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  muted: { color: '#6b7280' },

  group: { rowGap: 8, marginTop: 4 },
  label: { color: '#111827', fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12, color: '#111827', fontSize: 14,
  },
  inputWrap: { position: 'relative' },
  suffix: { position: 'absolute', right: 12, top: 12, color: '#9ca3af', fontWeight: '600' },

  // Pills
  pill: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  pillTextInactive: { color: '#374151' },
  pillInactive: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb' },
  pillGradPink: { backgroundColor: '#ec4899' },
  pillActive: { backgroundColor: '#ec4899' },

  grid3: { flexDirection: 'row', columnGap: 8, justifyContent: 'space-between' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12 },
  grid4: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8 },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: CARD_RADIUS, padding: 12, alignItems: 'center', flexDirection: 'row',
    borderWidth: 2, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    width: '48%',
  },
  cardSelectedGreen: { borderColor: '#34d399', backgroundColor: '#ecfdf5' },
  goalIconBox: {
    width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: { fontWeight: '700', color: '#111827' },
  cardTitleGreen: { color: '#065f46' },
  cardSub: { fontSize: 12, color: '#6b7280' },
  tickGreen: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#34d399', alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: 8, right: 8,
  },

  cardCenter: {
    backgroundColor: '#fff', borderRadius: CARD_RADIUS, padding: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#e5e7eb', width: '48%',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  cardSelectedPurple: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
  interestIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  interestLabel: { fontWeight: '600', color: '#374151' },
  interestLabelPurple: { color: '#7c3aed' },
  tickPurple: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: 8, right: 8,
  },

  // Big pills / activity rows
  pillBig: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', width: '48%' },
  pillBigText: { fontWeight: '700' },
  pillBigTextActive: { color: '#fff' },
  pillBigTextInactive: { color: '#374151' },
  pillOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb' },

  activityRow: { borderRadius: 14, padding: 12, borderWidth: 2 },
  activityRowInactive: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  activityRowActive: { borderColor: '#7c3aed', backgroundColor: '#7c3aed' },
  activityTitle: { fontWeight: '700', color: '#111827', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#6b7280' },

  // BMI
  bmiCard: {
    backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 2, padding: 16, borderRadius: CARD_RADIUS,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bmiValue: { fontSize: 28, fontWeight: '800', color: '#fb923c' },
  bmiIconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },

  // Footer
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  btnBack: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16 },
  btnBackText: { color: '#374151', fontWeight: '700' },
  btnNext: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8,
    backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 14,
  },
  btnNextDisabled: { backgroundColor: '#e5e7eb' },
  btnNextText: { color: '#fff', fontWeight: '800' },
});
