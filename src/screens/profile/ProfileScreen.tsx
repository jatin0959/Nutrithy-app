// src/screens/profile/ProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Settings,
  MapPin,
  Calendar as CalendarIcon,
  Trophy,
  Heart,
  Users,
  ShoppingBag,
  Flame,
  Target,
  Star,
  Grid,
  Plus,
} from 'lucide-react-native';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootMainStackParamList } from '../../navigation/MainNavigator';
import { getProfile } from '../../api/profile';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

type TabKey = 'posts' | 'purchases' | 'services';

type HeaderState = {
  name: string;
  handle: string;
  location: string;
  joined: string;
  avatarUrl: string;
  stats: {
    posts: string;
    followers: string;
    following: string;
    points: string;
  };
};

type PostPreview = {
  id: string;
  image: string;
  likes: number;
  comments: number;
  createdAt?: string;
};

type BookedService = {
  id: string;
  name: string;
  date: string; // ISO string
  status: 'Upcoming' | 'Completed' | string;
};

type WellnessState = {
  streak: string;
  goals: string; // "3/5"
  coins: string;
};

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const rootNav = useNavigation<NativeStackNavigationProp<RootMainStackParamList>>();

  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const [header, setHeader] = useState<HeaderState>({
    name: 'Loading...',
    handle: '@user',
    location: '',
    joined: '',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    stats: {
      posts: '0',
      followers: '0',
      following: '0',
      points: '0',
    },
  });

  const [wellness, setWellness] = useState<WellnessState>({
    streak: '0',
    goals: '0/0',
    coins: '0',
  });

  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [services, setServices] = useState<BookedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const formatServiceDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setProfileError('');

      const data: any = await getProfile();
      // console.log('[PROFILE_DATA]', JSON.stringify(data, null, 2));

      const fullName =
        data.fullName ||
        [data.firstName, data.lastName].filter(Boolean).join(' ') ||
        'User';

      const emailLocal = data.email?.split('@')[0] || '';
      const handleBase =
        emailLocal ||
        data.firstName?.toLowerCase() ||
        'user';

      const location =
        data.teamName ||
        data.team ||
        data.companyName ||
        data.company ||
        'Wellness';

      let joinedText = '';
      if (data.createdAt) {
        const d = new Date(data.createdAt);
        if (!isNaN(d.getTime())) {
          const month = d.toLocaleString('en-US', { month: 'short' });
          const year = d.getFullYear();
          joinedText = `Joined ${month} ${year}`;
        }
      }

      const avatarUrl =
        data.profilePhoto ||
        data.avatar ||
        header.avatarUrl;

      const s = data.stats || {};
      const postsCount = s.posts ?? (data.postsPreview?.length ?? 0);
      const followers = s.followers ?? 0;
      const following = s.following ?? 0;
      const points = s.points ?? s.totalPoints ?? 0;

      setHeader({
        name: fullName,
        handle: '@' + handleBase,
        location,
        joined: joinedText,
        avatarUrl,
        stats: {
          posts: String(postsCount),
          followers: String(followers),
          following: String(following),
          points: String(points),
        },
      });

      setWellness({
        streak: String(s.streak ?? 0),
        goals: `${s.goalsCompleted ?? 0}/${s.goalsTotal ?? 0}`,
        coins: String(s.coins ?? 0),
      });

      setPosts(data.postsPreview || []);
      setServices(data.bookedServices || []);
    } catch (err: any) {
      console.log('[PROFILE_FETCH_ERROR]', err?.response?.data || err?.message);
      setProfileError('Unable to load profile. Showing defaults.');
    } finally {
      setLoading(false);
    }
  }, [header.avatarUrl]);

  // 🔥 Fetch profile whenever this screen/tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const renderPost = ({ item }: { item: PostPreview }) => {
    const size = (Dimensions.get('window').width - 2) / 3;
    return (
      <View style={{ width: size, height: size, marginBottom: 1, marginRight: 1 }}>
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
        <View style={styles.postOverlay} />
        <View style={styles.postStats}>
          <View style={styles.row}>
            <Heart size={12} color="#fff" fill="#fff" />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header gradient block */}
      <LinearGradient
        colors={['#ec4899', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => onNavigate('Home')} style={styles.iconBtn}>
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable onPress={() => rootNav.navigate('Settings')} style={styles.iconBtn}>
            <Settings size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Profile info */}
        <View style={styles.profileRow}>
          <View style={{ marginRight: 12 }}>
            <View>
              <Image
                source={{ uri: header.avatarUrl }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{header.name}</Text>
            <Text style={styles.handle}>{header.handle}</Text>
            <View style={[styles.row, { marginTop: 4 }]}>
              <View style={[styles.row, { marginRight: 12 }]}>
                <MapPin size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}> {header.location}</Text>
              </View>
              {!!header.joined && (
                <View style={styles.row}>
                  <CalendarIcon size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}> {header.joined}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats (4 cols) */}
        <View style={styles.statsRow}>
          {[
            { label: 'Posts',     value: header.stats.posts,     Icon: Grid },
            { label: 'Followers', value: header.stats.followers, Icon: Users },
            { label: 'Following', value: header.stats.following, Icon: Heart },
            { label: 'Points',    value: header.stats.points,    Icon: Trophy },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <s.Icon size={18} color="#fff" />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Wellness stats strip */}
        <View style={styles.wellnessStrip}>
          <View style={styles.stripHeader}>
            <Text style={styles.stripTitle}>Wellness Journey</Text>
            <Pressable>
              <Text style={styles.stripLink}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.wellnessCards}>
            {[
              {
                label: 'Streak',
                value: wellness.streak,
                unit: 'days',
                Icon: Flame,
                gradient: ['#fb923c', '#ef4444'] as const,
              },
              {
                label: 'Goals',
                value: wellness.goals,
                unit: 'done',
                Icon: Target,
                gradient: ['#60a5fa', '#06b6d4'] as const,
              },
              {
                label: 'Coins',
                value: wellness.coins,
                unit: 'total',
                Icon: Star,
                gradient: ['#f59e0b', '#f97316'] as const,
              },
            ].map((w) => (
              <View key={w.label} style={styles.wellCard}>
                <LinearGradient colors={w.gradient} style={styles.wellIcon}>
                  <w.Icon size={14} color="#fff" />
                </LinearGradient>
                <Text style={styles.wellValue}>{w.value}</Text>
                <Text style={styles.wellLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {loading && (
          <View style={{ paddingVertical: 8, alignItems: 'center' }}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        )}

        {!!profileError && !loading && (
          <View style={{ paddingVertical: 4, alignItems: 'center' }}>
            <Text style={{ color: '#fee2e2', fontSize: 11 }}>{profileError}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {[
          { id: 'posts', label: 'Posts', Icon: Grid },
          // { id: 'purchases', label: 'Shop', Icon: ShoppingBag },
          { id: 'services', label: 'Services', Icon: CalendarIcon },
        ].map((t) => {
          const active = activeTab === (t.id as TabKey);
          return (
            <Pressable
              key={t.id}
              onPress={() => setActiveTab(t.id as TabKey)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <t.Icon size={18} color={active ? '#db2777' : '#6b7280'} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? '#db2777' : '#6b7280' },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <FlatList
          data={[
            ...(posts || []),
            {
              id: 'ADD_TILE',
              image: 'ADD_TILE',
              likes: 0,
              comments: 0,
            } as any,
          ]}
          keyExtractor={(item: any) => String(item.id)}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => {
            if (item.image === 'ADD_TILE') {
              const size = (Dimensions.get('window').width - 2) / 3;
              return (
                <Pressable
                  style={[
                    styles.addTile,
                    {
                      width: size,
                      height: size,
                      marginRight: 1,
                      marginBottom: 1,
                    },
                  ]}
                >
                  <Plus size={24} color="#9ca3af" />
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                    Add Post
                  </Text>
                </Pressable>
              );
            }
            return renderPost({ item });
          }}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Purchases Tab (still mock for now, if you want it) */}
      {activeTab === 'purchases' && (
        <View style={{ padding: 16, rowGap: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Purchases</Text>
            <Pressable>
              <Text style={styles.linkPink}>View All</Text>
            </Pressable>
          </View>

          {/* hook this up later to real API if needed */}
          <Text style={{ color: '#6b7280' }}>Coming soon…</Text>
        </View>
      )}

      {/* Services Tab – from API.bookedServices */}
      {activeTab === 'services' && (
        <View style={{ padding: 16, rowGap: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Booked Services</Text>
            <Pressable onPress={() => onNavigate('Services')}>
              <Text style={styles.linkPink}>Book More</Text>
            </Pressable>
          </View>

          {services.map((s) => (
            <View key={s.id} style={styles.serviceCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <View
                  style={[
                    styles.badge,
                    s.status === 'Upcoming'
                      ? { backgroundColor: '#ecfdf5' }
                      : { backgroundColor: '#f3f4f6' },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      s.status === 'Upcoming'
                        ? { color: '#059669' }
                        : { color: '#4b5563' },
                    ]}
                  >
                    {s.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.row, { marginTop: 6 }]}>
                <CalendarIcon size={14} color="#6b7280" />
                <Text style={styles.serviceDate}>
                  {' '}
                  {formatServiceDate(s.date)}
                </Text>
              </View>

              {s.status === 'Upcoming' && (
                <View style={styles.serviceActions}>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: '#fdf2f8' }]}
                  >
                    <Text
                      style={[styles.actionText, { color: '#db2777' }]}
                    >
                      Reschedule
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: '#f3f4f6' }]}
                  >
                    <Text
                      style={[styles.actionText, { color: '#374151' }]}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          <View style={styles.serviceTotals}>
            <Text style={styles.totalLabel}>Total Services Booked</Text>
            <Text style={styles.totalValue}>
              {services.length}
            </Text>
            <Text style={styles.totalNote}>
              {`${services.filter(s => s.status === 'Upcoming').length} upcoming, ${
                services.filter(s => s.status === 'Completed').length
              } completed`}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  // Header block
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },

  profileRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff' },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    borderWidth: 4,
    borderColor: '#fff',
  },
  name: { color: '#fff', fontWeight: '800', fontSize: 20 },
  handle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  // Quick stats 4 cols
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 4,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  // Wellness strip under header
  wellnessStrip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  stripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stripTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stripLink: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  wellnessCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  wellCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  wellIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  wellValue: { color: '#111827', fontWeight: '800', fontSize: 18 },
  wellLabel: { color: '#6b7280', fontSize: 12, marginTop: 2 },

  // Tabs
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    columnGap: 6,
  },
  tabBtnActive: { borderBottomColor: '#db2777' },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  // Posts
  postOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)' },
  postStats: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: { color: '#fff', fontSize: 11, marginLeft: 4 },
  addTile: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },

  // Purchases (placeholder)
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: '#111827', fontWeight: '700', fontSize: 16 },
  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 13 },

  // Services
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  serviceName: { color: '#111827', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  serviceDate: { color: '#6b7280', fontSize: 13 },
  serviceActions: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionText: { fontWeight: '700', fontSize: 13 },

  serviceTotals: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },

  // Purchases styles (kept for future use)
  purchaseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  purchaseImg: { width: 64, height: 64, borderRadius: 12 },
  purchaseName: { color: '#111827', fontWeight: '700', fontSize: 14 },
  purchaseDate: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  purchasePrice: { color: '#db2777', fontWeight: '800', marginTop: 4 },
  reorderBtn: {
    backgroundColor: '#fdf2f8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  reorderText: { color: '#db2777', fontWeight: '700', fontSize: 13 },

  totalsCard: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  totalLabel: { color: '#4b5563', fontSize: 13, marginBottom: 4 },
  totalValue: { color: '#111827', fontWeight: '800', fontSize: 20 },
  totalNote: { color: '#6b7280', fontSize: 12, marginTop: 4 },
});
