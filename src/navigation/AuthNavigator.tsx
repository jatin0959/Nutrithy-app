// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileCreationScreen from '../screens/auth/ProfileCreationScreen';
import MainNavigator from './MainNavigator';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileCreation: { email?: string } | undefined;
  // We push/replace into MainNavigator after auth/profile
  Main: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Wrap ProfileCreation so "Complete" replaces to Main */}
      <Stack.Screen name="ProfileCreation" component={ProfileCreationWrapper} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}

function ProfileCreationWrapper({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParamList, 'ProfileCreation'>) {
  return (
    <ProfileCreationScreen
      // When profile creation completes → Main tabs
      onComplete={() => navigation.replace('Main')}
      // You can also pass route.params?.email to prefill inside the form
    />
  );
}
