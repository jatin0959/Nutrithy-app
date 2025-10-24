// MainNavigator.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Heart, Sparkles, ShoppingBag, Users, Trophy } from 'lucide-react-native';

import MainHomeScreen from '../screens/home/MainHomeScreen';
import ServicesStack, {ServicesStackParamList} from './NavigatioStack';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import ThriveScreen from '../screens/thrive/ThriveScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChallengesScreen from '../screens/game/ChallengesScreen';
import ShopScreen from '../screens/shop/ShopScreen';

export type MainTabParamList = {
  Home: undefined;
  // Allow nested navigation into the Services stack:
  Services: NavigatorScreenParams<ServicesStackParamList> | undefined;
  Shop: undefined;
  Thrive: undefined;
  Profile: undefined; // You keep this screen in tabs, but we won't render a button for it
  Game: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// ---- Custom tab bar (replicates the Home screen navbar look) ----
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // We WANT to hide "Profile" in the tab bar but keep it in the navigator.
  // So build the visible items explicitly, then map to the correct route index.
  const visibleItems: Array<{
    name: keyof MainTabParamList;
    label: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
  }> = [
    { name: 'Home',     label: 'Home',     Icon: Heart },
    { name: 'Services', label: 'Services', Icon: Sparkles },
    { name: 'Shop',     label: 'Shop',     Icon: ShoppingBag },
    { name: 'Thrive',   label: 'Thrive',   Icon: Users },
    { name: 'Game',     label: 'Game',     Icon: Trophy },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabRow}>
        {visibleItems.map(({ name, label, Icon }) => {
          // Find the REAL index of this route in the navigator
          const routeIndex = state.routeNames.indexOf(name);
          const isFocused = state.index === routeIndex;
          const color = isFocused ? '#db2777' : '#9ca3af';

          const onPress = () => {
            const targetKey = state.routes[routeIndex]?.key;
            const event = navigation.emit({ type: 'tabPress', target: targetKey, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(name);
          };

          const onLongPress = () => {
            const targetKey = state.routes[routeIndex]?.key;
            navigation.emit({ type: 'tabLongPress', target: targetKey });
          };

          return (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Icon size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
              {isFocused ? <View style={styles.tabDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={MainHomeScreen} />
      {/* ⬇️ Use the Services stack here */}
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Thrive" component={ThriveScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Game" component={ChallengesScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#db2777',
    marginTop: 4,
  },
});
