import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing, AccessibilityProps } from 'react-native';

type ProgressProps = {
  /** 0-100 */
  value?: number;
  /** Show an infinite/indeterminate animation instead of a fixed value */
  indeterminate?: boolean;
  /** Track (background) color */
  trackColor?: string;
  /** Indicator (filled) color */
  tintColor?: string;
  /** Height of the bar (px) */
  height?: number;
  /** Border radius of the bar (px) */
  rounded?: number;
  /** Extra container style */
  style?: ViewStyle;
} & AccessibilityProps;

export function Progress({
  value = 0,
  indeterminate = false,
  trackColor = 'rgba(14,165,233,0.20)', // primary/20-esque
  tintColor = '#0ea5e9',                // primary
  height = 8,
  rounded = 999,
  style,
  accessibilityLabel = 'Progress',
  ...rest
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // Animated width for determinate
  const widthAnim = useRef(new Animated.Value(clamped)).current;

  // Looping translate for indeterminate
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) {
      // Start looping animation
      const loop = Animated.loop(
        Animated.timing(slide, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      // Animate to new value
      Animated.timing(widthAnim, {
        toValue: clamped,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [clamped, indeterminate, slide, widthAnim]);

  const indicatorWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // For indeterminate, we render a narrower bar that slides left->right.
  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 250], // will be clamped by container width
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: indeterminate ? undefined : clamped }}
      style={[
        styles.track,
        { backgroundColor: trackColor, height, borderRadius: rounded },
        style,
      ]}
      {...rest}
    >
      {indeterminate ? (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: tintColor,
              height,
              borderRadius: rounded,
              width: '40%',
              transform: [{ translateX }],
            },
          ]}
        />
      ) : (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: tintColor,
              height,
              borderRadius: rounded,
              width: indicatorWidth as any,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default Progress;
