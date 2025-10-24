// Skeleton.tsx (React Native / Expo)
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, ViewStyle } from 'react-native'

export function Skeleton({
  style,
  ...props
}: {
  style?: ViewStyle
}) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[styles.skeleton, { opacity }, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#334155', // neutral accent shade
    borderRadius: 6,
    height: 16,
    width: '100%',
  },
})
