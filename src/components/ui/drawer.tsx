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
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Direction = 'bottom' | 'top' | 'left' | 'right';

/* ------------------------------ Context ---------------------------------- */

type DrawerCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  direction: Direction;
};

const Ctx = createContext<DrawerCtx | null>(null);
function useDrawerCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error('Must be used within <Drawer>');
  return v;
}

/* --------------------------------- Root ---------------------------------- */

type DrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  direction?: Direction;
  children?: React.ReactNode;
};

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  direction = 'bottom',
  children,
}: DrawerProps) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo(() => ({ open: isOpen, setOpen, direction }), [isOpen, setOpen, direction]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* -------------------------------- Trigger -------------------------------- */

type TriggerProps = { children?: React.ReactNode; style?: ViewStyle };
export function DrawerTrigger({ children, style }: TriggerProps) {
  const { setOpen } = useDrawerCtx();
  return (
    <Pressable onPress={() => setOpen(true)} style={style} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

/* --------------------------------- Portal -------------------------------- */

export function DrawerPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

/* --------------------------------- Close --------------------------------- */

type CloseProps = { children?: React.ReactNode; style?: ViewStyle };
export function DrawerClose({ children, style }: CloseProps) {
  const { setOpen } = useDrawerCtx();
  return (
    <Pressable onPress={() => setOpen(false)} style={style} accessibilityRole="button">
      {children ?? <Text>Close</Text>}
    </Pressable>
  );
}

/* -------------------------------- Overlay -------------------------------- */

export function DrawerOverlay(_props: { style?: ViewStyle }) {
  // Overlay is rendered inside DrawerContent for RN; exported for API parity.
  return null;
}

/* -------------------------------- Content -------------------------------- */

type ContentProps = {
  children?: React.ReactNode;
  style?: ViewStyle;         // applied to positioning wrapper
  contentStyle?: ViewStyle;  // applied to the drawer panel
  dismissOnOverlayPress?: boolean;
  dismissOnHardwareBack?: boolean;
  maxHeightRatio?: number;   // for top/bottom (default 0.8)
  maxWidthRatio?: number;    // for left/right (default 0.75)
};

export function DrawerContent({
  children,
  style,
  contentStyle,
  dismissOnOverlayPress = true,
  dismissOnHardwareBack = true,
  maxHeightRatio = 0.8,
  maxWidthRatio = 0.75,
}: ContentProps) {
  const { open, setOpen, direction } = useDrawerCtx();

  const opacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const screen = Dimensions.get('window');
  const panelDims = useMemo(() => {
    if (direction === 'bottom' || direction === 'top') {
      return { width: screen.width, height: Math.round(screen.height * maxHeightRatio) };
    }
    return { width: Math.round(screen.width * maxWidthRatio), height: screen.height };
  }, [direction, screen.width, screen.height, maxHeightRatio, maxWidthRatio]);

  useEffect(() => {
    if (open) {
      opacity.setValue(0);
      slide.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(slide, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      slide.setValue(0);
    }
  }, [open, opacity, slide]);

  const translate = (() => {
    switch (direction) {
      case 'bottom':
        return { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [panelDims.height, 0] }) }] };
      case 'top':
        return { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-panelDims.height, 0] }) }] };
      case 'left':
        return { transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-panelDims.width, 0] }) }] };
      case 'right':
        return { transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [panelDims.width, 0] }) }] };
    }
  })();

  const wrapperPos = (() => {
    switch (direction) {
      case 'bottom':
        return { bottom: 0, left: 0, right: 0, height: panelDims.height };
      case 'top':
        return { top: 0, left: 0, right: 0, height: panelDims.height };
      case 'left':
        return { top: 0, bottom: 0, left: 0, width: panelDims.width };
      case 'right':
        return { top: 0, bottom: 0, right: 0, width: panelDims.width };
    }
  })();

  return (
    <Modal
      animationType="none"
      transparent
      visible={open}
      statusBarTranslucent
      onRequestClose={() => dismissOnHardwareBack && setOpen(false)}
    >
      <Animated.View style={[styles.modalRoot, { opacity }]}>
        <Pressable style={styles.overlay} onPress={() => dismissOnOverlayPress && setOpen(false)} />
        <Animated.View style={[styles.panelWrap, wrapperPos as ViewStyle, style, translate]}>
          {/* drag handle for bottom drawers */}
          {direction === 'bottom' ? <View style={styles.handle} /> : null}
          <View style={[styles.panel, contentStyle]}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* -------------------------------- Header/Etc ------------------------------ */

type BoxProps = { children?: React.ReactNode; style?: ViewStyle | TextStyle };

export function DrawerHeader({ children, style }: BoxProps) {
  return <View style={[styles.header, style as ViewStyle]}>{children}</View>;
}
export function DrawerFooter({ children, style }: BoxProps) {
  return <View style={[styles.footer, style as ViewStyle]}>{children}</View>;
}
export function DrawerTitle({ children, style }: { children?: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children as any}</Text>;
}
export function DrawerDescription({ children, style }: { children?: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.description, style]}>{children as any}</Text>;
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panelWrap: {
    position: 'absolute',
  },
  panel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 100,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  description: { fontSize: 14, color: '#64748b' },
});
