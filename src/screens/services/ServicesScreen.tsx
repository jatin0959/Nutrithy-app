// screens/services/ServicesScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  Clock,
  Star,
  Heart,
  Sparkles,
  ChevronRight,
  Filter,
  Utensils,
  Dumbbell,
  Wind,
  Stethoscope,
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ServicesStackParamList } from '../../navigation/ServicesStack'; // from the stack you created

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CategoryKey = 'all' | 'nutrition' | 'fitness' | 'wellness' | 'therapy';

const serviceCategories: Array<{
  id: CategoryKey;
  name: string;
  icon: any;
}> = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'nutrition', name: 'Nutrition', icon: Utensils },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'wellness', name: 'Wellness', icon: Wind },
  { id: 'therapy', name: 'Therapy', icon: Stethoscope },
];

const services = [
  {
    id: 1,
    name: 'Personal Nutrition Consultation',
    category: 'nutrition',
    provider: 'Dr. Meera Patel',
    providerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    price: 500,
    originalPrice: 700,
    duration: '45 min',
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1759177670217-72ddf0f95b7d?w=600',
    tag: 'Popular',
    available: true,
  },
  {
    id: 2,
    name: 'Yoga Class (Group)',
    category: 'fitness',
    provider: 'Anita Wellness Center',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 300,
    duration: '60 min',
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?w=600',
    tag: 'Bestseller',
    available: true,
  },
  {
    id: 3,
    name: 'Personal Training Session',
    category: 'fitness',
    provider: 'Rahul Fitness',
    providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    price: 800,
    originalPrice: 1000,
    duration: '60 min',
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?w=600',
    tag: 'Premium',
    available: true,
  },
  {
    id: 4,
    name: 'Meditation & Mindfulness',
    category: 'wellness',
    provider: 'Zen Wellness Studio',
    providerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    price: 400,
    duration: '45 min',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=600',
    tag: 'New',
    available: true,
  },
  {
    id: 5,
    name: 'Therapeutic Massage',
    category: 'therapy',
    provider: 'Healing Touch Spa',
    providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    price: 1200,
    originalPrice: 1500,
    duration: '90 min',
    rating: 4.9,
    reviews: 278,
    image: 'https://images.unsplash.com/photo-1737352777897-e22953991a32?w=600',
    tag: 'Premium',
    available: true,
  },
  {
    id: 6,
    name: 'Mental Health Counseling',
    category: 'therapy',
    provider: 'Dr. Vikram Singh',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    price: 1500,
    duration: '60 min',
    rating: 5.0,
    reviews: 198,
    image: 'https://images.unsplash.com/photo-1581461356013-c5229dcb670c?w=600',
    tag: 'Top Rated',
    available: true,
  },
  {
    id: 7,
    name: 'Diet Planning Service',
    category: 'nutrition',
    provider: 'Nutritionist Priya',
    providerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    price: 600,
    originalPrice: 800,
    duration: '30 min',
    rating: 4.8,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1670164747721-d3500ef757a6?w=600',
    tag: 'Popular',
    available: true,
  },
  {
    id: 8,
    name: 'Zumba Dance Class',
    category: 'fitness',
    provider: 'Dance Fitness Hub',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 350,
    duration: '60 min',
    rating: 4.7,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=600',
    tag: 'Fun',
    available: true,
  },
  {
    id: 9,
    name: 'Stress Management Workshop',
    category: 'wellness',
    provider: 'Wellness Warriors',
    providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    price: 900,
    duration: '120 min',
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    tag: 'Workshop',
    available: true,
  },
  {
    id: 10,
    name: 'Prenatal Yoga',
    category: 'wellness',
    provider: 'Mother Care Studio',
    providerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    price: 450,
    duration: '60 min',
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    tag: 'Specialized',
    available: true,
  },
  {
    id: 11,
    name: 'Sports Nutrition Consult',
    category: 'nutrition',
    provider: 'Dr. Arjun Kapoor',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    price: 700,
    duration: '45 min',
    rating: 4.9,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
    tag: 'Specialized',
    available: true,
  },
  {
    id: 12,
    name: 'Pilates Class',
    category: 'fitness',
    provider: 'Core Strength Studio',
    providerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    price: 500,
    duration: '60 min',
    rating: 4.8,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    tag: 'Trending',
    available: true,
  },
  {
    id: 13,
    name: 'Sleep Therapy Session',
    category: 'therapy',
    provider: 'Sleep Wellness Center',
    providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    price: 1100,
    duration: '60 min',
    rating: 4.7,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600',
    tag: 'New',
    available: true,
  },
  {
    id: 14,
    name: 'Weight Management Program',
    category: 'nutrition',
    provider: 'Health First Clinic',
    providerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    price: 2000,
    originalPrice: 2500,
    duration: '90 min',
    rating: 4.9,
    reviews: 267,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    tag: 'Program',
    available: true,
  },
  {
    id: 15,
    name: 'Acupuncture Therapy',
    category: 'therapy',
    provider: 'Alternative Healing',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    price: 1300,
    duration: '60 min',
    rating: 4.8,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    tag: 'Alternative',
    available: true,
  },
];

export default function ServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ServicesStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [query, setQuery] = useState('');

  const filteredServices = useMemo(() => {
    let list =
      selectedCategory === 'all'
        ? services
        : services.filter((s) => s.category === selectedCategory);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.tag.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedCategory, query]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const goToConsultation = (svc: { id: number; name: string }) => {
    navigation.navigate('Consultation', { serviceId: svc.id, serviceName: svc.name });
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Pressable
            onPress={() => navigation.getParent()?.navigate('Home')}
            style={s.iconBtn}
          >
            <ArrowLeft size={20} color="#374151" />
          </Pressable>
          <Text style={s.title}>Services</Text>
          <Pressable style={s.iconBtn}>
            <Filter size={20} color="#374151" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={18} color="#9ca3af" style={s.searchIcon} />
          <TextInput
            placeholder="Search services..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            style={s.searchInput}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={s.catRow}>
            {serviceCategories.map((c) => {
              const active = selectedCategory === c.id;
              const Icon = c.icon;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCategory(c.id)}
                  style={[s.catChip, active ? s.catChipActive : s.catChipInactive]}
                >
                  <Icon size={16} color={active ? '#fff' : '#374151'} />
                  <Text style={active ? s.catTextActive : s.catTextInactive}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <View style={{ rowGap: 12 }}>
          {filteredServices.map((service) => {
            const isFavorite = favorites.includes(service.id);
            const saved = service.originalPrice ? service.originalPrice - service.price : 0;

            return (
              <Pressable
                key={service.id}
                onPress={() => goToConsultation(service)}
                style={s.card}
              >
                {/* Image + overlay */}
                <View style={{ height: 160 }}>
                  <Image source={{ uri: service.image }} style={s.cardImg} />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={s.cardImgOverlay}
                  />
                  {/* Tag */}
                  <View style={s.tagChip}>
                    <Text style={s.tagText}>{service.tag}</Text>
                  </View>
                  {/* Favorite */}
                  <Pressable
                    onPress={() => toggleFavorite(service.id)}
                    style={s.favBtn}
                  >
                    <Heart
                      size={16}
                      color={isFavorite ? '#ec4899' : '#374151'}
                      fill={isFavorite ? '#ec4899' : 'transparent'}
                    />
                  </Pressable>
                  {/* Title */}
                  <View style={s.cardTitleWrap}>
                    <Text style={s.cardTitle} numberOfLines={2}>
                      {service.name}
                    </Text>
                  </View>
                </View>

                {/* Body */}
                <View style={{ padding: 14 }}>
                  {/* Provider */}
                  <View style={[s.row, { marginBottom: 10 }]}>
                    <Image source={{ uri: service.providerImage }} style={s.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.provider}>{service.provider}</Text>
                      <View style={[s.row, { columnGap: 4 }]}>
                        <Star size={12} color="#facc15" fill="#facc15" />
                        <Text style={s.ratingText}>{service.rating}</Text>
                        <Text style={s.ratingCount}>({service.reviews})</Text>
                      </View>
                    </View>
                  </View>

                  {/* Info row */}
                  <View style={[s.row, { columnGap: 12, marginBottom: 10 }]}>
                    <View style={[s.row, { columnGap: 6 }]}>
                      <Clock size={14} color="#4b5563" />
                      <Text style={s.infoText}>{service.duration}</Text>
                    </View>
                    {service.available ? (
                      <View style={s.availablePill}>
                        <Text style={s.availableText}>Available</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Price + Book */}
                  <View style={s.rowBetween}>
                    <View>
                      <View style={[s.row, { columnGap: 8 }]}>
                        <Text style={s.price}>₹{service.price}</Text>
                        {service.originalPrice ? (
                          <Text style={s.priceStrike}>₹{service.originalPrice}</Text>
                        ) : null}
                      </View>
                      {service.originalPrice ? (
                        <Text style={s.saveText}>Save ₹{saved}</Text>
                      ) : null}
                    </View>

                    <Pressable onPress={() => goToConsultation(service)} style={s.bookBtn}>
                      <LinearGradient
                        colors={['#ec4899', '#8b5cf6']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={s.bookBtnGradient}
                      >
                        <Text style={s.bookText}>Book</Text>
                        <ChevronRight size={16} color="#fff" />
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_RADIUS = 18;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Header
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 16, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { padding: 8, borderRadius: 9999 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },

  // Search
  searchIcon: { position: 'absolute', left: 12, top: 12 },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 14,
    color: '#111827',
  },

  // Categories
  catRow: { flexDirection: 'row', columnGap: 8, paddingRight: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', columnGap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999 },
  catChipActive: { backgroundColor: '#db2777' },
  catChipInactive: { backgroundColor: '#f3f4f6' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  catTextInactive: { color: '#374151', fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardImg: { width: '100%', height: '100%', position: 'absolute', inset: 0 },
  cardImgOverlay: { position: 'absolute', inset: 0 },
  tagChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 9999,
  },
  tagText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  // Provider & info
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#f3f4f6' },
  provider: { color: '#111827', fontWeight: '600', fontSize: 13 },
  ratingText: { fontSize: 12, color: '#4b5563' },
  ratingCount: { fontSize: 12, color: '#9ca3af' },
  infoText: { fontSize: 13, color: '#4b5563' },
  availablePill: { backgroundColor: '#ecfdf5', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  availableText: { color: '#059669', fontSize: 12, fontWeight: '600' },

  // Price & book
  price: { color: '#db2777', fontWeight: '800', fontSize: 18 },
  priceStrike: { color: '#9ca3af', fontSize: 13, textDecorationLine: 'line-through' },
  saveText: { color: '#059669', fontSize: 12, fontWeight: '600', marginTop: 2 },

  bookBtn: { borderRadius: 12, overflow: 'hidden' },
  bookBtnGradient: { flexDirection: 'row', alignItems: 'center', columnGap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  bookText: { color: '#fff', fontWeight: '800' },
});




// import React from 'react';
// import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
// import ServicesList from '../../components/ServicesList';
// import { services } from '../../data/homeeData';
// import { useNavigation } from '@react-navigation/native';
// import type { NavigationProp } from '@react-navigation/native';
// import type { MainTabParamList } from '../../navigation/MainNavigator';
// import { ArrowLeft } from 'lucide-react-native';

// export default function ServicesScreen() {
//   const navigation = useNavigation<NavigationProp<MainTabParamList>>();

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Services</Text>
//       </View>
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
//         <ServicesList
//           services={services}
//           onPressService={(id) => {
//             // For consultation screen unified route
//             if (id === 'consultation') navigation.navigate('Services'); // or navigate to a stack: navigation.navigate('Consultation')
//             // If you have per-service routes, adjust here as needed:
//             // navigation.navigate('Consultation', { serviceId: id })
//           }}
//         />
//       </ScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//   title: { fontSize: 16, fontWeight: '700', color: '#111827' },
// });
