// src/screens/thrive/ChallengeDetailScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Users,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react-native';

import {
  getChallengeDetail,
  joinChallenge,
  ChallengeDetail,
} from '../../api/thrive';

// Local typing for route params (matches MainNavigator route name)
type RootStackParamList = {
  ThriveChallengeDetail: { challengeId: string };
};

type DetailRouteProp = RouteProp<RootStackParamList, 'ThriveChallengeDetail'>;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800';

export default function ChallengeDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { challengeId } = route.params;

  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getChallengeDetail(challengeId);
        console.log(
          '[THRIVE] ChallengeDetailScreen -> getChallengeDetail result:',
          JSON.stringify(res, null, 2)
        );

        setDetail(res.data);
      } catch (e: any) {
        console.log('[THRIVE] challenge detail error', e);
        setError('Could not load challenge details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [challengeId]);

  const handleJoin = async () => {
    if (!detail || detail.joined || joining) return;
    try {
      setJoining(true);
      const res = await joinChallenge(challengeId);
      console.log('[THRIVE] joinChallenge response:', res);

      // Optimistic update
      setDetail({
        ...detail,
        joined: true,
        participantsCount: detail.participantsCount + 1,
      });

      // Later you can navigate to a "joined" page from here
      // navigation.navigate('ThriveChallengeJoined', { challengeId });
    } catch (e) {
      console.log('[THRIVE] joinChallenge error', e);
    } finally {
      setJoining(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formattedDates = useMemo(() => {
    if (!detail) return '';
    try {
      const start = new Date(detail.startDate);
      const end = new Date(detail.endDate);
      const opts: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      const startStr = start.toLocaleDateString(undefined, opts);
      const endStr = end.toLocaleDateString(undefined, opts);
      return `${startStr} - ${endStr}`;
    } catch {
      return '';
    }
  }, [detail]);

  const daysLeftText = useMemo(() => {
    if (!detail) return '';
    if (detail.status === 'completed') return 'Completed';
    if (detail.daysLeft <= 0 && detail.status === 'active') return 'Ends today';
    if (detail.daysLeft <= 0 && detail.status === 'upcoming') return 'Starts soon';
    return `${detail.daysLeft} days left`;
  }, [detail]);

  /* ---------- Basic loading / error states ---------- */

  if (loading && !detail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && !detail) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#111827' }}>{error}</Text>
      </View>
    );
  }

  if (!detail) return null;

  const joined = detail.joined;

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ========= HERO ========= */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: detail.coverImage || FALLBACK_IMAGE }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={styles.heroOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Top bar */}
          <View style={[styles.heroTopBar, { paddingTop: insets.top + 8 }]}>
            <Pressable style={styles.circleBtn} onPress={handleBack}>
              <ArrowLeft size={20} color="#111827" />
            </Pressable>
            <Pressable style={styles.circleBtn}>
              <Share2 size={20} color="#111827" />
            </Pressable>
          </View>

          {/* Bottom content in hero */}
          <View style={styles.heroBottom}>
            <View style={styles.heroPillsRow}>
              <View style={styles.heroPillMuted}>
                <Text style={styles.heroPillMutedText}>{daysLeftText}</Text>
              </View>

              <View style={styles.heroPillGreen}>
                <Users size={14} color="#fff" />
                <Text style={styles.heroPillGreenText}>
                  {' '}
                  {detail.participantsCount} joined
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{detail.title}</Text>
            {!!detail.subtitle && (
              <Text style={styles.heroSubtitle}>{detail.subtitle}</Text>
            )}
          </View>
        </View>

        {/* ========= BODY CARD ========= */}
        <View style={styles.bodyCard}>
          <Text style={styles.sectionTitle}>About This Challenge</Text>
          <Text style={styles.sectionBody}>
            {detail.description ||
              'Join thousands of people in this challenge to build a healthy habit.'}
          </Text>

          {/* Info rows */}
          <View style={styles.infoList}>
            {/* Duration */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#fee2e2' }]}>
                <CalendarIcon size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>
                  {detail.totalDays} days
                  {formattedDates ? ` • ${formattedDates}` : ''}
                </Text>
              </View>
            </View>

            {/* Participants */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#e0f2fe' }]}>
                <Users size={20} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {detail.participantsCount} people joined •{' '}
                  {detail.isFree ? 'Open to all' : 'Limited access'}
                </Text>
              </View>
            </View>

            {/* Daily Deadline */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#e0f2fe' }]}>
                <Clock size={20} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Daily Deadline</Text>
                <Text style={styles.infoValue}>
                  Log progress before {detail.dailyDeadline} each day
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ========= BOTTOM JOIN BAR ========= */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom + 8, 16) },
        ]}
      >
        <Pressable
          disabled={joined || joining}
          onPress={handleJoin}
          style={{ borderRadius: 999 }}
        >
          <LinearGradient
            colors={joined ? ['#9ca3af', '#6b7280'] : ['#f97316', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.joinBtn}
          >
            <Text style={styles.joinBtnText}>
              {joined ? 'Joined' : 'Join Challenge'}
            </Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.joinMeta}>
          {detail.isFree ? 'Free to join' : 'May require enrollment fee'} • Start
          anytime
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },

  /* HERO */
  heroWrap: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  heroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroPillMuted: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginRight: 8,
  },
  heroPillMutedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  heroPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  heroPillGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
  },

  /* BODY */
  bodyCard: {
    marginTop: -16,
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  infoList: {
    marginTop: 20,
    rowGap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  infoValue: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  joinBtn: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  joinMeta: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 11,
    color: '#6b7280',
  },
});
