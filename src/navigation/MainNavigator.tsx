// MainNavigator.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Heart, Sparkles, Leaf, User } from 'lucide-react-native';

import MainHomeScreen from '../screens/home/MainHomeScreen';
import ServicesStack, { ServicesStackParamList } from './NavigatioStack';
import ThriveScreen from '../screens/thrive/ThriveScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChallengesScreen from '../screens/game/ChallengesScreen';

import ShopScreen from '../screens/shop/ShopScreen';
import CoinsRewardsScreen from '../screens/profile/CoinsRewardsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChallengeDetailScreen from '../screens/thrive/ChallengeDetailScreen';
import ChallengeJoinedScreen from '../screens/thrive/ChallengeJoinedScreen';
import ExplorePeopleScreen from '../screens/thrive/ExplorePeopleScreen';
import UserProfileScreen from '../screens/thrive/UserProfileScreen';
import ThriveChatScreen from '../screens/thrive/ThriveChatScreen';
import NotificationsScreen from '../screens/thrive/NotificationsScreen';
import TeamDetailScreen from '../screens/thrive/TeamDetailScreen';
import ThriveCreatePost from '../screens/thrive/ThriveCreatePost';

/* ---------------- TABS TYPES ---------------- */

export type MainTabParamList = {
  Home: undefined;
  Services: NavigatorScreenParams<ServicesStackParamList> | undefined;
  Shop: undefined;
  Thrive: undefined; // hosts nested Thrive stack
  Profile: undefined;
  Game: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/* ---------------- ROOT STACK TYPES (Tabs + Rewards) ---------------- */

export type RootMainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  CoinsRewards: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const RootStack = createNativeStackNavigator<RootMainStackParamList>();

/* ---------------- THRIVE STACK TYPES ---------------- */

export type ThriveStackParamList = {
  ThriveMain: undefined;

  ThriveChallengeDetail: { challengeId: string };
  ThriveChallengeJoined: { challengeId: string };

  ExplorePeople:
  | {
    creatingTeam?: boolean;
  }
  | undefined;

  UserProfile: { userId: string };

  // Group / team profile
  TeamDetail: { teamId: string };

  // Chat screen – supports both DM and group modes
  ThriveChat:
  | {
    mode: 'dm';
    userId: string; // other user id
    name: string;   // header title
  }
  | {
    mode: 'group';
    teamId: string; // group/team id
    name: string;   // group name for header
  };
  ThriveCreatePost: undefined;
};

const ThriveStack = createNativeStackNavigator<ThriveStackParamList>();


/* ---------------- THRIVE STACK NAVIGATOR ---------------- */

function ThriveStackNavigator() {
  return (
    <ThriveStack.Navigator screenOptions={{ headerShown: false }}>
      <ThriveStack.Screen name="ThriveMain" component={ThriveScreen} />
      <ThriveStack.Screen
        name="ThriveChallengeDetail"
        component={ChallengeDetailScreen}
      />
      <ThriveStack.Screen
        name="ThriveChallengeJoined"
        component={ChallengeJoinedScreen}
      />
      <ThriveStack.Screen name="ExplorePeople" component={ExplorePeopleScreen} />
      <ThriveStack.Screen name="UserProfile" component={UserProfileScreen} />

      {/* Group / team profile */}
      <ThriveStack.Screen name="TeamDetail" component={TeamDetailScreen} />

      {/* 1:1 or group chat (uses route.params.mode) */}
      <ThriveStack.Screen name="ThriveChat" component={ThriveChatScreen} />
      <ThriveStack.Screen
        name="ThriveCreatePost"
        component={ThriveCreatePost}
      />
    
    </ThriveStack.Navigator >
  );
}

/* ---------------- CUSTOM TAB BAR ---------------- */

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleItems: Array<{
    name: keyof MainTabParamList;
    label: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
  }> = [
      { name: 'Home', label: 'Home', Icon: Heart },
      { name: 'Services', label: 'Services', Icon: Sparkles },
      { name: 'Thrive', label: 'Thrive', Icon: Leaf },
      { name: 'Profile', label: 'Profile', Icon: User },
    ];

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabRow}>
        {visibleItems.map(({ name, label, Icon }) => {
          const routeIndex = state.routeNames.indexOf(name);
          const isFocused = state.index === routeIndex;
          const color = isFocused ? '#db2777' : '#9ca3af';

          const onPress = () => {
            const targetKey = state.routes[routeIndex]?.key;
            const event = navigation.emit({
              type: 'tabPress',
              target: targetKey,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(name);
            }
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

/* ---------------- BOTTOM TABS ---------------- */

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={MainHomeScreen} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      {/* Thrive tab hosts a nested stack */}
      <Tab.Screen name="Thrive" component={ThriveStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Game" component={ChallengesScreen} />
    </Tab.Navigator>
  );
}

/* ---------------- ROOT STACK ---------------- */

export default function MainNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={MainTabs} />
      <RootStack.Screen name="CoinsRewards" component={CoinsRewardsScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

/* ---------------- STYLES ---------------- */

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

  // placeholder screens
  centerScreen: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
