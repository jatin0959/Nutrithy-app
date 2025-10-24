import React from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType, ViewStyle, ImageStyle, TextStyle } from 'react-native';

type AvatarProps = {
  style?: ViewStyle;
  children?: React.ReactNode;
};

type AvatarImageProps = {
  source: ImageSourcePropType;
  style?: ImageStyle;
};

type AvatarFallbackProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Avatar({ style, children }: AvatarProps) {
  return <View style={[styles.avatar, style]}>{children}</View>;
}

export function AvatarImage({ source, style }: AvatarImageProps) {
  return <Image source={source} style={[styles.image, style]} />;
}

export function AvatarFallback({ children, style, textStyle }: AvatarFallbackProps) {
  return (
    <View style={[styles.fallback, style]}>
      {typeof children === 'string' ? <Text style={[styles.fallbackText, textStyle]}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  fallback: {
    flex: 1,
    borderRadius: 9999,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '600',
    color: '#475569',
  },
});
