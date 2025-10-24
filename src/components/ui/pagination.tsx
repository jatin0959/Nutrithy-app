import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  AccessibilityState,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -----------------------------------------------------------------------------
 * React Native Pagination (Radix-like)
 * Exports:
 *  - Pagination, PaginationContent, PaginationItem
 *  - PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis
 * --------------------------------------------------------------------------- */

type NavProps = { children?: React.ReactNode; style?: ViewStyle };
export function Pagination({ children, style, ...rest }: NavProps) {
  return (
    <View
      accessibilityRole="navigation"
      accessibilityLabel="pagination"
      style={[styles.nav, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PaginationContent({
  children,
  style,
  ...rest
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.list, style]} {...rest}>
      {children}
    </View>
  );
}

export function PaginationItem({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}

/* --------------------------------- Link ---------------------------------- */

type Size = 'icon' | 'default';
type PaginationLinkProps = {
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  isActive?: boolean;
  size?: Size;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function PaginationLink({
  children,
  onPress,
  disabled,
  isActive,
  size = 'icon',
  style,
  textStyle,
}: PaginationLinkProps) {
  const accessibilityState: AccessibilityState = {
    disabled: !!disabled,
    selected: !!isActive,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        baseButton,
        size === 'default' ? buttonSizes.default : buttonSizes.icon,
        isActive ? variants.outline : variants.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.btnText,
            isActive ? styles.textDefault : styles.textGhost,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ------------------------------- Prev / Next ------------------------------ */

export function PaginationPrevious(props: Omit<PaginationLinkProps, 'children' | 'size'>) {
  return (
    <PaginationLink
      accessibilityLabel="Go to previous page"
      size="default"
      style={[{ paddingHorizontal: 10 }, props.style]}
      {...props}
    >
      <View style={styles.row}>
        <Feather name="chevron-left" size={16} />
        <Text style={[styles.btnText, { marginLeft: 6 }]}>Previous</Text>
      </View>
    </PaginationLink>
  );
}

export function PaginationNext(props: Omit<PaginationLinkProps, 'children' | 'size'>) {
  return (
    <PaginationLink
      accessibilityLabel="Go to next page"
      size="default"
      style={[{ paddingHorizontal: 10 }, props.style]}
      {...props}
    >
      <View style={styles.row}>
        <Text style={[styles.btnText, { marginRight: 6 }]}>Next</Text>
        <Feather name="chevron-right" size={16} />
      </View>
    </PaginationLink>
  );
}

/* -------------------------------- Ellipsis -------------------------------- */

export function PaginationEllipsis({ style }: { style?: ViewStyle }) {
  return (
    <View accessible={false} style={[styles.ellipsis, style]}>
      <Feather name="more-horizontal" size={16} />
    </View>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  nav: {
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  btnText: {
    fontSize: 14,
    color: '#0f172a',
  },
  textGhost: { color: '#0f172a' },
  textDefault: { color: '#0f172a' },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* Button variants (ghost/outline) to mirror web styles */
const baseButton: ViewStyle = {
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonSizes: Record<Size, ViewStyle> = {
  icon: { width: 36, height: 36, paddingHorizontal: 0 },
  default: { height: 36, paddingHorizontal: 12 },
};

const variants = {
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  outline: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
  } as ViewStyle,
};
