import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -------------------------------- Contexts ------------------------------- */

type RootCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: { x: number; y: number };
  setAnchor: (p: { x: number; y: number }) => void;
};

const RootContext = createContext<RootCtx | null>(null);

function useRoot() {
  const c = useContext(RootContext);
  if (!c) throw new Error('Must be used within <ContextMenu>');
  return c;
}

type RadioCtx = {
  value: string | undefined;
  setValue: (v: string) => void;
};
const RadioContext = createContext<RadioCtx | null>(null);

/* ---------------------------------- Root --------------------------------- */

type ContextMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function ContextMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: ContextMenuProps) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState(defaultOpen);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const isOpen = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo<RootCtx>(
    () => ({ open: isOpen, setOpen, anchor, setAnchor }),
    [isOpen, setOpen, anchor]
  );

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

/* -------------------------------- Trigger -------------------------------- */

type TriggerProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** open on long press (default) */
  longPress?: boolean;
  /** also open on press (optional) */
  pressOpen?: boolean;
};

export function ContextMenuTrigger({
  children,
  style,
  longPress = true,
  pressOpen = false,
}: TriggerProps) {
  const { setOpen, setAnchor } = useRoot();

  const openAtEvent = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    setAnchor({ x: pageX, y: pageY });
    setOpen(true);
  };

  return (
    <Pressable
      style={style}
      onLongPress={longPress ? openAtEvent : undefined}
      onPress={pressOpen ? openAtEvent : undefined}
    >
      {children}
    </Pressable>
  );
}

/* --------------------------------- Portal -------------------------------- */

export function ContextMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

/* --------------------------------- Content -------------------------------- */

type ContentProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
};

export function ContextMenuContent({ children, style, maxWidth = 280 }: ContentProps) {
  const { open, setOpen, anchor } = useRoot();
  const [cardW, setCardW] = useState(0);
  const [cardH, setCardH] = useState(0);

  const screen = Dimensions.get('window');
  const pos = useMemo(() => {
    let x = anchor.x;
    let y = anchor.y;
    const margin = 8;
    if (cardW && x + cardW + margin > screen.width) x = Math.max(margin, screen.width - cardW - margin);
    if (cardH && y + cardH + margin > screen.height) y = Math.max(margin, screen.height - cardH - margin);
    return { left: x, top: y };
  }, [anchor, cardW, cardH, screen.width, screen.height]);

  const onLayout = (e: LayoutChangeEvent) => {
    setCardW(e.nativeEvent.layout.width);
    setCardH(e.nativeEvent.layout.height);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      <View
        onLayout={onLayout}
        style={[styles.menu, { maxWidth }, { left: pos.left, top: pos.top }, style]}
      >
        {children}
      </View>
    </Modal>
  );
}

/* ---------------------------------- Group -------------------------------- */

export function ContextMenuGroup({ children }: { children?: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

/* --------------------------------- Label --------------------------------- */

type LabelProps = { children?: React.ReactNode; inset?: boolean; style?: TextStyle };
export function ContextMenuLabel({ children, inset, style }: LabelProps) {
  return (
    <Text style={[styles.label, inset && { paddingLeft: 24 }, style]} numberOfLines={1}>
      {children as any}
    </Text>
  );
}

/* -------------------------------- Separator ------------------------------- */

export function ContextMenuSeparator({ style }: { style?: ViewStyle }) {
  return <View style={[styles.separator, style]} />;
}

/* ---------------------------------- Item --------------------------------- */

type ItemBaseProps = {
  children?: React.ReactNode;
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  variant?: 'default' | 'destructive';
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function ContextMenuItem({
  children,
  inset,
  disabled,
  onSelect,
  variant = 'default',
  style,
  textStyle,
  leftSlot,
  rightSlot,
}: ItemBaseProps) {
  const vDestructive = variant === 'destructive';
  return (
    <Pressable
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.item,
        inset && { paddingLeft: 28 },
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        vDestructive && styles.itemDestructive,
        style,
      ]}
    >
      {leftSlot ? <View style={styles.affix}>{leftSlot}</View> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.itemText,
          vDestructive && { color: '#ef4444' },
          textStyle,
        ]}
      >
        {children as any}
      </Text>
      {rightSlot ? <View style={styles.affix}>{rightSlot}</View> : null}
    </Pressable>
  );
}

/* ------------------------------- CheckboxItem ---------------------------- */

type CheckboxItemProps = Omit<ItemBaseProps, 'leftSlot' | 'rightSlot' | 'onSelect'> & {
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
};

export function ContextMenuCheckboxItem({
  children,
  inset,
  disabled,
  checked = false,
  onCheckedChange,
  style,
  textStyle,
}: CheckboxItemProps) {
  return (
    <ContextMenuItem
      inset={inset}
      disabled={disabled}
      onSelect={() => onCheckedChange?.(!checked)}
      style={style}
      textStyle={textStyle}
      leftSlot={
        checked ? <Feather name="check" size={16} color="#0f172a" /> : <View style={{ width: 16 }} />
      }
    >
      {children}
    </ContextMenuItem>
  );
}

/* -------------------------------- RadioGroup ------------------------------ */

type RadioGroupProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
};

export function ContextMenuRadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <RadioContext.Provider value={{ value, setValue: onValueChange ?? (() => {}) }}>
      <View>{children}</View>
    </RadioContext.Provider>
  );
}

type RadioItemProps = Omit<ItemBaseProps, 'leftSlot' | 'rightSlot' | 'onSelect'> & {
  value: string;
};

export function ContextMenuRadioItem({
  children,
  value,
  inset,
  disabled,
  style,
  textStyle,
}: RadioItemProps) {
  const ctx = useContext(RadioContext);
  const selected = ctx?.value === value;
  return (
    <ContextMenuItem
      inset={inset}
      disabled={disabled}
      onSelect={() => ctx?.setValue(value)}
      style={style}
      textStyle={textStyle}
      leftSlot={
        selected ? (
          <Feather name="circle" size={10} color="#0f172a" />
        ) : (
          <View style={{ width: 16 }} />
        )
      }
    >
      {children}
    </ContextMenuItem>
  );
}

/* ---------------------------------- Sub ---------------------------------- */
/** Simple inline submenu: renders chevron and nested content below. */
export function ContextMenuSub({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

type SubTriggerProps = ItemBaseProps & { inset?: boolean };
export function ContextMenuSubTrigger({
  children,
  inset,
  disabled,
  style,
  textStyle,
}: SubTriggerProps) {
  return (
    <ContextMenuItem
      inset={inset}
      disabled={disabled}
      style={style}
      textStyle={textStyle}
      rightSlot={<Feather name="chevron-right" size={16} color="#64748b" />}
    >
      {children}
    </ContextMenuItem>
  );
}

export function ContextMenuSubContent({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.subContent, style]}>{children}</View>;
}

/* -------------------------------- Shortcut -------------------------------- */

export function ContextMenuShortcut({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.shortcut, style]}>{children as any}</Text>;
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    minWidth: 180,
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  group: {
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 6,
    marginHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 6,
  },
  itemPressed: { backgroundColor: '#e2e8f0' },
  itemDisabled: { opacity: 0.5 },
  itemDestructive: {},
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  affix: {
    width: 16,
    alignItems: 'center',
  },
  subContent: {
    marginTop: 4,
    marginLeft: 12,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(0,0,0,0.12)',
    paddingLeft: 8,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    letterSpacing: 1,
    color: '#64748b',
  },
});
