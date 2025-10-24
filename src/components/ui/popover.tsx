import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native Popover (Radix-like)
 * Exports: Popover, PopoverTrigger, PopoverContent, PopoverAnchor
 * --------------------------------------------------------------------------- */

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';
type Anchor = { x: number; y: number; w: number; h: number };

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: Anchor | null;
  setAnchor: (a: Anchor | null) => void;
  side: Side;
  align: Align;
  sideOffset: number;
};

const PopoverCtx = createContext<Ctx | null>(null);
function usePopover() {
  const v = useContext(PopoverCtx);
  if (!v) throw new Error('Popover components must be used within <Popover>');
  return v;
}

/* ---------------------------------- Root ---------------------------------- */

export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
}: {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  side?: Side;
  align?: Align;
  sideOffset?: number;
}) {
  const controlled = typeof open === 'boolean';
  const [_open, _setOpen] = useState(defaultOpen);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const isOpen = controlled ? (open as boolean) : _open;

  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) _setOpen(v);
    },
    [controlled, onOpenChange]
  );

  const value = useMemo<Ctx>(
    () => ({ open: isOpen, setOpen, anchor, setAnchor, side, align, sideOffset }),
    [isOpen, setOpen, anchor, side, align, sideOffset]
  );

  return <PopoverCtx.Provider value={value}>{children}</PopoverCtx.Provider>;
}

/* -------------------------------- Anchor ---------------------------------- */
/** API parity helper. In RN, trigger handles anchoring; this is a passthrough. */
export function PopoverAnchor({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}

/* -------------------------------- Trigger --------------------------------- */

export function PopoverTrigger({
  children,
  style,
  disabled,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { open, setOpen, setAnchor } = usePopover();
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
    <Pressable ref={ref} onPress={toggle} disabled={disabled} style={style}>
      {children}
    </Pressable>
  );
}

/* -------------------------------- Content --------------------------------- */

export function PopoverContent({
  children,
  style,
  align = 'center',
  sideOffset = 4,
  width = 288, // ~ w-72
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  align?: Align;
  sideOffset?: number;
  width?: number;
}) {
  const { open, setOpen, anchor, side } = usePopover();
  const [cw, setCw] = useState(width);
  const [ch, setCh] = useState(0);
  const screen = Dimensions.get('window');

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: lw, height: lh } = e.nativeEvent.layout;
    setCw(lw);
    setCh(lh);
  };

  if (!open || !anchor) return null;

  // compute position relative to anchor
  let top = anchor.y;
  let left = anchor.x;

  if (side === 'top') top = anchor.y - ch - sideOffset;
  if (side === 'bottom') top = anchor.y + anchor.h + sideOffset;
  if (side === 'left') left = anchor.x - cw - sideOffset;
  if (side === 'right') left = anchor.x + anchor.w + sideOffset;

  if (side === 'top' || side === 'bottom') {
    if (align === 'start') left = anchor.x;
    if (align === 'center') left = anchor.x + anchor.w / 2 - cw / 2;
    if (align === 'end') left = anchor.x + anchor.w - cw;
  } else {
    if (align === 'start') top = anchor.y;
    if (align === 'center') top = anchor.y + anchor.h / 2 - ch / 2;
    if (align === 'end') top = anchor.y + anchor.h - ch;
  }

  const margin = 4;
  left = Math.max(margin, Math.min(left, screen.width - cw - margin));
  top = Math.max(margin, Math.min(top, screen.height - ch - margin));

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      <View
        onLayout={onLayout}
        style={[styles.content, { position: 'absolute', top, left, width }, style]}
      >
        {children}
      </View>
    </Modal>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});
