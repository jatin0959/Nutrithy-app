// src/navigation/AuthNavigator.tsx
import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileCreationScreen from '../screens/auth/ProfileCreationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileCreation: { email?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ProfileCreation"
        component={ProfileCreationWrapper}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

// We jump to Root → 'App' when profile is completed
function ProfileCreationWrapper({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParamList, 'ProfileCreation'>) {
  const email = route.params?.email;

  return (
    <ProfileCreationScreen
      initialEmail={email}
      onComplete={() => navigation.getParent()?.navigate('App' as never)}
      // optional: onCancel={() => navigation.navigate('Login')}
    />
  );
}
