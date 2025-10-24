// ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Settings, MapPin, Calendar as CalendarIcon, Trophy, Heart,
  Users, ShoppingBag, Flame, Target, Star, Grid, Plus
} from 'lucide-react-native';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const userPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600', likes: 24, comments: 8 },
  { id: 2, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', likes: 31, comments: 12 },
  { id: 3, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600', likes: 45, comments: 15 },
  { id: 4, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', likes: 28, comments: 10 },
  { id: 5, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', likes: 36, comments: 14 },
  { id: 6, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', likes: 22, comments: 7 },
];

const purchases = [
  { id: 1, name: 'Premium Protein Powder', image: 'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?w=400', date: 'Oct 5, 2025', price: '₹1,299' },
  { id: 2, name: 'Omega-3 Fish Oil', image: 'https://images.unsplash.com/photo-1576437293196-fc3080b75964?w=400', date: 'Sep 28, 2025', price: '₹749' },
];

const bookedServices = [
  { id: 1, name: 'Nutrition Consultation', date: 'Oct 15, 2025 at 10:00 AM', status: 'Upcoming' as const },
  { id: 2, name: 'Personal Training', date: 'Oct 12, 2025 at 6:00 PM', status: 'Completed' as const },
];

type TabKey = 'posts' | 'purchases' | 'services';

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const renderPost = ({ item }: { item: (typeof userPosts)[number] }) => {
    const size = (Dimensions.get('window').width - 2) / 3; // 1px gaps
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
    <View style={styles.root}>
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
          <Pressable style={styles.iconBtn}>
            <Settings size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Profile info */}
        <View style={styles.profileRow}>
          <View style={{ marginRight: 12 }}>
            <View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Priya Sharma</Text>
            <Text style={styles.handle}>@priya_fit</Text>
            <View style={[styles.row, { marginTop: 4 }]}>
              <View style={[styles.row, { marginRight: 12 }]}>
                <MapPin size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}> Mumbai</Text>
              </View>
              <View style={styles.row}>
                <CalendarIcon size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}> Joined Oct 2024</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats (4 cols) */}
        <View style={styles.statsRow}>
          {[
            { label: 'Posts', value: '24', Icon: Grid },
            { label: 'Followers', value: '342', Icon: Users },
            { label: 'Following', value: '125', Icon: Heart },
            { label: 'Points', value: '2.4K', Icon: Trophy },
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
            <Pressable><Text style={styles.stripLink}>View All</Text></Pressable>
          </View>
          <View style={styles.wellnessCards}>
            {[
              { label: 'Streak', value: '12', unit: 'days', Icon: Flame, gradient: ['#fb923c', '#ef4444'] },
              { label: 'Goals', value: '3/5', unit: 'done', Icon: Target, gradient: ['#60a5fa', '#06b6d4'] },
              { label: 'Coins', value: '850', unit: 'total', Icon: Star, gradient: ['#f59e0b', '#f97316'] },
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
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {[
          { id: 'posts', label: 'Posts', Icon: Grid },
          { id: 'purchases', label: 'Shop', Icon: ShoppingBag },
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
              <Text style={[styles.tabLabel, { color: active ? '#db2777' : '#6b7280' }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'posts' && (
        <FlatList
          data={[...userPosts, { id: 9999, image: 'ADD_TILE', likes: 0, comments: 0 } as any]}
          keyExtractor={(item: any) => String(item.id)}
          numColumns={3}
          renderItem={({ item }) => {
            if (item.image === 'ADD_TILE') {
              const size = (Dimensions.get('window').width - 2) / 3;
              return (
                <Pressable style={[styles.addTile, { width: size, height: size, marginRight: 1, marginBottom: 1 }]}>
                  <Plus size={24} color="#9ca3af" />
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Add Post</Text>
                </Pressable>
              );
            }
            return renderPost({ item });
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {activeTab === 'purchases' && (
        <ScrollView contentContainerStyle={{ padding: 16, rowGap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Purchases</Text>
            <Pressable><Text style={styles.linkPink}>View All</Text></Pressable>
          </View>

          {purchases.map((p) => (
            <View key={p.id} style={styles.purchaseCard}>
              <Image source={{ uri: p.image }} style={styles.purchaseImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.purchaseName}>{p.name}</Text>
                <Text style={styles.purchaseDate}>{p.date}</Text>
                <Text style={styles.purchasePrice}>{p.price}</Text>
              </View>
              <Pressable style={styles.reorderBtn}>
                <Text style={styles.reorderText}>Reorder</Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.totalsCard}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalValue}>₹12,450</Text>
            <Text style={styles.totalNote}>Earned 245 coins from purchases</Text>
          </View>
        </ScrollView>
      )}

      {activeTab === 'services' && (
        <ScrollView contentContainerStyle={{ padding: 16, rowGap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Booked Services</Text>
            <Pressable onPress={() => onNavigate('Services')}>
              <Text style={styles.linkPink}>Book More</Text>
            </Pressable>
          </View>

          {bookedServices.map((s) => (
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
                      s.status === 'Upcoming' ? { color: '#059669' } : { color: '#4b5563' },
                    ]}
                  >
                    {s.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.row, { marginTop: 6 }]}>
                <CalendarIcon size={14} color="#6b7280" />
                <Text style={styles.serviceDate}> {s.date}</Text>
              </View>

              {s.status === 'Upcoming' && (
                <View style={styles.serviceActions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: '#fdf2f8' }]}>
                    <Text style={[styles.actionText, { color: '#db2777' }]}>Reschedule</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: '#f3f4f6' }]}>
                    <Text style={[styles.actionText, { color: '#374151' }]}>Cancel</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          <View style={styles.serviceTotals}>
            <Text style={styles.totalLabel}>Total Services Booked</Text>
            <Text style={styles.totalValue}>8</Text>
            <Text style={styles.totalNote}>2 upcoming, 6 completed</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  // Header block
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { padding: 8, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },

  profileRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff' },
  onlineDot: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', borderWidth: 4, borderColor: '#fff' },
  name: { color: '#fff', fontWeight: '800', fontSize: 20 },
  handle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  // Quick stats 4 cols
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, paddingTop: 4 },
  statItem: { alignItems: 'center', flex: 1 },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  // Wellness strip under header
  wellnessStrip: { backgroundColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  stripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  stripTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stripLink: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  wellnessCards: { flexDirection: 'row', justifyContent: 'space-between', columnGap: 10 },
  wellCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center' },
  wellIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  wellValue: { color: '#111827', fontWeight: '800', fontSize: 18 },
  wellLabel: { color: '#6b7280', fontSize: 12, marginTop: 2 },

  // Tabs
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', columnGap: 6 },
  tabBtnActive: { borderBottomColor: '#db2777' },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  // Posts
  postOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)' },
  postStats: { position: 'absolute', right: 4, bottom: 4, flexDirection: 'row', alignItems: 'center' },
  postStatText: { color: '#fff', fontSize: 11, marginLeft: 4 },
  addTile: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },

  // Purchases
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#111827', fontWeight: '700', fontSize: 16 },
  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 13 },

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
  reorderBtn: { backgroundColor: '#fdf2f8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
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
  serviceActions: { flexDirection: 'row', columnGap: 8, marginTop: 10 },
  actionBtn: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10 },
  actionText: { fontWeight: '700', fontSize: 13 },

  serviceTotals: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
});
