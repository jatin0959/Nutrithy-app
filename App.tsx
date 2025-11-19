// App.tsx
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import WelcomeScreen from './src/screens/welcome/WelcomeScreen';
import AuthNavigator from './src/navigation/AuthNavigator';

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  App: undefined; // <- AppNavigator (which contains MainNavigator)
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const STORAGE_KEY = 'hasLaunched_v2';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] =
    useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    (async () => {
      try {
        const launched = await AsyncStorage.getItem(STORAGE_KEY);
        setInitialRouteName(launched === 'true' ? 'App' : 'Onboarding');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        edges={['top', 'left', 'right']}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <RootStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{ headerShown: false }}
          >
            <RootStack.Screen name="Onboarding" component={WelcomeScreen} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            {/* IMPORTANT: use AppNavigator, not MainNavigator */}
            <RootStack.Screen name="App" component={AppNavigator} />
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
