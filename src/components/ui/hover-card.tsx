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
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * HoverCard (React Native)
 * - Emulates hover with press-in/press-out + delays (since RN has no hover).
 * - Positions a floating card near the trigger using measureInWindow.
 * - API parity: <HoverCard>, <HoverCardTrigger>, <HoverCardContent />
 * --------------------------------------------------------------------------- */

type Align = 'start' | 'center' | 'end';
type Side = 'top' | 'right' | 'bottom' | 'left';

type HoverCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: { x: number; y: number; w: number; h: number } | null;
  setAnchor: (a: { x: number; y: number; w: number; h: number } | null) => void;
  openDelay: number;
  closeDelay: number;
  side: Side;
  align: Align;
  sideOffset: number;
};

const Ctx = createContext<HoverCtx | null>(null);
function useHover() {
  const v = useContext(Ctx);
  if (!v) throw new Error('HoverCard components must be used within <HoverCard>');
  return v;
}

/* --------------------------------- Root ---------------------------------- */

export function HoverCard({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 150,
  closeDelay = 100,
  side = 'top',
  align = 'center',
  sideOffset = 4,
}: {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  side?: Side;
  align?: Align;
  sideOffset?: number;
}) {
  const controlled = typeof open === 'boolean';
  const [internal, setInternal] = useState(defaultOpen);
  const [anchor, setAnchor] = useState<HoverCtx['anchor']>(null);
  const isOpen = controlled ? (open as boolean) : internal;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo<HoverCtx>(
    () => ({
      open: isOpen,
      setOpen,
      anchor,
      setAnchor,
      openDelay,
      closeDelay,
      side,
      align,
      sideOffset,
    }),
    [isOpen, setOpen, anchor, openDelay, closeDelay, side, align, sideOffset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* -------------------------------- Trigger -------------------------------- */

export function HoverCardTrigger({
  children,
  style,
  asPressable = true,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Keep for parity; RN uses press to simulate hover */
  asPressable?: boolean;
}) {
  const { setOpen, setAnchor, openDelay, closeDelay } = useHover();
  const ref = useRef<View>(null);
  const openTm = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTm = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureAndOpen = () => {
    if (!ref.current) return;
    ref.current.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  };

  const onPressIn = () => {
    if (closeTm.current) {
      clearTimeout(closeTm.current);
      closeTm.current = null;
    }
    openTm.current = setTimeout(measureAndOpen, openDelay);
  };

  const onPressOut = () => {
    if (openTm.current) {
      clearTimeout(openTm.current);
      openTm.current = null;
    }
    closeTm.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => () => {
    if (openTm.current) clearTimeout(openTm.current);
    if (closeTm.current) clearTimeout(closeTm.current);
  }, []);

  const content = (
    <View ref={ref} style={style}>
      {children}
    </View>
  );

  if (!asPressable) return content;

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      {content}
    </Pressable>
  );
}

/* -------------------------------- Content -------------------------------- */

export function HoverCardContent({
  children,
  style,
  align = 'center',
  sideOffset = 4,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  align?: Align;
  sideOffset?: number;
}) {
  const { open, setOpen, anchor, side } = useHover();
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);

  const screen = Dimensions.get('window');

  const onLayout = (e: LayoutChangeEvent) => {
    setCw(e.nativeEvent.layout.width);
    setCh(e.nativeEvent.layout.height);
  };

  if (!open || !anchor) return null;

  // Compute position
  const pos = computePosition({
    side,
    align,
    sideOffset,
    anchor,
    cardW: cw,
    cardH: ch,
    screenW: screen.width,
    screenH: screen.height,
  });

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      <View onLayout={onLayout} style={[styles.card, { top: pos.top, left: pos.left }, style]}>
        {children}
      </View>
    </Modal>
  );
}

/* --------------------------------- Utils --------------------------------- */

function computePosition({
  side,
  align,
  sideOffset,
  anchor,
  cardW,
  cardH,
  screenW,
  screenH,
}: {
  side: Side;
  align: Align;
  sideOffset: number;
  anchor: NonNullable<HoverCtx['anchor']>;
  cardW: number;
  cardH: number;
  screenW: number;
  screenH: number;
}) {
  let top = anchor.y;
  let left = anchor.x;

  // Side placement
  if (side === 'top') top = anchor.y - cardH - sideOffset;
  if (side === 'bottom') top = anchor.y + anchor.h + sideOffset;
  if (side === 'left') left = anchor.x - cardW - sideOffset;
  if (side === 'right') left = anchor.x + anchor.w + sideOffset;

  // Align
  if (side === 'top' || side === 'bottom') {
    if (align === 'start') left = anchor.x;
    if (align === 'center') left = anchor.x + anchor.w / 2 - cardW / 2;
    if (align === 'end') left = anchor.x + anchor.w - cardW;
  } else {
    if (align === 'start') top = anchor.y;
    if (align === 'center') top = anchor.y + anchor.h / 2 - cardH / 2;
    if (align === 'end') top = anchor.y + anchor.h - cardH;
  }

  // Keep inside screen (basic clamping)
  const margin = 4;
  top = Math.max(margin, Math.min(top, screenH - cardH - margin));
  left = Math.max(margin, Math.min(left, screenW - cardW - margin));

  return { top, left };
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  card: {
    position: 'absolute',
    width: 256, // w-64 default; adjust via style if needed
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});
