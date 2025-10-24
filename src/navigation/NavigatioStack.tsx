// navigation/ServicesStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ServicesScreen from '../screens/services/ServicesScreen';
import ConsultationScreen from '../screens/services/ConsultationScreen';

export type ServicesStackParamList = {
  ServicesList: undefined;
  Consultation: { serviceId: number; serviceName: string };
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesList" component={ServicesScreen} />
      <Stack.Screen name="Consultation" component={ConsultationScreen} />
    </Stack.Navigator>
  );
}
