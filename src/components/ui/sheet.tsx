import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Animated,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -----------------------------------------------------------------------------
 * React Native Sheet (Radix-like)
 * Supports sides: top | right | bottom | left
 * --------------------------------------------------------------------------- */

type Side = 'top' | 'right' | 'bottom' | 'left';

type SheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  children?: React.ReactNode;
};

export function Sheet({
  open: controlled,
  onOpenChange,
  side = 'right',
  children,
}: SheetProps) {
  const [open, setOpen] = useState(!!controlled);
  const animated = useRef(new Animated.Value(0)).current;
  const screen = Dimensions.get('window');

  const isControlled = typeof controlled === 'boolean';
  const visible = isControlled ? controlled : open;

  useEffect(() => {
    if (visible) {
      Animated.timing(animated, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const close = () => {
    if (isControlled) onOpenChange?.(false);
    else setOpen(false);
  };

  // Slide-in direction
  const translate = {
    right: [{ translateX: animated.interpolate({ inputRange: [0, 1], outputRange: [screen.width, 0] }) }],
    left: [{ translateX: animated.interpolate({ inputRange: [0, 1], outputRange: [-screen.width, 0] }) }],
    top: [{ translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [-screen.height, 0] }) }],
    bottom: [{ translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [screen.height, 0] }) }],
  }[side];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={close} />

      {/* Sliding Content */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: translate,
            ...(side === 'right' && { top: 0, bottom: 0, right: 0, width: screen.width * 0.8 }),
            ...(side === 'left' && { top: 0, bottom: 0, left: 0, width: screen.width * 0.8 }),
            ...(side === 'top' && { top: 0, left: 0, right: 0, height: screen.height * 0.4 }),
            ...(side === 'bottom' && { bottom: 0, left: 0, right: 0, height: screen.height * 0.4 }),
          },
        ]}
      >
        {children}
        <Pressable onPress={close} style={styles.close}>
          <Feather name="x" size={18} color="#555" />
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

/* --------------------------------- Subcomponents --------------------------------- */

export function SheetHeader({ children }: { children?: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function SheetFooter({ children }: { children?: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

export function SheetTitle({ children }: { children?: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function SheetDescription({ children }: { children?: React.ReactNode }) {
  return <Text style={styles.description}>{children}</Text>;
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.7,
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});
