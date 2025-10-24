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
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -----------------------------------------------------------------------------
 * React Native NavigationMenu (Radix-like)
 * Exports:
 *  - NavigationMenu, NavigationMenuList, NavigationMenuItem
 *  - NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink
 *  - NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle
 * --------------------------------------------------------------------------- */

type Anchor = { x: number; y: number; w: number; h: number };

type RootCtx = {
  viewport: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
};
const RootContext = createContext<RootCtx | null>(null);

function useRoot() {
  const c = useContext(RootContext);
  if (!c) throw new Error('Must be used within <NavigationMenu>');
  return c;
}

export function NavigationMenu({
  children,
  style,
  viewport = true,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  viewport?: boolean;
}) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const value = useMemo<RootCtx>(() => ({ viewport, activeItemId, setActiveItemId }), [viewport, activeItemId]);
  return (
    <RootContext.Provider value={value}>
      <View style={[styles.root, style]}>{children}</View>
    </RootContext.Provider>
  );
}

/* ---------------------------------- List ---------------------------------- */

export function NavigationMenuList({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.list, style]}>{children}</View>;
}

/* ---------------------------------- Item ---------------------------------- */

type ItemCtx = {
  id: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: Anchor | null;
  setAnchor: (a: Anchor | null) => void;
};
const ItemContext = createContext<ItemCtx | null>(null);
function useItem() {
  const c = useContext(ItemContext);
  if (!c) throw new Error('Must be used within <NavigationMenuItem>');
  return c;
}

export function NavigationMenuItem({
  children,
  id,
  style,
}: {
  children?: React.ReactNode;
  id?: string;
  style?: ViewStyle;
}) {
  const autoId = React.useId().replace(/:/g, '');
  const itemId = id ?? `nav-item-${autoId}`;
  const { activeItemId, setActiveItemId } = useRoot();
  const open = activeItemId === itemId;
  const setOpen = (v: boolean) => setActiveItemId(v ? itemId : null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const value: ItemCtx = { id: itemId, open, setOpen, anchor, setAnchor };
  return (
    <ItemContext.Provider value={value}>
      <View style={[styles.item, style]}>{children}</View>
    </ItemContext.Provider>
  );
}

/* -------------------------------- Trigger --------------------------------- */

export function NavigationMenuTrigger({
  children,
  style,
  disabled,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { open, setOpen, setAnchor } = useItem();
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
        navigationMenuTriggerStyle.base,
        open && navigationMenuTriggerStyle.open,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.9 },
        style,
      ]}
    >
      <Text style={styles.triggerText}>{children as any}</Text>
      <Feather
        name="chevron-down"
        size={14}
        style={[{ marginLeft: 6, transform: [{ rotate: open ? '180deg' : '0deg' }] }]}
      />
    </Pressable>
  );
}

/* -------------------------------- Content --------------------------------- */

export function NavigationMenuContent({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const { viewport } = useRoot();
  const { open, setOpen, anchor } = useItem();

  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);
  const screen = Dimensions.get('window');

  const onLayout = (e: LayoutChangeEvent) => {
    setCw(e.nativeEvent.layout.width);
    setCh(e.nativeEvent.layout.height);
  };

  // Position: if viewport=false -> popover under trigger. If viewport=true -> center under bar (full-width container).
  const pos = React.useMemo(() => {
    if (!anchor) return { top: 0, left: 0 };
    if (viewport) {
      // Centered viewport container; we place it near top (beneath bar) via Viewport component wrapper
      // (When using viewport=true, Content will still be in a modal, we position via NavigationMenuViewport wrapper)
      // Here we compute popover-like fallback if needed
      const top = anchor.y + anchor.h + 8;
      const left = Math.max(8, Math.min(anchor.x, screen.width - cw - 8));
      return { top, left };
    }
    // Popover under trigger
    let top = anchor.y + anchor.h + 8;
    let left = anchor.x;
    if (left + cw > screen.width - 4) left = Math.max(4, screen.width - cw - 4);
    if (top + ch > screen.height - 4) top = Math.max(4, anchor.y - ch - 8);
    return { top, left };
  }, [anchor, viewport, cw, ch, screen.width, screen.height]);

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      {viewport ? (
        <NavigationMenuViewport>
          <View onLayout={onLayout} style={[styles.content, style]}>{children}</View>
        </NavigationMenuViewport>
      ) : (
        <View onLayout={onLayout} style={[styles.content, { top: pos.top, left: pos.left, position: 'absolute' }, style]}>
          {children}
        </View>
      )}
      <NavigationMenuIndicator />
    </Modal>
  );
}

/* --------------------------------- Viewport -------------------------------- */

export function NavigationMenuViewport({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const screen = Dimensions.get('window');
  return (
    <View style={styles.viewportWrap} pointerEvents="box-none">
      <View
        style={[
          styles.viewport,
          { maxWidth: Math.min(420, screen.width - 16) },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/* --------------------------------- Link ---------------------------------- */

export function NavigationMenuLink({
  children,
  style,
  textStyle,
  active = false,
  onPress,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        active && styles.linkActive,
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <Text style={[styles.linkText, textStyle]}>{children as any}</Text>
    </Pressable>
  );
}

/* ------------------------------- Indicator -------------------------------- */

export function NavigationMenuIndicator({ style }: { style?: ViewStyle }) {
  // simple diamond under the active trigger
  const { activeItemId } = useRoot();
  const { open, anchor } = useItem();
  if (!open || !anchor) return null;

  const size = 10;
  const left = anchor.x + anchor.w / 2 - size / 2;
  const top = anchor.y + anchor.h + 2;

  return (
    <View
      style={[
        styles.indicator,
        { left, top, width: size, height: size },
        style,
      ]}
    />
  );
}

/* --------------------------- Trigger style (API) --------------------------- */

export const navigationMenuTriggerStyle = {
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  open: {
    backgroundColor: '#e2e8f0',
  },
};

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flexDirection: 'row',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  item: {
    position: 'relative',
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
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  viewportWrap: {
    position: 'absolute',
    top: 56, // beneath typical bar height
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  viewport: {
    width: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.12)',
    transform: [{ rotate: '45deg' }],
    borderTopLeftRadius: 2,
  },
  link: {
    padding: 8,
    borderRadius: 6,
  },
  linkActive: {
    backgroundColor: '#e2e8f0',
  },
  linkText: {
    fontSize: 14,
    color: '#0f172a',
  },
});
