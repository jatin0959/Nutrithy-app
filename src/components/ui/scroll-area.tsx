import React, { useRef, useState, useMemo, useContext, createContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native ScrollArea (Radix-like)
 * Exports: ScrollArea, ScrollBar
 *
 * - Custom, minimal scrollbars rendered over a ScrollView.
 * - Vertical bar by default (like the web version includes <ScrollBar />).
 * - You can also render a horizontal bar via <ScrollBar orientation="horizontal" />.
 * --------------------------------------------------------------------------- */

type AxisMetrics = {
  container: number;   // viewport size (px)
  content: number;     // content size (px)
  offset: number;      // current scroll offset (px)
};

type Ctx = {
  vertical: AxisMetrics;
  horizontal: AxisMetrics;
  thickness: number;
  trackColor: string;
  thumbColor: string;
  radius: number;
};

const ScrollCtx = createContext<Ctx | null>(null);
function useScrollCtx() {
  const v = useContext(ScrollCtx);
  if (!v) throw new Error('ScrollBar must be used within <ScrollArea>');
  return v;
}

type ScrollAreaProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /** Show the default vertical bar automatically. Default: true */
  showVerticalBar?: boolean;
  /** Show horizontal bar automatically. Default: false (add a <ScrollBar orientation="horizontal" /> if needed) */
  showHorizontalBar?: boolean;
  /** Thickness of the scrollbar (px) */
  thickness?: number;
  /** Track color */
  trackColor?: string;
  /** Thumb color */
  thumbColor?: string;
  /** Border radius for track & thumb */
  radius?: number;
};

/** Root */
export function ScrollArea({
  children,
  style,
  contentContainerStyle,
  showVerticalBar = true,
  showHorizontalBar = false,
  thickness = 10,
  trackColor = 'transparent',
  thumbColor = 'rgba(0,0,0,0.25)',
  radius = 999,
}: ScrollAreaProps) {
  const ref = useRef<ScrollView>(null);

  const [vMetrics, setVMetrics] = useState<AxisMetrics>({ container: 0, content: 1, offset: 0 });
  const [hMetrics, setHMetrics] = useState<AxisMetrics>({ container: 0, content: 1, offset: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setVMetrics((m) => ({ ...m, container: height }));
    setHMetrics((m) => ({ ...m, container: width }));
  };

  const onContentSizeChange = (w: number, h: number) => {
    setVMetrics((m) => ({ ...m, content: Math.max(1, h) }));
    setHMetrics((m) => ({ ...m, content: Math.max(1, w) }));
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x, y } = e.nativeEvent.contentOffset;
    setVMetrics((m) => ({ ...m, offset: y }));
    setHMetrics((m) => ({ ...m, offset: x }));
  };

  const ctx = useMemo<Ctx>(
    () => ({
      vertical: vMetrics,
      horizontal: hMetrics,
      thickness,
      trackColor,
      thumbColor,
      radius,
    }),
    [vMetrics, hMetrics, thickness, trackColor, thumbColor, radius]
  );

  return (
    <ScrollCtx.Provider value={ctx}>
      <View style={[styles.root, style]} onLayout={onLayout}>
        <ScrollView
          ref={ref}
          style={styles.fill}
          contentContainerStyle={contentContainerStyle}
          onContentSizeChange={onContentSizeChange}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={showHorizontalBar}
        >
          {children}
        </ScrollView>

        {showVerticalBar ? <ScrollBar orientation="vertical" /> : null}
        {showHorizontalBar ? <ScrollBar orientation="horizontal" /> : null}
      </View>
    </ScrollCtx.Provider>
  );
}

type ScrollBarProps = {
  orientation?: 'vertical' | 'horizontal';
  style?: ViewStyle;
  thumbStyle?: ViewStyle;
};

/** Scrollbar (can be used standalone inside <ScrollArea>) */
export function ScrollBar({
  orientation = 'vertical',
  style,
  thumbStyle,
}: ScrollBarProps) {
  const { vertical, horizontal, thickness, trackColor, thumbColor, radius } = useScrollCtx();
  const m = orientation === 'vertical' ? vertical : horizontal;

  // If content fits, hide the bar
  const scrollable = m.content > m.container + 1;

  if (!scrollable) return null;

  // Thumb size based on viewport/content ratio
  const trackLen = m.container;
  const ratio = trackLen / m.content;
  const minThumb = 24;
  const thumbLen = Math.max(minThumb, Math.floor(trackLen * ratio));

  // Thumb position
  const maxOffset = Math.max(1, m.content - m.container);
  const progress = Math.min(1, Math.max(0, m.offset / maxOffset));
  const travel = trackLen - thumbLen;
  const thumbPos = Math.floor(progress * travel);

  if (orientation === 'vertical') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.vTrack,
          {
            width: thickness,
            backgroundColor: trackColor,
            borderRadius: radius,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.vThumb,
            {
              top: thumbPos,
              height: thumbLen,
              width: thickness,
              backgroundColor: thumbColor,
              borderRadius: radius,
            },
            thumbStyle,
          ]}
        />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.hTrack,
        {
          height: thickness,
          backgroundColor: trackColor,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.hThumb,
          {
            left: thumbPos,
            width: thumbLen,
            height: thickness,
            backgroundColor: thumbColor,
            borderRadius: radius,
          },
          thumbStyle,
        ]}
      />
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  vTrack: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingVertical: 2, // subtle inset like p-px
    justifyContent: 'flex-start',
  },
  vThumb: {
    position: 'absolute',
    left: 0,
  },
  hTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 2,
    justifyContent: 'flex-start',
  },
  hThumb: {
    position: 'absolute',
    top: 0,
  },
});
