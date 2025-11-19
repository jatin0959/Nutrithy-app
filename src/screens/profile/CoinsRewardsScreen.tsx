import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type Coupon = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  highlight: string;
  coins: number;
};

const COUPONS: Coupon[] = [
  {
    id: '1',
    category: 'Shop',
    title: '10% Off on Shop',
    subtitle: 'Valid until Dec 31, 2025',
    highlight: '10%',
    coins: 100,
  },
  {
    id: '2',
    category: 'Services',
    title: '₹200 Off Services',
    subtitle: 'Valid until Dec 31, 2025',
    highlight: '₹200',
    coins: 150,
  },
  {
    id: '3',
    category: 'Fitness',
    title: 'Free Yoga Class',
    subtitle: 'Valid until Dec 31, 2025',
    highlight: 'FREE',
    coins: 200,
  },
];

const CoinsRewardsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    
      <View style={styles.container}>
        {/* HEADER */}
        <LinearGradient
          colors={['#FFB347', '#FF5F6D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Coins & Rewards</Text>

            {/* spacer to balance back button */}
            <View style={{ width: 32 }} />
          </View>

          {/* BALANCE CARD */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>

            <View style={styles.balanceRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={26} color="#FFD94A" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.balanceAmount}>850</Text>
                  <Text style={styles.balanceSub}>Nutrithy Coins</Text>
                </View>
              </View>

              <View style={styles.crownCircle}>
                <Ionicons name="trophy-outline" size={26} color="#FF6FB5" />
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>
              150 coins to next reward tier
            </Text>
          </View>
        </LinearGradient>

        {/* BODY */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION TITLE */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Redeem Coupons</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* COUPON LIST */}
          {COUPONS.map((coupon) => (
            <TouchableOpacity key={coupon.id} style={styles.couponCard}>
              {/* Background image area – you can replace this with ImageBackground if you have real images */}
              <ImageBackground
                style={styles.couponImage}
                imageStyle={{ borderRadius: 18 }}
                source={require('../../assets/images/wel3.png')} // temporary placeholder
                resizeMode="cover"
              >
                <View style={styles.couponOverlay}>
                  {/* Category pill */}
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{coupon.category}</Text>
                  </View>

                  {/* Middle text */}
                  <View style={styles.couponTextBlock}>
                    <Text style={styles.couponTitle}>{coupon.title}</Text>
                    <Text style={styles.couponHighlight}>
                      {coupon.highlight}
                    </Text>
                    <Text style={styles.couponSubtitle}>
                      {coupon.subtitle}
                    </Text>
                  </View>

                  {/* Coins badge */}
                  <View style={styles.coinBadge}>
                    <Ionicons
                      name="star"
                      size={18}
                      color="#FFB800"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.coinText}>{coupon.coins}</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
   
  );
};

export default CoinsRewardsScreen;

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceCard: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFEFEF',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceSub: {
    fontSize: 12,
    color: '#FFEFEF',
  },
  crownCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    width: '65%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFD94A',
  },
  progressText: {
    fontSize: 12,
    color: '#FFEFEF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5F6D',
  },
  couponCard: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 4,
    shadowColor: '#00000050',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  couponImage: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-end',
  },
  couponOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  couponTextBlock: {
    marginTop: 24,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  couponHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD94A',
    marginTop: 2,
  },
  couponSubtitle: {
    fontSize: 11,
    color: '#F1F1F1',
    marginTop: 2,
  },
  coinBadge: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
});
