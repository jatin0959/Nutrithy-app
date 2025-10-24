import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Star, Plus } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Product = {
  id: number | string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
};

export default function ShopGrid({
  products,
  onPressProduct,
}: {
  products: Product[];
  onPressProduct: (id: number | string) => void;
}) {
  return (
    <View style={styles.grid}>
      {products.map((p) => (
        <Pressable key={p.id} onPress={() => onPressProduct(p.id)} style={styles.card}>
          <View style={styles.imgWrap}>
            <Image source={{ uri: p.image }} style={styles.img} />
            <View style={styles.tag}><Text style={styles.tagText}>{p.tag}</Text></View>
          </View>
          <View style={{ padding: 12 }}>
            <Text style={styles.cat}>{p.category}</Text>
            <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
            <View style={styles.row}>
              <Star size={12} color="#facc15" fill="#facc15" />
              <Text style={styles.rating}>{p.rating}</Text>
              <Text style={styles.reviews}>({p.reviews})</Text>
            </View>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.price}>{p.price}</Text>
                {p.originalPrice ? <Text style={styles.strike}>{p.originalPrice}</Text> : null}
              </View>
              <View style={styles.addBtn}><Plus size={16} color="#fff" /></View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const CARD_W = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    width: CARD_W, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  imgWrap: { height: 176, backgroundColor: '#f3f4f6' },
  img: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  tagText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  cat: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rating: { fontSize: 12, color: '#4b5563', marginLeft: 4 },
  reviews: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  price: { color: '#db2777', fontWeight: '800', fontSize: 14 },
  strike: { color: '#9ca3af', fontSize: 12, textDecorationLine: 'line-through' },
  addBtn: { width: 28, height: 28, backgroundColor: '#ec4899', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
