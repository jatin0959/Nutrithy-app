import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import WelcomeScreen from './src/screens/welcome/WelcomeScreen';
import AuthNavigator from './src/navigation/AuthNavigator';

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined; // <-- nested stack with Login/Register/ProfileCreation
  App: undefined;  // <-- your main tabs (AppNavigator)
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
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <RootStack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Onboarding" component={WelcomeScreen} />
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="App" component={AppNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
