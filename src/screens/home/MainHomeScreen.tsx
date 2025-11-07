// MainHomeScreen.tsx
import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../../navigation/MainNavigator';

import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';

import {
  Search,
  Calendar,
  Sparkles,
  ChevronRight,
  Star,
  Trophy,
  ShoppingCart,
  User,
  Bell,
  Plus,
  Zap,
  Flame,
  Target,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabKey = 'home' | 'services' | 'shop' | 'game';

interface MainHomeScreenProps {
  onNavigate: (screen: string) => void;
  logoUri?: string;
}

const stories = [
  { id: 1, title: 'Your Story', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', hasNew: false, isYou: true },
  { id: 2, title: 'Priya', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', hasNew: true },
  { id: 3, title: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', hasNew: true },
  { id: 4, title: 'Anita', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', hasNew: false },
  { id: 5, title: 'Vikram', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', hasNew: true }
];

const services = [
  {
    id: 'consultation',
    title: 'Expert Consultation',
    subtitle: '1-on-1 with nutritionists',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    gradient: ['#ec4899', '#f43f5e'],
  },
  {
    id: 'wellness',
    title: 'Corporate Wellness',
    subtitle: 'Team health programs',
    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=600',
    gradient: ['#8b5cf6', '#6366f1'],
  },
  {
    id: 'fitness',
    title: 'Fitness Plans',
    subtitle: 'Personalized workouts',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600',
    gradient: ['#f59e0b', '#ef4444'],
  },
];

const products = [
  { id: 1, name: 'Premium Protein Powder', category: 'Protein', price: '₹1,299', originalPrice: '₹1,599', rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?w=600', tag: 'Bestseller', inStock: true },
  { id: 2, name: 'Daily Multivitamins', category: 'Vitamins', price: '₹899', originalPrice: '₹1,099', rating: 4.6, reviews: 189, image: 'https://images.unsplash.com/photo-1648139347040-857f024f8da4?w=600', tag: 'New', inStock: true },
  { id: 3, name: 'Omega-3 Fish Oil', category: 'Health', price: '₹749', rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1576437293196-fc3080b75964?w=600', tag: 'Top Rated', inStock: true },
  { id: 4, name: 'Green Superfood Powder', category: 'Supplements', price: '₹1,499', originalPrice: '₹1,799', rating: 4.9, reviews: 298, image: 'https://images.unsplash.com/photo-1708573106044-2bbefb3d9fc3?w=600', tag: 'Organic', inStock: true },
  { id: 5, name: 'Collagen Beauty Blend', category: 'Beauty', price: '₹1,899', originalPrice: '₹2,299', rating: 4.8, reviews: 167, image: 'https://images.unsplash.com/photo-1689841175766-a5abc64b9903?w=600', tag: 'Premium', inStock: true },
  { id: 6, name: 'Herbal Wellness Tea', category: 'Beverages', price: '₹599', rating: 4.5, reviews: 143, image: 'https://images.unsplash.com/photo-1594137052297-e55c3c6b33f9?w=600', tag: '☕ Popular', inStock: true },
  { id: 7, name: 'Energy Protein Bars', category: 'Snacks', price: '₹449', rating: 4.6, reviews: 201, image: 'https://images.unsplash.com/photo-1597776776796-092650d7afed?w=600', tag: '⚡ Quick Fuel', inStock: true },
  { id: 8, name: 'Probiotic Complex', category: 'Digestive', price: '₹1,199', rating: 4.7, reviews: 178, image: 'https://images.unsplash.com/photo-1620755848138-dd2cbb2781c5?w=600', tag: '🦠 Health', inStock: true },
  { id: 9, name: 'Turmeric Curcumin', category: 'Immunity', price: '₹849', rating: 4.8, reviews: 192, image: 'https://images.unsplash.com/photo-1621586862188-1b91f76f8c72?w=600', tag: '🛡️ Immunity', inStock: true },
  { id: 10, name: 'Meal Replacement Shake', category: 'Nutrition', price: '₹1,399', originalPrice: '₹1,699', rating: 4.6, reviews: 164, image: 'https://images.unsplash.com/photo-1584116831289-e53912463c35?w=600', tag: 'Complete', inStock: true },
];

export function MainHomeScreen({ onNavigate, logoUri }: MainHomeScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const go = (screen: keyof MainTabParamList | string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(screen);
      return;
    }
    navigation.navigate(screen as any);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'game') onNavigate('home');
  };

  const progress = 0.82;
  const R = 35;
  const CIRC = 2 * Math.PI * R;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.brandRow}>
            <Image
              source={logoUri ? { uri: logoUri } : require('../../assets/images/logo.png')}
              style={[s.logo, s.logoFallback]}
            />
            <Text style={s.brand}>Nutrithy</Text>
          </View>

          <View style={s.headerActions}>
            <Pressable
              onPress={() => onNavigate('notifications')}
              style={s.iconBtn}
              android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
            >
              <Bell size={20} color="#374151" />
              <View style={s.badge} />
            </Pressable>

            <Pressable style={s.iconBtn} android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}>
              <ShoppingCart size={20} color="#374151" />
              <View style={s.badge} />
            </Pressable>

            <Pressable onPress={() => go('Profile')} style={s.avatarWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
                style={s.avatar}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={s.content}>
        {activeTab === 'home' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
            {/* Stories */}
            <View style={s.block}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesRow}>
                {stories.map((story) => (
                  <View key={story.id} style={s.storyItem}>
                    <LinearGradient
                      colors={story.hasNew ? ['#ec4899', '#a855f7'] : ['#d1d5db', '#d1d5db']}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 0 }}
                      style={s.storyRing}
                    >
                      <View style={s.storyInner}>
                        <Image source={{ uri: story.image }} style={s.storyImage} />
                      </View>

                      {story.isYou && (
                        <View style={s.storyPlus}>
                          <Plus size={12} color="#fff" />
                        </View>
                      )}
                    </LinearGradient>
                    <Text style={s.storyLabel} numberOfLines={1}>{story.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Greeting & Coins */}
            <View style={[s.block, s.whiteCard]}>
              <View style={s.rowBetween}>
                <View>
                  <Text style={s.subtle}>Good Morning</Text>
                  <Text style={s.h2}>Priya Sharma</Text>
                </View>
                <Pressable onPress={() => onNavigate('coins')} style={s.coinBtn}>
                  <Star size={16} color="#fff" fill="#fff" />
                  <Text style={s.coinText}>850</Text>
                </Pressable>
              </View>
            </View>

            {/* Today's Progress */}
            <View style={s.block}>
              <LinearGradient colors={['#ec4899', '#7c3aed']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.progressCard}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.progressLabel}>Today's Progress</Text>
                    <Text style={s.progressSteps}>8,247 steps</Text>
                    <Text style={s.progressGoal}>Goal: 10,000 steps</Text>
                  </View>

                  {/* Right: circular progress */}
                  <View style={s.progressRingWrap}>
                    <Svg width={92} height={92} style={s.progressSvg}>
                      {/* track */}
                      <Circle cx={46} cy={46} r={38} stroke="rgba(255,255,255,0.25)" strokeWidth={8} fill="none" />
                      {/* progress */}
                      <Circle
                        cx={46}
                        cy={46}
                        r={38}
                        stroke="#fff"
                        strokeWidth={8}
                        fill="none"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={(2 * Math.PI * 38) * (1 - progress)}
                        strokeLinecap="round"
                      />
                    </Svg>

                    {/* inner chip for 82% */}
                    <View style={s.progressInner}>
                      <Text style={s.progressPct}>82%</Text>
                    </View>
                  </View>

                </View>

                <View style={s.progressStatsRow}>
                  <View style={s.statPill}>
                    <Flame size={20} color="#fff" />
                    <Text style={s.statValue}>12</Text>
                    <Text style={s.statLabel}>Day Streak</Text>
                  </View>
                  <View style={s.statPill}>
                    <Zap size={20} color="#fff" />
                    <Text style={s.statValue}>342</Text>
                    <Text style={s.statLabel}>Calories</Text>
                  </View>
                  <View style={s.statPill}>
                    <Target size={20} color="#fff" />
                    <Text style={s.statValue}>3/5</Text>
                    <Text style={s.statLabel}>Goals</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Daily Tasks */}
            <View style={s.block}>
              <View style={s.rowBetween}>
                <Text style={s.h3}>Daily Tasks</Text>
                <Pressable><Text style={s.linkPink}>View All</Text></Pressable>
              </View>

              <View style={{ rowGap: 8 }}>
                {[
                  { id: 1, task: 'Complete 10,000 steps', progress: 82, completed: false, coins: 50 },
                  { id: 2, task: 'Drink 8 glasses of water', progress: 100, completed: true, coins: 20 },
                  { id: 3, task: 'Log your meals', progress: 66, completed: false, coins: 30 },
                ].map((task) => (
                  <View
                    key={task.id}
                    style={[
                      s.taskCard,
                      task.completed ? s.taskCardDone : s.taskCardTodo,
                    ]}
                  >
                    <View style={s.rowBetween}>
                      <View style={s.row}>
                        <View style={[s.chk, task.completed ? s.chkOn : s.chkOff]}>
                          {task.completed && <ChevronRight size={14} color="#fff" />}
                        </View>
                        <Text
                          style={[s.taskText, task.completed ? s.taskTextDone : undefined]}
                          numberOfLines={2}
                        >
                          {task.task}
                        </Text>
                      </View>
                      <View style={s.row}>
                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                        <Text style={s.coinSmall}>+{task.coins}</Text>
                      </View>
                    </View>

                    {!task.completed && (
                      <View style={{ marginLeft: 28, marginTop: 8 }}>
                        <View style={s.progressBarBg}>
                          <View style={[s.progressBarFill, { width: `${task.progress}%` }]} />
                        </View>
                        <Text style={s.progressSmall}>{task.progress}% complete</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={s.block}>
              <Text style={s.h3}>Quick Actions</Text>
              <View style={s.quickGrid}>
                {[
                  { id: 1, label: 'Services', icon: Sparkles, screen: 'services', gradient: ['#ec4899', '#f43f5e'] },
                  { id: 2, label: 'Profile', icon: User, screen: 'new-profile', gradient: ['#8b5cf6', '#6366f1'] },
                  { id: 3, label: 'Rewards', icon: Star, screen: 'coins', gradient: ['#f59e0b', '#f97316'] },
                  { id: 4, label: 'Game', icon: Trophy, screen: 'home', gradient: ['#3b82f6', '#06b6d4'] },
                ].map((action) => (
                  <Pressable key={action.id} style={s.quickItem} onPress={() => onNavigate(action.screen)}>
                    <LinearGradient colors={action.gradient} style={s.quickIconBox}>
                      <action.icon size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={s.quickLabel} numberOfLines={1}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Services Feed */}
            <View style={s.block}>
              <View style={s.rowBetween}>
                <Text style={s.h3}>Services</Text>
                <Pressable onPress={() => onNavigate('services')}>
                  <Text style={s.linkPink}>See all</Text>
                </Pressable>
              </View>

              <View style={{ rowGap: 12 }}>
                {services.slice(0, 2).map((service) => (
                  <Pressable
                    key={service.id}
                    onPress={() => onNavigate(`service-${service.id}`)}
                    style={s.serviceCard}
                  >
                    <Image source={{ uri: service.image }} style={s.serviceImage} />
                    <LinearGradient colors={service.gradient} style={s.serviceOverlay} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                    <View style={s.serviceContent}>
                      <View>
                        <Text style={s.serviceTitle}>{service.title}</Text>
                        <Text style={s.serviceSubtitle}>{service.subtitle}</Text>
                      </View>
                      <View style={s.serviceBtn}>
                        <Text style={s.serviceBtnText}>Book Now</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Quick Access */}
            <View style={[s.block, s.whiteCard, { marginTop: 8 }]}>
              <Text style={s.h3}>Quick Access</Text>
              <View style={s.quickAccessRow}>
                <Pressable onPress={() => onNavigate('home')} style={[s.accessCard, { backgroundColor: '#ec4899' }]}>
                  <Trophy size={28} color="#fff" />
                  <Text style={s.accessTitle}>Wellness Game</Text>
                  <Text style={s.accessSubtitle}>Play & Earn</Text>
                </Pressable>
                <Pressable onPress={() => onNavigate('consultation')} style={[s.accessCard, { backgroundColor: '#6366f1' }]}>
                  <Calendar size={28} color="#fff" />
                  <Text style={s.accessTitle}>Book Expert</Text>
                  <Text style={s.accessSubtitle}>Get advice</Text>
                </Pressable>
              </View>
            </View>

            {/* Shop Feed */}
            <View style={[s.block, { paddingBottom: 20 }]}>
              <View style={s.rowBetween}>
                <Text style={s.h3}>Shop</Text>
                <Pressable onPress={() => setActiveTab('shop')}>
                  <Text style={s.linkPink}>See all</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
                {products.slice(0, 6).map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => onNavigate(`product-${product.id}`)}
                    style={s.productCardSmall}
                  >
                    <View style={s.productImageWrap}>
                      <Image source={{ uri: product.image }} style={s.productImage} />
                      <View style={s.productTag}>
                        <Text style={s.productTagText}>{product.tag}</Text>
                      </View>
                    </View>
                    <View style={s.productBody}>
                      <Text style={s.productCat}>{product.category}</Text>
                      <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
                      <View style={s.row}>
                        <Star size={12} color="#facc15" fill="#facc15" />
                        <Text style={s.ratingText}>{product.rating}</Text>
                        <Text style={s.ratingCount}>({product.reviews})</Text>
                      </View>
                      <View style={s.rowBetween}>
                        <View>
                          <Text style={s.price}>{product.price}</Text>
                          {product.originalPrice ? <Text style={s.priceStrike}>{product.originalPrice}</Text> : null}
                        </View>
                        <View style={s.addSmall}>
                          <Plus size={14} color="#fff" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}

        {activeTab === 'services' && (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                onPress={() => onNavigate(`service-${service.id}`)}
                style={s.serviceTall}
              >
                <Image source={{ uri: service.image }} style={s.serviceTallImg} />
                <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']} style={s.serviceTallOverlay} />
                <View style={s.serviceTallBottom}>
                  <Text style={s.serviceTallTitle}>{service.title}</Text>
                  <Text style={s.serviceTallSub}>{service.subtitle}</Text>
                  <View style={s.learnBtn}><Text style={s.learnBtnText}>Learn More</Text></View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {activeTab === 'shop' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
            <View style={[s.whiteCard, { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }]}>
              <View style={{ position: 'relative' }}>
                <Search size={18} color="#9ca3af" style={s.searchIcon} />
                <TextInput
                  placeholder="Search products..."
                  placeholderTextColor="#9ca3af"
                  style={s.searchInput}
                />
              </View>
            </View>

            {/* Categories */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                {['All', 'Protein', 'Vitamins', 'Health', 'Beauty', 'Snacks'].map((cat, idx) => {
                  const active = idx === 0;
                  return (
                    <Pressable key={cat} style={[s.catChip, active ? s.catChipActive : s.catChipInactive]}>
                      <Text style={active ? s.catTextActive : s.catTextInactive}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2-column grid */}
            <View style={s.gridWrap}>
              {products.map((product) => (
                <Pressable
                  key={product.id}
                  onPress={() => onNavigate(`product-${product.id}`)}
                  style={s.productCard}
                >
                  <View style={s.productImgBigWrap}>
                    <Image source={{ uri: product.image }} style={s.productImgBig} />
                    <View style={s.productTag}>
                      <Text style={s.productTagText}>{product.tag}</Text>
                    </View>
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text style={s.productCat}>{product.category}</Text>
                    <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
                    <View style={[s.row, { marginBottom: 8 }]}>
                      <Star size={12} color="#facc15" fill="#facc15" />
                      <Text style={s.ratingText}>{product.rating}</Text>
                      <Text style={s.ratingCount}>({product.reviews})</Text>
                    </View>
                    <View style={s.rowBetween}>
                      <View>
                        <Text style={s.price}>{product.price}</Text>
                        {product.originalPrice ? <Text style={s.priceStrike}>{product.originalPrice}</Text> : null}
                      </View>
                      <View style={s.addSmall}>
                        <Plus size={16} color="#fff" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const CARD_RADIUS = 20;

// Handy calc for 4 icons per row (matching your spacing)
const QUICK_ITEM_W = (SCREEN_WIDTH - 32 /*page padd*/ - 12 /*grid gap fudge*/) / 4;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.select({ ios: 12, android: 12 }),
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 28, height: 28, borderRadius: 6, marginRight: 8 },
  logoFallback: { backgroundColor: '#f3f4f6' },
  brand: { fontWeight: '700', color: '#111827', fontSize: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 6, marginHorizontal: 2, borderRadius: 9999 },
  badge: {
    position: 'absolute', top: 4, right: 4, width: 8, height: 8, backgroundColor: '#ec4899', borderRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  avatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#ec4899', marginLeft: 6 },
  avatar: { width: '100%', height: '100%' },

  content: { flex: 1 },
  block: { paddingHorizontal: 16, paddingVertical: 12 },
  whiteCard: {
    backgroundColor: '#fff', borderRadius: CARD_RADIUS,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },

  // Stories
  storiesRow: { columnGap: 12 },
  storyItem: { width: 64, alignItems: 'center' },
  storyRing: { width: 64, height: 64, borderRadius: 32, padding: 2, alignItems: 'center', justifyContent: 'center' },
  storyInner: { width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 32, padding: 2 },
  storyImage: { width: '100%', height: '100%', borderRadius: 32 },
  storyPlus: {
    position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, backgroundColor: '#ec4899',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'
  },
  storyLabel: { fontSize: 12, marginTop: 4, width: 64, color: '#111827' },

  // Greeting
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  subtle: { color: '#6b7280', fontSize: 13 },
  h2: { color: '#111827', fontSize: 20, fontWeight: '700', marginTop: 2 },
  coinBtn: { flexDirection: 'row', alignItems: 'center', columnGap: 6, backgroundColor: '#f59e0b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999 },
  coinText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Progress card
  progressCard: {
    borderRadius: CARD_RADIUS + 6,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  progressLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginBottom: 6 },
  progressSteps: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 30 },
  progressGoal: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 },

  /** NEW: ring + inner chip */
  progressRingWrap: { width: 92, height: 92, position: 'relative' },
  progressSvg: { position: 'absolute', top: 0, left: 0, transform: [{ rotate: '-90deg' }] },
  progressInner: {
    position: 'absolute',
    top: 10, left: 10,
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  progressPct: { color: '#fff', fontSize: 18, fontWeight: '800' },

  /** pills row */
  progressStatsRow: { flexDirection: 'row', columnGap: 12, marginTop: 14 },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  statValue: { color: '#fff', fontWeight: '800', marginTop: 4, fontSize: 14 },
  statLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 12, marginTop: 2 },

  // Section headings / links
  h3: { fontWeight: '700', color: '#111827', fontSize: 16, marginBottom: 8 },
  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 13 },

  // Tasks
  taskCard: { borderRadius: 16, padding: 12, borderWidth: 2 },
  taskCardDone: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  taskCardTodo: { backgroundColor: '#fff', borderColor: '#f3f4f6' },
  chk: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chkOn: { backgroundColor: '#22c55e' },
  chkOff: { backgroundColor: '#e5e7eb' },
  taskText: { fontSize: 14, color: '#111827' },
  taskTextDone: { color: '#15803d', textDecorationLine: 'line-through' },
  coinSmall: { fontSize: 12, fontWeight: '700', color: '#4b5563', marginLeft: 4 },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#ec4899', borderRadius: 9999 },
  progressSmall: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  quickItem: { width: QUICK_ITEM_W, alignItems: 'center', marginRight: 4, marginVertical: 8 },
  quickIconBox: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
    marginBottom: 6,
  },
  quickLabel: { fontSize: 12, color: '#374151', fontWeight: '600' },

  // Services cards
  serviceCard: { height: 128, borderRadius: 16, overflow: 'hidden' },
  serviceImage: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  serviceOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.8, borderRadius: 16 },
  serviceContent: { flex: 1, padding: 16, justifyContent: 'space-between' },
  serviceTitle: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 4 },
  serviceSubtitle: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
  serviceBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  serviceBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Quick access
  quickAccessRow: { flexDirection: 'row', columnGap: 12 },
  accessCard: { flex: 1, borderRadius: 16, padding: 16 },
  accessTitle: { color: '#fff', fontWeight: '800', marginTop: 8 },
  accessSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

  // Shop small cards
  productCardSmall: {
    width: 160, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginRight: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  productImageWrap: { height: 160, backgroundColor: '#f3f4f6' },
  productImage: { width: '100%', height: '100%' },
  productTag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  productTagText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  productBody: { padding: 12 },
  productCat: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  ratingText: { fontSize: 12, color: '#4b5563', marginLeft: 4 },
  ratingCount: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  price: { color: '#db2777', fontWeight: '800', fontSize: 14 },
  priceStrike: { color: '#9ca3af', fontSize: 12, textDecorationLine: 'line-through' },
  addSmall: { width: 28, height: 28, backgroundColor: '#ec4899', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Services (full list)
  serviceTall: { height: 224, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  serviceTallImg: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  serviceTallOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 16 },
  serviceTallBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20 },
  serviceTallTitle: { color: '#fff', fontWeight: '800', fontSize: 20, marginBottom: 4 },
  serviceTallSub: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginBottom: 10 },
  learnBtn: { backgroundColor: '#fff', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  learnBtnText: { color: '#111827', fontWeight: '600', fontSize: 13 },

  // Shop search & chips
  searchIcon: { position: 'absolute', left: 12, top: 12 },
  searchInput: { backgroundColor: '#f3f4f6', paddingVertical: 10, paddingLeft: 40, paddingRight: 12, borderRadius: 9999, fontSize: 14, color: '#111827' },
  catChip: { borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  catChipActive: { backgroundColor: '#db2777' },
  catChipInactive: { backgroundColor: '#f3f4f6' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  catTextInactive: { color: '#374151', fontWeight: '600' },

  // 2-col grid
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productCard: {
    width: (SCREEN_WIDTH - 16 * 2 - 12) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productImgBigWrap: { height: 176, backgroundColor: '#f3f4f6' },
  productImgBig: { width: '100%', height: '100%' },

  // Tabs (kept here if you render custom tabs outside)
  tabBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tabRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 8 },
  tabItem: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8 },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#db2777', marginTop: 4 },
});

export default memo(MainHomeScreen);
