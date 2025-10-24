import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import ShopGrid from '../../components/ShopGrid';
import { products } from '../../data/homeeData';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../../navigation/MainNavigator';
import { Search } from 'lucide-react-native';

export default function ShopScreen() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={styles.searchIcon} />
            <TextInput placeholder="Search products..." placeholderTextColor="#9ca3af" style={styles.searchInput} />
          </View>
        </View>

        <ShopGrid
          products={products}
          onPressProduct={(id) => {
            // route to your product detail screen
            navigation.navigate('Shop'); // or navigation.navigate('ProductDetail', { id })
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  searchIcon: { position: 'absolute', left: 12, top: 12 },
  searchInput: { backgroundColor: '#f3f4f6', paddingVertical: 10, paddingLeft: 40, paddingRight: 12, borderRadius: 9999, fontSize: 14, color: '#111827' },
});
