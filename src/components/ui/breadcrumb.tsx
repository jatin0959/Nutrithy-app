import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, AccessibilityState } from 'react-native';
import { Feather } from '@expo/vector-icons';

type BreadcrumbProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

type BreadcrumbListProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

type BreadcrumbItemProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

type BreadcrumbLinkProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  asChild?: boolean; // kept for API parity (no-op)
};

type BreadcrumbPageProps = {
  children?: React.ReactNode;
  style?: TextStyle;
};

type BreadcrumbSeparatorProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

type BreadcrumbEllipsisProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export function Breadcrumb({ children, style, accessibilityLabel = 'breadcrumb' }: BreadcrumbProps) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={accessibilityLabel} style={style}>
      {children}
    </View>
  );
}

export function BreadcrumbList({ children, style }: BreadcrumbListProps) {
  return <View style={[styles.list, style]}>{children}</View>;
}

export function BreadcrumbItem({ children, style }: BreadcrumbItemProps) {
  return <View style={[styles.item, style]}>{children}</View>;
}

export function BreadcrumbLink({ children, onPress, style, textStyle }: BreadcrumbLinkProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }, style]}>
      {typeof children === 'string' ? <Text style={[styles.linkText, textStyle]}>{children}</Text> : children}
    </Pressable>
  );
}

export function BreadcrumbPage({ children, style }: BreadcrumbPageProps) {
  const accessibilityState: AccessibilityState = { selected: true };
  return (
    <Text accessibilityRole="text" accessibilityState={accessibilityState} style={[styles.pageText, style]}>
      {children as any}
    </Text>
  );
}

export function BreadcrumbSeparator({ children, style }: BreadcrumbSeparatorProps) {
  return (
    <View style={[styles.separator, style]}>
      {children ?? <Feather name="chevron-right" size={14} color="#64748b" />}
    </View>
  );
}

export function BreadcrumbEllipsis({ style, iconSize = 16 }: BreadcrumbEllipsisProps) {
  return (
    <View style={[styles.ellipsis, style]} accessibilityLabel="More">
      <Feather name="more-horizontal" size={iconSize} color="#0f172a" />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6, // ~gap-1.5
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    paddingVertical: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#475569', // muted-foreground
  },
  pageText: {
    fontSize: 14,
    color: '#0f172a', // foreground
    fontWeight: '400',
  },
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
