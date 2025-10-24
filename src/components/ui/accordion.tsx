import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, Animated, Easing, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

type ValueType = string | string[] | undefined;

type AccordionProps = {
  /** 'single' matches Radix. 'multiple' allows many open */
  type?: 'single' | 'multiple';
  /** Controlled value (string for single, string[] for multiple) */
  value?: ValueType;
  /** Uncontrolled default */
  defaultValue?: ValueType;
  /** For 'single', allow closing the only open item */
  collapsible?: boolean;
  /** Called with next value(s) */
  onValueChange?: (v: ValueType) => void;
  children: React.ReactNode;
  style?: ViewStyle;
};

type ItemCtx = {
  value: string;
  open: boolean;
  toggle: () => void;
};

const AccordionContext = createContext<{
  type: 'single' | 'multiple';
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
} | null>(null);

export function Accordion({
  type = 'single',
  value,
  defaultValue,
  collapsible = true,
  onValueChange,
  children,
  style,
}: AccordionProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<ValueType>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return type === 'single' ? undefined : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: ValueType) => {
      onValueChange?.(next);
      if (!isControlled) setInternal(next);
    },
    [isControlled, onValueChange]
  );

  const isOpen = useCallback(
    (id: string) => {
      if (type === 'single') return current === id;
      return Array.isArray(current) && current.includes(id);
    },
    [current, type]
  );

  const toggle = useCallback(
    (id: string) => {
      if (type === 'single') {
        if (current === id) {
          if (collapsible) setValue(undefined);
          return;
        }
        setValue(id);
      } else {
        const arr = Array.isArray(current) ? current.slice() : [];
        const i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1);
        else arr.push(id);
        setValue(arr);
      }
    },
    [type, current, setValue, collapsible]
  );

  const ctx = useMemo(() => ({ type, isOpen, toggle }), [type, isOpen, toggle]);

  return (
    <View style={[styles.accordion, style]}>
      <AccordionContext.Provider value={ctx}>{children}</AccordionContext.Provider>
    </View>
  );
}

type AccordionItemProps = {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

const ItemContext = createContext<ItemCtx | null>(null);

export function AccordionItem({ value, children, style }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used within <Accordion>');

  const open = ctx.isOpen(value);
  const toggle = () => ctx.toggle(value);

  const itemCtx = useMemo(() => ({ value, open, toggle }), [value, open]);

  return (
    <View style={[styles.item, style]}>
      <ItemContext.Provider value={itemCtx}>{children}</ItemContext.Provider>
      <View style={styles.separator} />
    </View>
  );
}

type AccordionTriggerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function AccordionTrigger({ children, style, textStyle, disabled }: AccordionTriggerProps) {
  const item = useContext(ItemContext);
  if (!item) throw new Error('AccordionTrigger must be inside <AccordionItem>');

  const rotation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  // keep icon rotation in sync when parent state changes (e.g., controlled)
  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: item.open ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [item.open, rotation]);

  const rotateZ = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Pressable
      disabled={disabled}
      onPress={item.toggle}
      style={({ pressed }) => [
        styles.trigger,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.triggerText, textStyle]}>{children as any}</Text>
      <Animated.View style={{ transform: [{ rotateZ }] }}>
        <Feather name="chevron-down" size={16} color="#64748b" />
      </Animated.View>
    </Pressable>
  );
}

type AccordionContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

export function AccordionContent({ children, style, contentContainerStyle }: AccordionContentProps) {
  const item = useContext(ItemContext);
  if (!item) throw new Error('AccordionContent must be inside <AccordionItem>');

  const [measured, setMeasured] = useState(0);
  const height = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  // sync animation with open state
  React.useEffect(() => {
    Animated.timing(height, {
      toValue: item.open ? 1 : 0,
      duration: 220,
      easing: item.open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false, // height needs layout
    }).start();
  }, [item.open, height]);

  const onLayout = (e: LayoutChangeEvent) => {
    setMeasured(e.nativeEvent.layout.height);
  };

  const animatedStyle = {
    height: height.interpolate({ inputRange: [0, 1], outputRange: [0, measured] }),
    overflow: 'hidden' as const,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {/* This inner View is measured once and provides the content height */}
      <View onLayout={onLayout} style={[styles.contentInner, contentContainerStyle]}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  accordion: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  item: {
    backgroundColor: 'transparent',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  contentInner: {
    paddingBottom: 12,
  },
});
