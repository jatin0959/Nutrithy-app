// Tabs.tsx (React Native / Expo)
// Converted from Radix Tabs to a lightweight RN implementation with animated indicator.
// API parity: <Tabs value/defaultValue onValueChange> + <TabsList> + <TabsTrigger value="..."> + <TabsContent value="...">

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
  useColorScheme,
  ViewStyle,
  TextStyle,
} from 'react-native';

type TabsContextValue = {
  value: string | undefined;
  setValue: (v: string) => void;
  registerTriggerLayout: (val: string, x: number, w: number) => void;
  isDisabled?: boolean;
};

const TabsCtx = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
};

/* -------------------------------- Tabs Root -------------------------------- */

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
};

export function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  children,
  style,
  disabled,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;

  const setValue = useCallback(
    (v: string) => {
      if (controlled === undefined) setInternal(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange]
  );

  // trigger layouts (for indicator)
  const layoutsRef = useRef<Record<string, { x: number; w: number }>>({});
  const registerTriggerLayout = useCallback((val: string, x: number, w: number) => {
    layoutsRef.current[val] = { x, w };
  }, []);

  const ctx = useMemo(
    () => ({ value, setValue, registerTriggerLayout, isDisabled: disabled }),
    [value, setValue, registerTriggerLayout, disabled]
  );

  return (
    <TabsCtx.Provider value={ctx}>
      <View style={[styles.root, style]}>{children}</View>
    </TabsCtx.Provider>
  );
}

/* ------------------------------- Tabs List --------------------------------- */

type TabsListProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function TabsList({ children, style }: TabsListProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bg = isDark ? '#111827' : '#F3F4F6';
  const fg = isDark ? '#9CA3AF' : '#6B7280';

  // animated indicator
  const { value } = useTabs();
  const translateX = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;
  const { registerTriggerLayout } = useTabs();

  // expose measure function to children through context ref usage (already available)
  useEffect(() => {
    // no-op here, actual animation happens when trigger registers layout and when active value changes
  }, []);

  // small helper to kick indicator to a position
  const animateTo = useCallback(
    (x: number, w: number) => {
      Animated.parallel([
        Animated.timing(translateX, { toValue: x, duration: 180, useNativeDriver: true }),
        Animated.timing(width, { toValue: w, duration: 180, useNativeDriver: false }),
      ]).start();
    },
    [translateX, width]
  );

  // Children <TabsTrigger> will call registerTriggerLayout; we listen via a layout map
  const lastLayouts = useRef<Record<string, { x: number; w: number }>>({});
  // Wrap the register to also stash a copy for this component
  const _register = useCallback(
    (val: string, x: number, w: number) => {
      registerTriggerLayout(val, x, w);
      lastLayouts.current[val] = { x, w };
      // If this trigger is the active one, move indicator
      if (val === value && x >= 0 && w > 0) animateTo(x, w);
    },
    [registerTriggerLayout, animateTo, value]
  );

  // Provide a cloned context with overridden register just for this list scope
  const parent = useTabs();
  const proxyCtx = useMemo(() => ({ ...parent, registerTriggerLayout: _register }), [parent, _register]);

  // Keep indicator in sync when value changes (after some layout has been recorded)
  useEffect(() => {
    if (!value) return;
    const l = lastLayouts.current[value];
    if (l) animateTo(l.x, l.w);
  }, [value, animateTo]);

  return (
    <TabsCtx.Provider value={proxyCtx}>
      <View style={[styles.list, { backgroundColor: bg, borderColor: isDark ? '#1F2937' : '#E5E7EB' }, style]}>
        {/* Animated selection pill */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              transform: [{ translateX }],
              width,
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            },
          ]}
        />
        <View style={styles.listInner}>{children}</View>
      </View>
    </TabsCtx.Provider>
  );
}

/* ------------------------------ Tabs Trigger -------------------------------- */

type TabsTriggerProps = {
  value: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function TabsTrigger({ value, children, style, textStyle, disabled }: TabsTriggerProps) {
  const { value: active, setValue, registerTriggerLayout, isDisabled } = useTabs();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const activeColor = isDark ? '#F9FAFB' : '#111827';
  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';

  const onLayout = (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    registerTriggerLayout(value, x, width);
  };

  const isActive = active === value;

  return (
    <Pressable
      onLayout={onLayout}
      onPress={() => setValue(value)}
      disabled={disabled || isDisabled}
      style={[
        styles.trigger,
        {
          // keep height similar to h-9 -> 36
          opacity: disabled || isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: !!(disabled || isDisabled) }}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.triggerText,
          { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? '600' : '500' },
          textStyle,
        ]}
      >
        {typeof children === 'string' ? children : (children as any)}
      </Text>
    </Pressable>
  );
}

/* ------------------------------ Tabs Content -------------------------------- */

type TabsContentProps = {
  value: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function TabsContent({ value, children, style }: TabsContentProps) {
  const { value: active } = useTabs();
  if (active !== value) return null;
  return <View style={[styles.content, style]}>{children}</View>;
}

/* ---------------------------------- Styles ---------------------------------- */

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    gap: 8,
  },
  list: {
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: 12,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  listInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    // width is animated; translateX is animated
  },
  trigger: {
    minWidth: 64,
    height: 36,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  triggerText: {
    fontSize: 14,
  },
  content: {
    flexGrow: 1,
  },
});

/* ---------------------------------- Usage -----------------------------------
<Tabs defaultValue="account" onValueChange={(v) => console.log(v)}>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>

  <TabsContent value="account">
    <Text>Account settings...</Text>
  </TabsContent>
  <TabsContent value="password">
    <Text>Password form...</Text>
  </TabsContent>
  <TabsContent value="billing">
    <Text>Billing portal...</Text>
  </TabsContent>
</Tabs>
------------------------------------------------------------------------------- */
