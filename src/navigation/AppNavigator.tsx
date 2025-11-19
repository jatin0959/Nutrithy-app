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
  const [authState, setAuthState] = useState<"checking" | "guest" | "authed">(
    "checking"
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      // TODO: load token / session here
      if (!alive) return;
      // decide "guest" vs "authed"
      setAuthState("guest");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const initialRoute =
    authState === "checking"
      ? "Splash"
      : authState === "authed"
      ? "Main"
      : "Auth";

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      {/* keep ALL screens declared in this stack */}
      {/* <Stack.Screen name="Splash" component={AppSplashScreen} /> */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
