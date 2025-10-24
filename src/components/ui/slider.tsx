// Slider.tsx (React Native / Expo)
// Converted from Radix Slider to a mobile-friendly multi-thumb slider.
// Uses `@ptomasroos/react-native-multi-slider` for 1–2 thumbs.
//
// Install:
//   npm i @ptomasroos/react-native-multi-slider
// (works in Expo; no native modules)

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

type SliderProps = {
  className?: string; // kept for API parity (ignored)
  defaultValue?: number | number[];
  value?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  vertical?: boolean; // Radix orientation support (true => vertical)
  onValueChange?: (val: number[] | number) => void; // fires during sliding
  onValueCommit?: (val: number[] | number) => void; // fires at release
};

export function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  vertical = false,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  // Normalize to array (1 or 2 values)
  const normalized = useMemo<number[]>(() => {
    if (Array.isArray(value)) return value.slice(0, 2);
    if (typeof value === 'number') return [value];
    if (Array.isArray(defaultValue)) return defaultValue.slice(0, 2);
    if (typeof defaultValue === 'number') return [defaultValue];
    // fallback mirrors your web code that defaulted to [min, max]
    return [min, max];
  }, [value, defaultValue, min, max]);

  const controlled = value !== undefined;
  const [internal, setInternal] = useState<number[]>(normalized);
  const vals = controlled ? normalized : internal;

  // MultiSlider needs an explicit pixel length
  const [length, setLength] = useState<number | null>(null);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLength(vertical ? height : width);
  }, [vertical]);

  const handleChange = useCallback((v: number[]) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v.length === 1 ? v[0] : v);
  }, [controlled, onValueChange]);

  const handleFinish = useCallback((v: number[]) => {
    onValueCommit?.(v.length === 1 ? v[0] : v);
  }, [onValueCommit]);

  // Enable one or two thumbs based on values length
  const [v1, v2] = vals.length === 1 ? [vals[0], undefined] : [vals[0], vals[1]];

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.root,
        vertical && styles.rootVertical,
        disabled && { opacity: 0.5 },
      ]}
      // @ts-ignore keep prop passthrough parity (ignored in RN)
      {...props}
    >
      {length != null && (
        <MultiSlider
          values={vals}
          min={min}
          max={max}
          step={step}
          enabledOne={!disabled}
          enabledTwo={!disabled && v2 !== undefined}
          markerOffsetY={0}
          markerOffsetX={0}
          sliderLength={length}
          isMarkersSeparated={false}
          onValuesChange={handleChange}
          onValuesChangeFinish={handleFinish}
          containerStyle={[
            styles.container,
            vertical && styles.containerVertical,
          ]}
          trackStyle={[
            styles.track,
            vertical && styles.trackVertical,
          ]}
          selectedStyle={styles.selected}
          unselectedStyle={styles.unselected}
          markerStyle={styles.thumb}
          pressedMarkerStyle={styles.thumbPressed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingVertical: 6,
    justifyContent: 'center',
  },
  rootVertical: {
    width: 24,            // narrow width for vertical slider
    height: 176,          // similar to min-h-44 in web
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  container: {
    height: 24,           // accommodates a thicker track like h-4
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  containerVertical: {
    height: '100%',
    width: 24,
  },
  track: {
    height: 16,
    borderRadius: 999,
    backgroundColor: '#E5E7EB', // muted
  },
  trackVertical: {
    width: 6,
    height: '100%',
  },
  selected: {
    backgroundColor: '#0EA5E9', // primary
    borderRadius: 999,
  },
  unselected: {
    backgroundColor: '#E5E7EB', // muted
    borderRadius: 999,
  },
  thumb: {
    height: 16,
    width: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderColor: '#0EA5E9',     // primary border
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbPressed: {
    height: 16,
    width: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderColor: '#0284C7',
    borderWidth: 2,
  },
});

export default Slider;
