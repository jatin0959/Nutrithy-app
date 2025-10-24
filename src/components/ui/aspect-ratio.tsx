import React from 'react';
import { View, ViewStyle } from 'react-native';

type AspectRatioProps = {
  ratio?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function AspectRatio({ ratio = 1, style, children }: AspectRatioProps) {
  return (
    <View style={[{ aspectRatio: ratio, width: '100%' }, style]}>
      {children}
    </View>
  );
}
