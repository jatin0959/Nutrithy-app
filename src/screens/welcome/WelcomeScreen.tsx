// src/screens/welcome/WelcomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ViewStyle, ImageStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated,
{
  FadeIn,
  FadeInUp,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Heart, Sparkles, Users, Trophy, ArrowRight } from 'lucide-react-native';
type RootStackParamList = { Register: undefined; Auth: undefined };


const { width: W, height: H } = Dimensions.get('window');
const STORAGE_KEY = 'hasLaunched_v2';

/** ---------- Responsive helpers (NOT used inside worklets) ---------- */
const clampVal = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const sw = (fraction: number, min: number, max: number) =>
  clampVal(W * fraction, min, max);

const TOP_SAFE = Platform.select({ ios: 54, android: 26 }) ?? 26;

// Typography
const FS_H1 = clampVal(W * 0.11, 36, 52);
const LH_H1 = FS_H1 + 4;
const FS_H2 = clampVal(W * 0.045, 15, 20);
const FS_BODY = clampVal(W * 0.037, 13, 16);
const FS_CTA = clampVal(W * 0.04, 14, 17);

// Progress (length/height/gaps precomputed constants)
const PROG_H = clampVal(W * 0.007, 3, 4);
const PROG_GAP = clampVal(W * 0.036, 10, 18);
const PROG_ACTIVE_W = sw(0.18, 52, 82);
const PROG_INACTIVE_W = sw(0.07, 22, 34);

type Slide = {
  id: number;
  bg: any;
  tag: string;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  body: string;
  darken?: number;
};

const SLIDES: Slide[] = [
  {
    id: 1,
    bg: require('../../assets/images/wel1.png'),
    icon: Heart,
    tag: 'Welcome to',
    title: 'Nutrithy',
    subtitle: 'Your Complete Wellness Platform',
    body:
      'Experience a holistic approach to health, with nutrition guidance, community support, and personalized wellness tracking.',
  },
  {
    id: 2,
    bg: require('../../assets/images/wel2.png'),
    icon: Sparkles,
    tag: 'Experience',
    title: 'Wellness\nRedefined',
    subtitle: 'A New Approach to Health',
    body:
      'Move beyond traditional wellness programs. Discover personalized nutrition, mindful practices, and sustainable lifestyle changes.',
  },
  {
    id: 3,
    bg: require('../../assets/images/wel3.png'),
    icon: Users,
    tag: 'Join & Connect',
    title: 'Thrive',
    subtitle: "Together We're Stronger",
    body:
      'Connect with a community of wellness enthusiasts. Share your journey, inspire others, and celebrate milestones together.',
  },
  {
    id: 4,
    bg: require('../../assets/images/wel4.png'),
    icon: Trophy,
    tag: 'Compete & Win',
    title: 'Challenges',
    subtitle: 'Push Your Limits Daily',
    body:
      'Take on exciting wellness challenges, earn rewards, and track your progress. Transform healthy habits into fun achievements.',
    darken: 0.2,
  },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [index, setIndex] = useState(0);

  const x = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => (x.value = e.contentOffset.x),
  });

  const onMomentumEnd = (e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    setIndex(i);
  };

  const goRegister = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    navigation.navigate('Auth');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      // @ts-ignore
      scrollRef.current?.scrollTo({ x: (index + 1) * W, animated: true });
    } else {
      goRegister();
    }
  };

  /** ---------- Subcomponents ---------- */
  const CTAArrow = () => {
    const tx = useSharedValue(0);
    const aStyle = useAnimatedStyle<ViewStyle>(() => ({
      transform: [{ translateX: tx.value }],
    }));
    return (
      <Pressable
        onPressIn={() => (tx.value = withTiming(6, { duration: 120 }))}
        onPressOut={() => (tx.value = withTiming(0, { duration: 120 }))}
        onPress={next}
        style={{ borderRadius: 999, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#ec4899', '#d946ef']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ctaGrad,
            {
              minHeight: clampVal(W * 0.14, 50, 60),
              paddingHorizontal: clampVal(W * 0.055, 18, 26),
            },
          ]}
        >
          <Text style={[styles.ctaTxt, { fontSize: FS_CTA }]}>
            {index === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Animated.View style={aStyle}>
            <ArrowRight size={clampVal(W * 0.045, 16, 18)} color="#fff" />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    );
  };

  const Progress = () => (
    <View style={[styles.progressWrap, { columnGap: PROG_GAP }]}>
      {[0, 1, 2, 3].map((i) => {
        const segStyle = useAnimatedStyle<ViewStyle>(() => {
          const prog = interpolate(
            x.value / W,
            [i - 1, i, i + 1],
            [0, 1, 0],
            Extrapolation.CLAMP
          );
          return {
            width: PROG_INACTIVE_W + (PROG_ACTIVE_W - PROG_INACTIVE_W) * prog,
            height: PROG_H,
            borderRadius: PROG_H / 2,
            backgroundColor: 'rgba(236,72,153,0.28)',
            opacity: 0.7 + 0.3 * prog,
            overflow: 'hidden',
          };
        });

        const fillStyle = useAnimatedStyle<ViewStyle>(() => {
          const prog = interpolate(
            x.value / W,
            [i - 1, i, i + 1],
            [0, 1, 0],
            Extrapolation.CLAMP
          );
          return { opacity: prog };
        });

        return (
          <Animated.View key={i} style={[styles.progressSeg, segStyle]}>
            <Animated.View style={[fillStyle, StyleSheet.absoluteFill]}>
              <LinearGradient
                colors={['#ec4899', '#d946ef']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: PROG_H / 2 }]}
              />
            </Animated.View>
          </Animated.View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {/* TOP: progress + skip */}
      <View
        style={[
          styles.topRow,
          {
            top: TOP_SAFE,
            left: clampVal(W * 0.05, 16, 22),
            right: clampVal(W * 0.05, 16, 22),
          },
        ]}
      >
        <Progress />
        <BlurView intensity={40} tint="dark" style={styles.skipBlur}>
          <Pressable
            onPress={goRegister}
            style={[
              styles.skipBtn,
              {
                paddingVertical: clampVal(W * 0.025, 8, 12),
                paddingHorizontal: clampVal(W * 0.04, 12, 18),
              },
            ]}
          >
            <Text style={styles.skipTxt}>Skip</Text>
          </Pressable>
        </BlurView>
      </View>

      {/* PAGER */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={W}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {SLIDES.map((s, i) => {
          // Animate IMAGE only to avoid edge-bleed
          const imgParallax = useAnimatedStyle<ImageStyle>(() => {
            const translateX = interpolate(
              x.value,
              [(i - 1) * W, i * W, (i + 1) * W],
              [-W * 0.06, 0, W * 0.06],
              Extrapolation.CLAMP
            );
            return { transform: [{ translateX }, { scale: 1.1 }] };
          });

          const Icon = s.icon;

          return (
            <View
              key={s.id}
              style={{
                width: W,
                height: H,
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              {/* Background image + overlays */}
              <View style={StyleSheet.absoluteFill}>
                <Animated.Image
                  source={s.bg}
                  style={[styles.bg, imgParallax]}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.55)']}
                  style={StyleSheet.absoluteFill}
                />
                {!!s.darken && (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: `rgba(0,0,0,${s.darken})` },
                    ]}
                  />
                )}
              </View>

              {/* Content */}
              <View
                style={[
                  styles.content,
                  {
                    left: clampVal(W * 0.06, 18, 26),
                    right: clampVal(W * 0.06, 18, 26),
                    bottom: clampVal(H * 0.14, 100, 140),
                  },
                ]}
              >
                <Animated.View entering={FadeIn.duration(300)}>
                  <View
                    style={[
                      styles.pill,
                      {
                        paddingVertical: clampVal(W * 0.02, 6, 8),
                        paddingHorizontal: clampVal(W * 0.04, 12, 16),
                      },
                    ]}
                  >
                    <Icon size={clampVal(W * 0.035, 12, 14)} color="#ffd5ea" />
                    <Text style={styles.pillTxt}> {s.tag}</Text>
                  </View>
                </Animated.View>

                <Animated.Text
                  entering={FadeInUp.delay(70).duration(450)}
                  style={[styles.h1, { fontSize: FS_H1, lineHeight: LH_H1 }]}
                >
                  {s.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(120).duration(450)}
                  style={[styles.h2, { fontSize: FS_H2 }]}
                >
                  {s.subtitle}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(180).duration(450)}
                  style={[styles.body, { fontSize: FS_BODY }]}
                >
                  {s.body}
                </Animated.Text>

                <Animated.View entering={FadeInUp.delay(240).duration(450)}>
                  <CTAArrow />
                </Animated.View>
              </View>

              {/* Dots */}
              <View
                style={[styles.dotsWrap, { bottom: clampVal(H * 0.075, 52, 72) }]}
              >
                {SLIDES.map((_, d) => {
                  const a = useAnimatedStyle<ViewStyle>(() => {
                    const prog = interpolate(
                      x.value / W,
                      [d - 1, d, d + 1],
                      [0, 1, 0],
                      Extrapolation.CLAMP
                    );
                    // compute animated values with interpolate; no helpers here
                    const w = interpolate(prog, [0, 1], [8, 16], Extrapolation.CLAMP);
                    const op = interpolate(prog, [0, 1], [0.5, 1], Extrapolation.CLAMP);
                    return { width: withTiming(w), opacity: withTiming(op) };
                  });
                  return <Animated.View key={d} style={[styles.dot, a]} />;
                })}
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  bg: { width: W, height: H, resizeMode: 'cover' },

  topRow: {
    position: 'absolute',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSeg: {
    borderRadius: PROG_H / 2,
  },

  skipBlur: { marginLeft: 'auto', borderRadius: 999, overflow: 'hidden' },
  skipBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  skipTxt: { color: '#fff', fontWeight: '700' },

  content: { position: 'absolute' },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(236,72,153,0.28)',
    borderColor: 'rgba(236,72,153,0.5)',
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillTxt: { color: '#ffd5ea', fontWeight: '800', fontSize: 12, letterSpacing: 0.2 },

  h1: { color: '#fff', fontWeight: '800', marginBottom: 10 },
  h2: { color: '#e9e9f2', fontWeight: '700', marginBottom: 12 },
  body: { color: 'rgba(255,255,255,0.92)', lineHeight: 22, marginBottom: 16 },

  ctaGrad: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 8,
  },
  ctaTxt: { color: '#fff', fontWeight: '900' },

  dotsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    width: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
});
