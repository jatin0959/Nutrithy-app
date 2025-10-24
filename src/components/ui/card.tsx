import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BaseProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

type TextProps = {
  children?: React.ReactNode;
  style?: TextStyle;
};

export function Card({ children, style }: BaseProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardHeader({ children, style }: BaseProps) {
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

export function CardTitle({ children, style }: TextProps) {
  return <Text style={[styles.cardTitle, style]}>{children as any}</Text>;
}

export function CardDescription({ children, style }: TextProps) {
  return <Text style={[styles.cardDescription, style]}>{children as any}</Text>;
}

export function CardAction({ children, style }: BaseProps) {
  return <View style={[styles.cardAction, style]}>{children}</View>;
}

export function CardContent({ children, style }: BaseProps) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

export function CardFooter({ children, style }: BaseProps) {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', // bg-card
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12, // rounded-xl
  },
  cardHeader: {
    paddingHorizontal: 24, // px-6
    paddingTop: 24,        // pt-6
    gap: 6,                // gap-1.5
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a', // text-card-foreground
    lineHeight: 20,   // leading-none-ish
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b', // text-muted-foreground
  },
  cardAction: {
    alignSelf: 'flex-start',
    marginLeft: 'auto',
  },
  cardContent: {
    paddingHorizontal: 24, // px-6
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24, // px-6
    paddingBottom: 24,     // pb-6
  },
});
