import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* --------------------------------- Root Ctx -------------------------------- */

type Anchor = { x: number; y: number; w: number; h: number };

type RootCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: Anchor | null;
  setAnchor: (a: Anchor) => void;
};

const RootContext = createContext<RootCtx | null>(null);
function useRoot() {
  const c = useContext(RootContext);
  if (!c) throw new Error('Must be used within <DropdownMenu>');
  return c;
}

/* -------------------------------- Radio Ctx -------------------------------- */

type RadioCtx = {
  value?: string;
  setValue: (v: string) => void;
};
const RadioContext = createContext<RadioCtx | null>(null);

/* ---------------------------------- Root ---------------------------------- */

type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  children?: React.ReactNode;
};
export function DropdownMenu({ open, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState(defaultOpen);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const isOpen = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo(() => ({ open: isOpen, setOpen, anchor, setAnchor }), [isOpen, anchor, setAnchor]);
  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

/* --------------------------------- Portal --------------------------------- */

export function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

/* -------------------------------- Trigger --------------------------------- */

type TriggerProps = { children?: React.ReactNode; style?: ViewStyle };
export function DropdownMenuTrigger({ children, style }: TriggerProps) {
  const { setOpen, setAnchor } = useRoot();
  const ref = useRef<View>(null);

  const openMenu = () => {
    if (!ref.current) return;
    ref.current.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  };

  return (
    <Pressable ref={ref} onPress={openMenu} style={style} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

/* -------------------------------- Content --------------------------------- */

type ContentProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  sideOffset?: number;
};
export function DropdownMenuContent({ children, style, sideOffset = 4 }: ContentProps) {
  const { open, setOpen, anchor } = useRoot();
  const [cardW, setCardW] = useState(0);
  const [cardH, setCardH] = useState(0);

  const screen = Dimensions.get('window');
  const pos = useMemo(() => {
    if (!anchor) return { top: 0, left: 0 };
    let top = anchor.y + anchor.h + sideOffset;
    let left = anchor.x;
    if (cardW && left + cardW > screen.width - 4) left = Math.max(4, screen.width - cardW - 4);
    if (cardH && top + cardH > screen.height - 4) top = Math.max(4, anchor.y - cardH - sideOffset);
    return { top, left };
  }, [anchor, sideOffset, cardW, cardH, screen.width, screen.height]);

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
      <View onLayout={onLayout} style={[styles.menu, { top: pos.top, left: pos.left }, style]}>
        {children}
      </View>
    </Modal>
  );
}

/* --------------------------------- Group ---------------------------------- */

export function DropdownMenuGroup({ children }: { children?: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

/* --------------------------------- Label ---------------------------------- */

type LabelProps = { children?: React.ReactNode; inset?: boolean; style?: TextStyle };
export function DropdownMenuLabel({ children, inset, style }: LabelProps) {
  return (
    <Text style={[styles.label, inset && { paddingLeft: 24 }, style]} numberOfLines={1}>
      {children as any}
    </Text>
  );
}

/* -------------------------------- Separator ------------------------------- */

export function DropdownMenuSeparator({ style }: { style?: ViewStyle }) {
  return <View style={[styles.separator, style]} />;
}

/* ---------------------------------- Item ---------------------------------- */

type Variant = 'default' | 'destructive';
type ItemBaseProps = {
  children?: React.ReactNode;
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function DropdownMenuItem({
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
        style,
      ]}
    >
      {leftSlot ? <View style={styles.affix}>{leftSlot}</View> : null}
      <Text
        numberOfLines={1}
        style={[styles.itemText, vDestructive && { color: '#ef4444' }, textStyle]}
      >
        {children as any}
      </Text>
      {rightSlot ? <View style={styles.affix}>{rightSlot}</View> : null}
    </Pressable>
  );
}

/* ---------------------------- Checkbox Item ------------------------------- */

type CheckboxItemProps = Omit<ItemBaseProps, 'leftSlot' | 'rightSlot' | 'onSelect'> & {
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
};
export function DropdownMenuCheckboxItem({
  children,
  inset,
  disabled,
  checked = false,
  onCheckedChange,
  style,
  textStyle,
}: CheckboxItemProps) {
  return (
    <DropdownMenuItem
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
    </DropdownMenuItem>
  );
}

/* ------------------------------ Radio Group ------------------------------- */

type RadioGroupProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
};
export function DropdownMenuRadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <RadioContext.Provider value={{ value, setValue: onValueChange ?? (() => {}) }}>
      <View>{children}</View>
    </RadioContext.Provider>
  );
}

type RadioItemProps = Omit<ItemBaseProps, 'leftSlot' | 'rightSlot' | 'onSelect'> & {
  value: string;
};
export function DropdownMenuRadioItem({
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
    <DropdownMenuItem
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
    </DropdownMenuItem>
  );
}

/* --------------------------------- Shortcut ------------------------------- */

export function DropdownMenuShortcut({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.shortcut, style]}>{children as any}</Text>;
}

/* ----------------------------------- Sub ---------------------------------- */
/** Simple inline submenu for RN (renders nested content under a labeled item). */

export function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

type SubTriggerProps = ItemBaseProps & { inset?: boolean };
export function DropdownMenuSubTrigger({
  children,
  inset,
  disabled,
  style,
  textStyle,
}: SubTriggerProps) {
  return (
    <DropdownMenuItem
      inset={inset}
      disabled={disabled}
      style={style}
      textStyle={textStyle}
      rightSlot={<Feather name="chevron-right" size={16} color="#64748b" />}
    >
      {children}
    </DropdownMenuItem>
  );
}

export function DropdownMenuSubContent({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.subContent, style]}>{children}</View>;
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    minWidth: 180,
    maxHeight: 360,
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    overflow: 'hidden',
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
  itemText: { flex: 1, fontSize: 14, color: '#0f172a' },
  affix: { width: 16, alignItems: 'center' },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    letterSpacing: 1,
    color: '#64748b',
  },
  subContent: {
    marginTop: 4,
    marginLeft: 12,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(0,0,0,0.12)',
    paddingLeft: 8,
  },
});
