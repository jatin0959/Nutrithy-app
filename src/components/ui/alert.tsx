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
  Animated,
  Easing,
  GestureResponderEvent,
  Platform,
  AccessibilityRole,
} from 'react-native';

type OpenValue = boolean | undefined;

type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If true, tapping outside closes the dialog (Radix alert-dialog is usually modal-only). */
  dismissOnOverlayPress?: boolean;
  /** Android back button dismiss */
  dismissOnHardwareBack?: boolean;
  children: React.ReactNode;
};

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  dismissOnOverlayPress: boolean;
  dismissOnHardwareBack: boolean;
};

const DialogCtx = createContext<Ctx | null>(null);

export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  dismissOnOverlayPress = false, // mimic Radix’s stricter behavior by default
  dismissOnHardwareBack = false,
  children,
}: RootProps) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState<boolean>(defaultOpen ?? false);
  const _open = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const ctx = useMemo(
    () => ({ open: _open, setOpen, dismissOnOverlayPress, dismissOnHardwareBack }),
    [_open, setOpen, dismissOnOverlayPress, dismissOnHardwareBack]
  );

  return <DialogCtx.Provider value={ctx}>{children}</DialogCtx.Provider>;
}

type TriggerProps = {
  asChild?: boolean; // kept for API parity, ignored in RN
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityRole?: AccessibilityRole;
};

export function AlertDialogTrigger({ children, onPress, accessibilityRole = 'button' }: TriggerProps) {
  const ctx = useDialogCtx('AlertDialogTrigger');
  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        ctx.setOpen(true);
      }}
      accessibilityRole={accessibilityRole}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  );
}

/** In RN, Modal handles the portal; we keep this for API parity. */
export function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

type OverlayProps = {
  children?: React.ReactNode;
  style?: any;
};

export function AlertDialogOverlay({ children, style }: OverlayProps) {
  const ctx = useDialogCtx('AlertDialogOverlay');
  if (!ctx.open) return null;
  return (
    <Pressable
      style={[styles.overlay, style]}
      onPress={() => {
        if (ctx.dismissOnOverlayPress) ctx.setOpen(false);
      }}
      // prevent overlay from stealing focus announcements
      accessibilityElementsHidden={false}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </Pressable>
  );
}

type ContentProps = {
  children?: React.ReactNode;
  style?: any;
  contentStyle?: any;
};

export function AlertDialogContent({ children, style, contentStyle }: ContentProps) {
  const ctx = useDialogCtx('AlertDialogContent');

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (ctx.open) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [ctx.open, opacity, scale]);

  return (
    <Modal
      animationType="none"
      visible={ctx.open}
      transparent
      onRequestClose={() => {
        if (ctx.dismissOnHardwareBack) ctx.setOpen(false);
      }}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalRoot, { opacity }]}>
        <AlertDialogOverlay />
        <Animated.View style={[styles.contentWrapper, style, { transform: [{ scale }] }]}>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export function AlertDialogHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function AlertDialogFooter({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function AlertDialogTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function AlertDialogDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

type ButtonishProps = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: any;
  textStyle?: any;
};

export function AlertDialogAction({ children, onPress, style, textStyle }: ButtonishProps) {
  const ctx = useDialogCtx('AlertDialogAction');
  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        ctx.setOpen(false);
      }}
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }, style]}
      accessibilityRole="button"
    >
      <Text style={[styles.actionText, textStyle]}>{children}</Text>
    </Pressable>
  );
}

export function AlertDialogCancel({ children, onPress, style, textStyle }: ButtonishProps) {
  const ctx = useDialogCtx('AlertDialogCancel');
  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        ctx.setOpen(false);
      }}
      style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.9 }, style]}
      accessibilityRole="button"
    >
      <Text style={[styles.cancelText, textStyle]}>{children}</Text>
    </Pressable>
  );
}

function useDialogCtx(component: string): Ctx {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error(`${component} must be used within <AlertDialog>`);
  return ctx;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentWrapper: {
    maxWidth: 720,
    width: '92%',
    borderRadius: 12,
    overflow: 'hidden',
    // shadow
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    }),
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  description: { fontSize: 14, color: '#475569' },
  action: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: { color: 'white', fontWeight: '700' },
  cancel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  cancelText: { color: '#0f172a', fontWeight: '600' },
});
