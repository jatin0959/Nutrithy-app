// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import AppSplashScreen from "../screens/auth/AppSplashScreen";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [authState, setAuthState] = useState<"checking" | "guest" | "authed">("guest");

  useEffect(() => {
    let alive = true;
    (async () => {
      // TODO: load token / session here
      if (!alive) return;
      setAuthState("guest"); // or "authed" based on your check
    })();
    return () => { alive = false; };
  }, []);

  if (authState === "checking") {
    // Return a navigator (no container) with a single Splash screen
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={AppSplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={authState === "authed" ? "Main" : "Auth"}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
