import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, LayoutChangeEvent, ViewStyle, AccessibilityState } from 'react-native';

type CollapsibleRootProps = {
  open?: boolean;              // controlled
  defaultOpen?: boolean;       // uncontrolled initial
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
};

type Ctx = {
  open: boolean;
  disabled?: boolean;
  toggle: () => void;
};

const Ctx = createContext<Ctx | null>(null);

export function Collapsible({ open, defaultOpen = false, onOpenChange, disabled, style, children }: CollapsibleRootProps) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState<boolean>(defaultOpen);
  const isOpen = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!isOpen);
  }, [disabled, isOpen, setOpen]);

  const value = useMemo<Ctx>(() => ({ open: isOpen, disabled, toggle }), [isOpen, disabled, toggle]);

  return (
    <Ctx.Provider value={value}>
      <View style={style}>{children}</View>
    </Ctx.Provider>
  );
}

type TriggerProps = {
  asChild?: boolean; // kept for API parity (no-op)
  disabled?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function CollapsibleTrigger({ children, style, disabled: disabledProp }: TriggerProps) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('CollapsibleTrigger must be used within <Collapsible>');
  const disabled = disabledProp ?? ctx.disabled;
  const accessibilityState: AccessibilityState = { expanded: ctx.open, disabled };

  return (
    <Pressable
      onPress={ctx.toggle}
      disabled={!!disabled}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      style={({ pressed }) => [style, pressed && !disabled && { opacity: 0.8 }]}
    >
      {children}
    </Pressable>
  );
}

type ContentProps = {
  children?: React.ReactNode;
  style?: ViewStyle;            // applied to animated wrapper
  contentContainerStyle?: ViewStyle; // applied to inner measured view
  durationMs?: number;
};

export function CollapsibleContent({ children, style, contentContainerStyle, durationMs = 220 }: ContentProps) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('CollapsibleContent must be used within <Collapsible>');

  const measured = useRef(0);
  const height = useRef(new Animated.Value(ctx.open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(height, {
      toValue: ctx.open ? 1 : 0,
      duration: durationMs,
      easing: ctx.open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false, // animating height
    }).start();
  }, [ctx.open, durationMs, height]);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== measured.current) {
      measured.current = h;
      // ensure correct snap after first measure
      height.setValue(ctx.open ? 1 : 0);
    }
  };

  const animatedStyle = {
    height: height.interpolate({
      inputRange: [0, 1],
      outputRange: [0, measured.current || 0],
    }),
    overflow: 'hidden' as const,
  };

  return (
    <Animated.View style={[animatedStyle, style]} accessibilityState={{ expanded: ctx.open }}>
      <View onLayout={onLayout} style={contentContainerStyle}>
        {children}
      </View>
    </Animated.View>
  );
}
