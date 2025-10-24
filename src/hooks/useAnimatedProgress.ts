import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
export default function useAnimatedProgress(to = 1, duration = 600) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, { toValue: to, duration, useNativeDriver: false }).start();
  }, [to, duration]);
  return value;
}