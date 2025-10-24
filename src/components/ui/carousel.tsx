import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* ----------------------------- Types & Context ---------------------------- */

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number, animated?: boolean) => void;
  selectedIndex: () => number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
};

type Orientation = 'horizontal' | 'vertical';

type CarouselProps = {
  orientation?: Orientation;
  setApi?: (api: CarouselApi) => void;
  style?: ViewStyle;
  children?: React.ReactNode;
};

type Ctx = {
  orientation: Orientation;
  index: number;
  size: number; // width for horizontal, height for vertical
  setSize: (n: number) => void;
  onItemCount: (n: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (i: number, animated?: boolean) => void;
  scrollRef: React.RefObject<ScrollView>;
};

const CarouselContext = createContext<Ctx | null>(null);
function useCarousel() {
  const v = useContext(CarouselContext);
  if (!v) throw new Error('useCarousel must be used within a <Carousel />');
  return v;
}

/* -------------------------------- Carousel -------------------------------- */

export function Carousel({
  orientation = 'horizontal',
  setApi,
  style,
  children,
}: CarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [itemCount, setItemCount] = useState(React.Children.count(children));
  const [size, setSize] = useState(0);

  useEffect(() => {
    setItemCount(React.Children.count(children));
  }, [children]);

  const canScrollPrev = index > 0;
  const canScrollNext = index < Math.max(0, itemCount - 1);

  const scrollTo = useCallback(
    (i: number, animated: boolean = true) => {
      if (!scrollRef.current || size <= 0) return;
      const x = orientation === 'horizontal' ? i * size : 0;
      const y = orientation === 'vertical' ? i * size : 0;
      scrollRef.current.scrollTo({ x, y, animated });
    },
    [orientation, size]
  );

  const scrollPrev = useCallback(() => {
    if (canScrollPrev) scrollTo(index - 1);
  }, [canScrollPrev, index, scrollTo]);

  const scrollNext = useCallback(() => {
    if (canScrollNext) scrollTo(index + 1);
  }, [canScrollNext, index, scrollTo]);

  // Expose minimal API (parity-ish with Embla)
  useEffect(() => {
    if (!setApi) return;
    const api: CarouselApi = {
      scrollPrev,
      scrollNext,
      scrollTo,
      selectedIndex: () => index,
      canScrollPrev: () => canScrollPrev,
      canScrollNext: () => canScrollNext,
    };
    setApi(api);
  }, [setApi, scrollPrev, scrollNext, scrollTo, index, canScrollPrev, canScrollNext]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(orientation === 'horizontal' ? width : height);
    // keep current slide positioned after orientation/size change
    requestAnimationFrame(() => scrollTo(index, false));
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = orientation === 'horizontal' ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y;
    if (size > 0) {
      const i = Math.round(offset / size);
      if (i !== index) setIndex(i);
    }
  };

  const ctx: Ctx = useMemo(
    () => ({
      orientation,
      index,
      size,
      setSize,
      onItemCount: setItemCount,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
      scrollTo,
      scrollRef,
    }),
    [orientation, index, size, scrollPrev, scrollNext, canScrollPrev, canScrollNext, scrollTo]
  );

  return (
    <CarouselContext.Provider value={ctx}>
      <View
        style={[styles.root, style]}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel="carousel"
      >
        <ScrollView
          ref={scrollRef}
          horizontal={orientation === 'horizontal'}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
          // Avoid overscroll glow
          overScrollMode="never"
        >
          <View style={[styles.track, orientation === 'horizontal' ? styles.row : styles.col]}>
            {/* Children rendered by CarouselContent */}
            {children}
          </View>
        </ScrollView>
      </View>
    </CarouselContext.Provider>
  );
}

/* ----------------------------- CarouselContent ---------------------------- */

type ContentProps = {
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function CarouselContent({ style, children }: ContentProps) {
  const { orientation, size, onItemCount } = useCarousel();

  // keep item count in sync
  useEffect(() => {
    onItemCount(React.Children.count(children));
  }, [children, onItemCount]);

  // We wrap each child to force slide-sized pages for pagingEnabled
  const slides = React.Children.toArray(children).map((child, i) => (
    <View
      key={i}
      style={[
        styles.slide,
        orientation === 'horizontal'
          ? { width: size || undefined, height: '100%' }
          : { height: size || undefined, width: '100%' },
      ]}
      accessibilityRole="group"
      accessibilityLabel={`slide ${i + 1}`}
    >
      {child}
    </View>
  ));

  return <View style={[styles.content, style]}>{slides}</View>;
}

/* ------------------------------- CarouselItem ----------------------------- */

type ItemProps = {
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function CarouselItem({ style, children }: ItemProps) {
  return <View style={[styles.itemInner, style]}>{children}</View>;
}

/* -------------------------- Prev / Next Button UIs ------------------------ */

type ButtonLikeProps = {
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
};

export function CarouselPrevious({ style, onPress, disabled }: ButtonLikeProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const dis = disabled ?? !canScrollPrev;
  return (
    <Pressable
      onPress={onPress ?? scrollPrev}
      disabled={dis}
      style={({ pressed }) => [
        styles.ctrlBase,
        orientation === 'horizontal' ? styles.prevH : styles.prevV,
        pressed && !dis && styles.pressed,
        dis && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Previous slide"
    >
      <Feather name="chevron-left" size={16} color="#0f172a" />
    </Pressable>
  );
}

export function CarouselNext({ style, onPress, disabled }: ButtonLikeProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const dis = disabled ?? !canScrollNext;
  return (
    <Pressable
      onPress={onPress ?? scrollNext}
      disabled={dis}
      style={({ pressed }) => [
        styles.ctrlBase,
        orientation === 'horizontal' ? styles.nextH : styles.nextV,
        pressed && !dis && styles.pressed,
        dis && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Next slide"
    >
      <Feather name="chevron-right" size={16} color="#0f172a" />
    </Pressable>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
    height: 220, // default height; override by wrapping container if needed
  },
  track: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  slide: {
    justifyContent: 'center',
  },
  itemInner: {
    flex: 1,
  },
  ctrlBase: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevH: {
    left: 8,
    top: '50%',
    marginTop: -16,
  },
  nextH: {
    right: 8,
    top: '50%',
    marginTop: -16,
  },
  prevV: {
    top: 8,
    left: '50%',
    marginLeft: -16,
    transform: [{ rotate: '90deg' }],
  },
  nextV: {
    bottom: 8,
    left: '50%',
    marginLeft: -16,
    transform: [{ rotate: '90deg' }],
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
});
