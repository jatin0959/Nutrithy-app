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
  ViewStyle,
  TextStyle,
  AccessibilityState,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* ------------------------------ Context ---------------------------------- */

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const DialogCtx = createContext<Ctx | null>(null);
function useDialogCtx() {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error('Must be used within <Dialog>');
  return ctx;
}

/* --------------------------------- Root ---------------------------------- */

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  children?: React.ReactNode;
};

export function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
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

  const value = useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen]);

  return <DialogCtx.Provider value={value}>{children}</DialogCtx.Provider>;
}

/* -------------------------------- Trigger -------------------------------- */

type DialogTriggerProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function DialogTrigger({ children, style }: DialogTriggerProps) {
  const { setOpen } = useDialogCtx();
  const onPress = () => setOpen(true);
  return (
    <Pressable onPress={onPress} style={style} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

/* --------------------------------- Portal -------------------------------- */

export function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

/* -------------------------------- Overlay -------------------------------- */
/** In RN, the overlay is rendered by DialogContent internally. Exported for API parity. */
export function DialogOverlay(_props: { style?: ViewStyle }) {
  return null;
}

/* --------------------------------- Close --------------------------------- */

type DialogCloseProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function DialogClose({ children, style }: DialogCloseProps) {
  const { setOpen } = useDialogCtx();
  return (
    <Pressable
      onPress={() => setOpen(false)}
      accessibilityRole="button"
      style={({ pressed }) => [style, pressed && { opacity: 0.85 }]}
    >
      {children ?? <Feather name="x" size={18} />}
    </Pressable>
  );
}

/* -------------------------------- Content -------------------------------- */

type DialogContentProps = {
  children?: React.ReactNode;
  style?: ViewStyle;          // wrapper around card (positioning handled internally)
  contentStyle?: ViewStyle;   // actual card
  dismissOnOverlayPress?: boolean;
  dismissOnHardwareBack?: boolean;
};

export function DialogContent({
  children,
  style,
  contentStyle,
  dismissOnOverlayPress = true,
  dismissOnHardwareBack = true,
}: DialogContentProps) {
  const { open, setOpen } = useDialogCtx();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [open, opacity, scale]);

  return (
    <Modal
      animationType="none"
      visible={open}
      transparent
      statusBarTranslucent
      onRequestClose={() => {
        if (dismissOnHardwareBack) setOpen(false);
      }}
    >
      <Animated.View style={[styles.modalRoot, { opacity }, style]}>
        <Pressable
          style={styles.overlay}
          onPress={() => dismissOnOverlayPress && setOpen(false)}
          accessibilityElementsHidden
        />
        <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
          <View style={[styles.card, contentStyle]}>
            {children}
            <DialogClose style={styles.closeBtn}>
              <Feather name="x" size={16} color="#0f172a" />
            </DialogClose>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* -------------------------------- Header --------------------------------- */

type BoxProps = { children?: React.ReactNode; style?: ViewStyle | TextStyle };

export function DialogHeader({ children, style }: BoxProps) {
  return <View style={[styles.header, style as ViewStyle]}>{children}</View>;
}

export function DialogFooter({ children, style }: BoxProps) {
  return <View style={[styles.footer, style as ViewStyle]}>{children}</View>;
}

export function DialogTitle({ children, style }: { children?: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children as any}</Text>;
}

export function DialogDescription({ children, style }: { children?: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.description, style]}>{children as any}</Text>;
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardWrap: {
    maxWidth: 720,
    width: '92%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#475569',
  },
});
