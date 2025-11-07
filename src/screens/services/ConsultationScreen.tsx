// screens/consultation/ConsultationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Star,
  CheckCircle,
  Phone,
  Video,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../../navigation/MainNavigator'; // adjust path if needed

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConsultationScreenProps {
  onNavigate?: (screen: string) => void;
}

const nutritionists = [
  {
    id: 1,
    name: 'Dr. Anjali Mehta',
    specialty: 'Clinical Nutritionist',
    experience: '12+ years',
    rating: 4.9,
    reviews: 342,
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    languages: ['English', 'Hindi', 'Gujarati'],
    badges: ['Top Rated', 'Verified'],
  },
  {
    id: 2,
    name: 'Dr. Rajesh Kumar',
    specialty: 'Sports Nutritionist',
    experience: '10+ years',
    rating: 4.8,
    reviews: 289,
    price: '₹899',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    languages: ['English', 'Hindi'],
    badges: ['Verified'],
  },
  {
    id: 3,
    name: 'Dr. Priya Sharma',
    specialty: 'Weight Management Expert',
    experience: '8+ years',
    rating: 4.9,
    reviews: 421,
    price: '₹1,199',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    languages: ['English', 'Hindi', 'Marathi'],
    badges: ['Top Rated', 'Verified', 'Most Booked'],
  },
];

const timeSlots = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','02:00 PM','02:30 PM',
  '03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];

export function ConsultationScreen({ onNavigate }: ConsultationScreenProps) {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const go = (screen: keyof MainTabParamList | string) => {
    if (typeof onNavigate === 'function') return onNavigate(screen);
 
    navigation.navigate(screen as any);
  };

  const [selectedNutritionist, setSelectedNutritionist] = useState<number | null>(null);
  const [selectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] =
    useState<'video' | 'phone' | 'inperson'>('video');

  const handleBookConsultation = () => {
    Alert.alert('Success', 'Consultation booked successfully!', [
      { text: 'OK', onPress: () => go('Home') },
    ]);
  };

  const formattedDate = `${selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
  })}, ${selectedDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })}`;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Pressable onPress={() => go('Home')} style={s.iconBtn}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View>
            <Text style={s.title}>Book Consultation</Text>
            <Text style={s.subtitle}>Expert nutrition guidance</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Consultation Type */}
        <View style={{ marginBottom: 16 }}>
          <Text style={s.sectionTitle}>Select Consultation Type</Text>
          <View style={s.typeGrid}>
            {[
              { id: 'video', label: 'Video Call', icon: Video },
              { id: 'phone', label: 'Phone Call', icon: Phone },
              { id: 'inperson', label: 'In Person', icon: UserIcon },
            ].map((type) => {
              const active = consultationType === (type.id as any);
              const Icon = type.icon;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setConsultationType(type.id as any)}
                  style={[s.typeCard, active ? s.typeCardActive : s.typeCardIdle]}
                >
                  <Icon size={22} color={active ? '#db2777' : '#9ca3af'} />
                  <Text style={[s.typeText, active ? s.typeTextActive : s.typeTextIdle]}>
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Select Nutritionist */}
        <View style={{ marginBottom: 16 }}>
          <Text style={s.sectionTitle}>Choose Your Expert</Text>
          <View style={{ rowGap: 12 }}>
            {nutritionists.map((n) => {
              const active = selectedNutritionist === n.id;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => setSelectedNutritionist(n.id)}
                  style={[s.card, active ? s.cardActive : s.cardIdle]}
                >
                  <View style={s.rowStart}>
                    <Image source={{ uri: n.image }} style={s.avatarLg} />
                    <View style={{ flex: 1 }}>
                      <View style={s.rowBetween}>
                        <View>
                          <Text style={s.name}>{n.name}</Text>
                          <Text style={s.specialty}>{n.specialty}</Text>
                        </View>
                        {active ? <CheckCircle size={20} color="#db2777" /> : null}
                      </View>

                      <View style={[s.row, { marginTop: 4, marginBottom: 6 }]}>
                        <View style={s.row}>
                          <Star size={14} color="#facc15" fill="#facc15" />
                          <Text style={s.ratingNum}>{n.rating}</Text>
                        </View>
                        <Text style={s.meta}>({n.reviews} reviews)</Text>
                        <Text style={s.dot}>•</Text>
                        <Text style={s.meta}>{n.experience}</Text>
                      </View>

                      <View style={s.badgesRow}>
                        {n.badges.map((b, i) => (
                          <View key={i} style={s.badge}>
                            <Text style={s.badgeText}>{b}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={s.rowBetween}>
                        <Text style={s.langs}>{n.languages.join(', ')}</Text>
                        <Text style={s.price}>{n.price}/session</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Select Time Slot */}
        {selectedNutritionist ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.sectionTitle}>Select Time Slot</Text>
            <View style={[s.cardPlain]}>
              <View style={[s.row, { marginBottom: 12 }]}>
                <CalendarIcon size={20} color="#db2777" />
                <Text style={s.dateText}>{formattedDate}</Text>
              </View>

              <View style={s.slotGrid}>
                {timeSlots.map((t) => {
                  const active = selectedTime === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setSelectedTime(t)}
                      style={[s.slotCard, active ? s.slotActive : s.slotIdle]}
                    >
                      <Clock size={14} color={active ? '#db2777' : '#6b7280'} />
                      <Text style={[s.slotText, active ? s.slotTextActive : s.slotTextIdle]}>
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Fixed Book Button */}
      {selectedNutritionist && selectedTime ? (
        <View style={s.bookBar}>
          <Pressable onPress={handleBookConsultation} style={s.bookPressable}>
            <LinearGradient
              colors={['#ec4899', '#8b5cf6']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.bookGradient}
            >
              <Text style={s.bookLabel}>
                Book Consultation -{' '}
                {
                  nutritionists.find((n) => n.id === selectedNutritionist)!
                    .price
                }
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const GAP = 12;
const COL3 = (SCREEN_WIDTH - 16 * 2 - GAP * 2) / 3;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' }, // light pink-ish bg
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 16,
    paddingBottom: 10,
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', columnGap: 12 },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: 'transparent' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },

  // Type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GAP,
    rowGap: GAP,
  },
  typeCard: {
    width: COL3,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  typeCardActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  typeCardIdle: { borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
  typeText: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  typeTextActive: { color: '#db2777' },
  typeTextIdle: { color: '#6b7280' },

  // Cards
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  cardActive: { borderColor: '#db2777', elevation: 2 },
  cardIdle: { borderColor: '#f3f4f6' },
  cardPlain: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowStart: { flexDirection: 'row', alignItems: 'flex-start', columnGap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  avatarLg: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  specialty: { fontSize: 13, color: '#4b5563', marginTop: 2 },

  ratingNum: { marginLeft: 4, fontSize: 13, color: '#111827', fontWeight: '700' },
  meta: { fontSize: 12, color: '#9ca3af', marginLeft: 6 },
  dot: { fontSize: 12, color: '#9ca3af', marginHorizontal: 6 },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  badge: { backgroundColor: '#ffe4e6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#db2777', fontSize: 11, fontWeight: '800' },

  langs: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 14, color: '#db2777', fontWeight: '800' },

  // Date + slots
  dateText: { marginLeft: 8, fontSize: 14, color: '#111827', fontWeight: '600' },
  slotGrid: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GAP,
    rowGap: GAP,
  },
  slotCard: {
    width: COL3,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  slotActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  slotIdle: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  slotText: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  slotTextActive: { color: '#db2777' },
  slotTextIdle: { color: '#4b5563' },

  // Book bar
  bookBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bookPressable: { borderRadius: 16, overflow: 'hidden' },
  bookGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  bookLabel: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default ConsultationScreen;
