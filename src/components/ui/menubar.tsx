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

/* -----------------------------------------------------------------------------
 * React Native Menubar (Radix-like)
 * Components:
 *  - Menubar, MenubarMenu, MenubarTrigger, MenubarContent
 *  - MenubarGroup, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem
 *  - MenubarLabel, MenubarSeparator, MenubarShortcut
 *  - MenubarSub, MenubarSubTrigger, MenubarSubContent (inline submenu)
 * --------------------------------------------------------------------------- */

/* -------------------------------- Root Ctx -------------------------------- */

type Anchor = { x: number; y: number; w: number; h: number };

type RootCtx = {
  /** Track any open menu so others can close if needed */
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
};
const RootContext = createContext<RootCtx | null>(null);

export function Menubar({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return (
    <RootContext.Provider value={{ openMenuId, setOpenMenuId }}>
      <View style={[styles.bar, style]}>{children}</View>
    </RootContext.Provider>
  );
}

/* -------------------------------- Menu Ctx -------------------------------- */

type MenuCtx = {
  id: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: Anchor | null;
  setAnchor: (a: Anchor | null) => void;
};
const MenuContext = createContext<MenuCtx | null>(null);
function useMenu() {
  const c = useContext(MenuContext);
  if (!c) throw new Error('Must be used within <MenubarMenu>');
  return c;
}
function useRoot() {
  const c = useContext(RootContext);
  if (!c) throw new Error('Must be used within <Menubar>');
  return c;
}

export function MenubarMenu({ children, id }: { children?: React.ReactNode; id?: string }) {
  const autoId = React.useId().replace(/:/g, '');
  const menuId = id ?? `menu-${autoId}`;
  const { openMenuId, setOpenMenuId } = useRoot();

  const open = openMenuId === menuId;
  const setOpen = (v: boolean) => setOpenMenuId(v ? menuId : null);

  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const value: MenuCtx = { id: menuId, open, setOpen, anchor, setAnchor };
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/* -------------------------------- Trigger -------------------------------- */

export function MenubarTrigger({
  children,
  style,
  disabled,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { setOpen, setAnchor, open } = useMenu();
  const ref = useRef<View>(null);

  const toggle = () => {
    if (disabled) return;
    if (!open) {
      ref.current?.measureInWindow((x, y, w, h) => {
        setAnchor({ x, y, w, h });
        setOpen(true);
      });
    } else {
      setOpen(false);
    }
  };

  return (
    <Pressable
      ref={ref}
      onPress={toggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.trigger,
        open && styles.triggerOpen,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.9 },
        style,
      ]}
    >
      <Text style={styles.triggerText}>{children as any}</Text>
    </Pressable>
  );
}

/* -------------------------------- Content -------------------------------- */

export function MenubarContent({
  children,
  style,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  sideOffset?: number;
}) {
  const { open, setOpen, anchor } = useMenu();
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);
  const screen = Dimensions.get('window');

  const onLayout = (e: LayoutChangeEvent) => {
    setCw(e.nativeEvent.layout.width);
    setCh(e.nativeEvent.layout.height);
  };

  const pos = React.useMemo(() => {
    if (!anchor) return { top: 0, left: 0 };
    let top = anchor.y + anchor.h + sideOffset;
    let left = anchor.x + (align === 'center' ? anchor.w / 2 - cw / 2 : align === 'end' ? anchor.w - cw : 0) + alignOffset;

    // Clamp to screen
    const margin = 4;
    if (left + cw > screen.width - margin) left = Math.max(margin, screen.width - cw - margin);
    if (left < margin) left = margin;
    if (top + ch > screen.height - margin) top = Math.max(margin, anchor.y - ch - sideOffset);
    return { top, left };
  }, [anchor, cw, ch, screen.width, screen.height, sideOffset, align, alignOffset]);

  return (
    <Modal
      transparent
      visible={open}
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

/* -------------------------------- Group/Etc ------------------------------ */

export function MenubarGroup({ children }: { children?: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export function MenubarLabel({
  children,
  inset,
  style,
}: {
  children?: React.ReactNode;
  inset?: boolean;
  style?: TextStyle;
}) {
  return (
    <Text style={[styles.label, inset && { paddingLeft: 24 }, style]} numberOfLines={1}>
      {children as any}
    </Text>
  );
}

export function MenubarSeparator({ style }: { style?: ViewStyle }) {
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

export function MenubarItem({
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
      <Text numberOfLines={1} style={[styles.itemText, vDestructive && { color: '#ef4444' }, textStyle]}>
        {children as any}
      </Text>
      {rightSlot ? <View style={styles.affix}>{rightSlot}</View> : null}
    </Pressable>
  );
}

/* ----------------------------- Checkbox Item ----------------------------- */

export function MenubarCheckboxItem({
  children,
  checked = false,
  inset,
  disabled,
  onCheckedChange,
  style,
  textStyle,
}: {
  children?: React.ReactNode;
  checked?: boolean;
  inset?: boolean;
  disabled?: boolean;
  onCheckedChange?: (next: boolean) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <MenubarItem
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
    </MenubarItem>
  );
}

/* ------------------------------ Radio Group ------------------------------ */

type RadioCtx = { value?: string; setValue: (v: string) => void };
const RadioContext = createContext<RadioCtx | null>(null);

export function MenubarRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <RadioContext.Provider value={{ value, setValue: onValueChange ?? (() => {}) }}>
      <View>{children}</View>
    </RadioContext.Provider>
  );
}

export function MenubarRadioItem({
  value,
  children,
  inset,
  disabled,
  style,
  textStyle,
}: {
  value: string;
  children?: React.ReactNode;
  inset?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const ctx = useContext(RadioContext);
  const selected = ctx?.value === value;
  return (
    <MenubarItem
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
    </MenubarItem>
  );
}

/* -------------------------------- Shortcut ------------------------------- */

export function MenubarShortcut({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.shortcut, style]}>{children as any}</Text>;
}

/* ----------------------------------- Sub ---------------------------------- */

export function MenubarSub({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

export function MenubarSubTrigger({
  children,
  inset,
  disabled,
  style,
  textStyle,
}: {
  children?: React.ReactNode;
  inset?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <MenubarItem
      inset={inset}
      disabled={disabled}
      style={style}
      textStyle={textStyle}
      rightSlot={<Feather name="chevron-right" size={16} color="#64748b" />}
    >
      {children}
    </MenubarItem>
  );
}

export function MenubarSubContent({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.subContent, style]}>{children}</View>;
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#ffffff',
    height: 36,
    padding: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  trigger: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  triggerOpen: {
    backgroundColor: '#e2e8f0',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    minWidth: 192,
    maxHeight: 380,
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
