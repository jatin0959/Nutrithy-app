import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -----------------------------------------------------------------------------
 * React Native Select (Radix-like)
 * Exports:
 *  - Select, SelectTrigger, SelectValue, SelectContent
 *  - SelectGroup, SelectItem, SelectLabel, SelectSeparator
 *  - SelectScrollUpButton, SelectScrollDownButton
 * --------------------------------------------------------------------------- */

type Align = 'start' | 'center' | 'end';
type Position = 'popper';

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  value?: string;
  setValue: (v?: string) => void;
  displayMap: Map<string, ReactNode>;
  registerItem: (val: string, label: ReactNode) => void;
  triggerAnchor: { x: number; y: number; w: number; h: number } | null;
  setTriggerAnchor: (a: { x: number; y: number; w: number; h: number } | null) => void;
};

const SelectCtx = createContext<Ctx | null>(null);
function useSelect() {
  const c = useContext(SelectCtx);
  if (!c) throw new Error('Select components must be used within <Select>');
  return c;
}

/* ---------------------------------- Root ---------------------------------- */

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children?: ReactNode;
}) {
  const controlled = typeof value !== 'undefined';
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const [open, _setOpen] = useState(false);
  const [triggerAnchor, setTriggerAnchor] = useState<Ctx['triggerAnchor']>(null);
  const [displayMap] = useState(() => new Map<string, ReactNode>());

  const setOpen = useCallback(
    (v: boolean) => {
      _setOpen(v);
    },
    []
  );

  const setValue = useCallback(
    (v?: string) => {
      if (typeof v === 'string') onValueChange?.(v);
      if (!controlled) setInternal(v);
      setOpen(false);
    },
    [controlled, onValueChange, setOpen]
  );

  const registerItem = useCallback(
    (val: string, label: ReactNode) => {
      if (!displayMap.has(val)) displayMap.set(val, label);
    },
    [displayMap]
  );

  const ctx: Ctx = useMemo(
    () => ({
      open,
      setOpen,
      value: controlled ? value : internal,
      setValue,
      displayMap,
      registerItem,
      triggerAnchor,
      setTriggerAnchor,
    }),
    [open, setOpen, controlled, value, internal, setValue, displayMap, registerItem, triggerAnchor]
  );

  return <SelectCtx.Provider value={ctx}>{children}</SelectCtx.Provider>;
}

/* -------------------------------- Trigger --------------------------------- */

export function SelectTrigger({
  children,
  size = 'default',
  disabled,
  style,
  textStyle,
}: {
  children?: ReactNode;
  size?: 'sm' | 'default';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const { open, setOpen, setTriggerAnchor } = useSelect();
  const ref = useRef<View>(null);

  const toggle = () => {
    if (disabled) return;
    if (!open) {
      ref.current?.measureInWindow((x, y, w, h) => {
        setTriggerAnchor({ x, y, w, h });
        setOpen(true);
      });
    } else setOpen(false);
  };

  return (
    <Pressable
      ref={ref}
      onPress={toggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.trigger,
        size === 'sm' ? styles.triggerSm : styles.triggerDefault,
        pressed && !disabled && { opacity: 0.9 },
        disabled && { opacity: 0.5 },
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.valueRow}>
        {children}
        <Feather name="chevron-down" size={16} style={{ opacity: 0.5 }} />
      </View>
    </Pressable>
  );
}

/* --------------------------------- Value ---------------------------------- */

export function SelectValue({
  placeholder,
  style,
  textStyle,
}: {
  placeholder?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const { value, displayMap } = useSelect();
  const content = value ? displayMap.get(value) ?? value : placeholder ?? 'Select...';
  return (
    <View style={[{ flex: 1 }, style]}>
      {typeof content === 'string' ? (
        <Text numberOfLines={1} style={[styles.valueText, textStyle]}>
          {content}
        </Text>
      ) : (
        content
      )}
    </View>
  );
}

/* -------------------------------- Content --------------------------------- */

export function SelectContent({
  children,
  position = 'popper',
  align = 'center',
  sideOffset = 6,
  style,
  viewportHeight = 240,
}: {
  children?: ReactNode;
  position?: Position;
  align?: Align;
  sideOffset?: number;
  style?: ViewStyle;
  viewportHeight?: number;
}) {
  const { open, setOpen, triggerAnchor } = useSelect();
  const [cw, setCw] = useState(200);
  const [ch, setCh] = useState(viewportHeight);
  const screen = Dimensions.get('window');

  if (!open || !triggerAnchor) return null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCw(width);
    setCh(height);
  };

  // Compute popper-like position
  let top = triggerAnchor.y + triggerAnchor.h + sideOffset;
  let left = triggerAnchor.x;
  if (align === 'center') left = triggerAnchor.x + triggerAnchor.w / 2 - cw / 2;
  if (align === 'end') left = triggerAnchor.x + triggerAnchor.w - cw;

  const margin = 8;
  left = Math.max(margin, Math.min(left, screen.width - cw - margin));
  if (top + ch > screen.height - margin) {
    top = Math.max(margin, triggerAnchor.y - ch - sideOffset);
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      <View
        onLayout={onLayout}
        style={[
          styles.content,
          { position: 'absolute', top, left, maxHeight: viewportHeight, minWidth: Math.min(280, screen.width - 16) },
          style,
        ]}
      >
        <SelectScrollUpButton />
        <ScrollView style={{ maxHeight: viewportHeight }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingVertical: 4 }}>{children}</View>
        </ScrollView>
        <SelectScrollDownButton />
      </View>
    </Modal>
  );
}

/* ---------------------------------- Group --------------------------------- */

export function SelectGroup({ children, style }: { children?: ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}

export function SelectLabel({ children, style }: { children?: ReactNode; style?: TextStyle }) {
  return (
    <Text style={[styles.label]} numberOfLines={1}>
      {children as any}
    </Text>
  );
}

export function SelectSeparator({ style }: { style?: ViewStyle }) {
  return <View style={[styles.separator, style]} />;
}

/* ---------------------------------- Item ---------------------------------- */

export function SelectItem({
  value,
  children,
  disabled,
  style,
  textStyle,
  rightSlot,
}: {
  value: string;
  children?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  rightSlot?: ReactNode;
}) {
  const { value: current, setValue, registerItem } = useSelect();
  const selected = current === value;

  // Register display label for <SelectValue />
  React.useEffect(() => {
    registerItem(value, children);
  }, [registerItem, value, children]);

  return (
    <Pressable
      onPress={() => !disabled && setValue(value)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      accessibilityRole="menuitem"
    >
      <View style={styles.itemRow}>
        <View style={styles.checkWrap}>
          {selected ? <Feather name="check" size={16} /> : null}
        </View>
        <Text numberOfLines={1} style={[styles.itemText, textStyle]}>
          {typeof children === 'string' ? (children as string) : (children as any)}
        </Text>
        <View style={{ marginLeft: 'auto' }}>{rightSlot}</View>
      </View>
    </Pressable>
  );
}

/* -------------------------- Scroll helpers (icons) ------------------------- */

export function SelectScrollUpButton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.scrollButton, style]}>
      <Feather name="chevron-up" size={16} />
    </View>
  );
}

export function SelectScrollDownButton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.scrollButton, style]}>
      <Feather name="chevron-down" size={16} />
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  trigger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'rgba(247,248,250,1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  triggerDefault: { height: 36 },
  triggerSm: { height: 32, paddingHorizontal: 10 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#0f172a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 6,
    marginHorizontal: 4,
  },
  item: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  itemPressed: { backgroundColor: '#e2e8f0' },
  itemDisabled: { opacity: 0.5 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkWrap: { width: 18, alignItems: 'center' },
  itemText: { fontSize: 14, color: '#0f172a' },
  scrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
});

/* ------------------------------- Named Exports ----------------------------- */

export { Select as default };
