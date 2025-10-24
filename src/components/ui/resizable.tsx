import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native Resizable Panels
 * API parity: ResizablePanelGroup, ResizablePanel, ResizableHandle
 *
 * Notes:
 * - Direction: "horizontal" (left↔right) or "vertical" (top↕bottom)
 * - Panels are sized using flex weights that always sum to 100.
 * - <ResizableHandle /> must sit between two <ResizablePanel /> siblings.
 * - Each <ResizablePanel /> can supply defaultSize (percentage), minSize, maxSize.
 * --------------------------------------------------------------------------- */

type Direction = 'horizontal' | 'vertical';

type PanelProps = {
  children?: React.ReactNode;
  /** Initial size as a percentage of available space (0-100). If omitted, space is equally divided. */
  defaultSize?: number;
  /** Minimum size percentage (0-100). Defaults to 5. */
  minSize?: number;
  /** Maximum size percentage (0-100). Defaults to 100. */
  maxSize?: number;
  style?: ViewStyle;
};
export function ResizablePanel({ children, style }: PanelProps) {
  // Render-only; sizing is controlled by the parent via cloning with style
  return <View style={style}>{children}</View>;
}

type HandleProps = {
  /** Show a small grip in the handle */
  withHandle?: boolean;
  /** Optional custom style */
  style?: ViewStyle;
};
export function ResizableHandle({ withHandle, style }: HandleProps) {
  // Render-only; behavior wired by the parent
  return (
    <View style={[styles.handle, style]}>
      {withHandle ? <View style={styles.grip} /> : null}
    </View>
  );
}

type GroupProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** "horizontal" (default) or "vertical" */
  direction?: Direction;
  /** Thickness of the resize handle in px (default: 8) */
  handleSize?: number;
};

export function ResizablePanelGroup({
  children,
  style,
  direction = 'horizontal',
  handleSize = 8,
}: GroupProps) {
  // Normalize children: mark indices of panels & handles
  const items = React.Children.toArray(children);
  const panelIndices: number[] = [];
  const handleIndices: number[] = [];

  items.forEach((child, idx) => {
    if (!React.isValidElement(child)) return;
    const type = (child.type as any)?.name;
    if (type === ResizablePanel.name) panelIndices.push(idx);
    if (type === ResizableHandle.name) handleIndices.push(idx);
  });

  const panelCount = panelIndices.length;

  // Build default sizes from panels' defaultSize or equal split
  const initialSizes = useMemo(() => {
    let sizes: number[] = [];
    let specifiedTotal = 0;
    let unspecified: number[] = [];
    for (let i = 0; i < panelCount; i++) {
      const el = items[panelIndices[i]];
      if (React.isValidElement<PanelProps>(el) && el.props.defaultSize != null) {
        const v = clampPct(el.props.defaultSize!);
        sizes[i] = v;
        specifiedTotal += v;
      } else {
        sizes[i] = -1; // placeholder
        unspecified.push(i);
      }
    }
    const remaining = Math.max(0, 100 - specifiedTotal);
    const fill = unspecified.length > 0 ? remaining / unspecified.length : 0;
    for (const i of unspecified) sizes[i] = fill;
    // Normalize sum to 100
    const sum = sizes.reduce((a, b) => a + b, 0);
    return sizes.map((v) => (v * 100) / sum);
  }, [items, panelIndices, panelCount]);

  const [sizes, setSizes] = useState<number[]>(initialSizes);
  useEffect(() => {
    // If children change, recompute sizes
    setSizes(initialSizes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelCount]);

  // Layout size for pixel<->percent conversions (only used for thresholding; flex works without it)
  const containerSizeRef = useRef(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    containerSizeRef.current = direction === 'horizontal' ? width : height;
  };

  // Map of min/max per panel
  const limits = useMemo(() => {
    const arr = Array.from({ length: panelCount }, (_, i) => {
      const el = items[panelIndices[i]];
      let min = 5;
      let max = 100;
      if (React.isValidElement<PanelProps>(el)) {
        if (typeof el.props.minSize === 'number') min = clampPct(el.props.minSize);
        if (typeof el.props.maxSize === 'number') max = clampPct(el.props.maxSize);
      }
      return { min, max };
    });
    return arr;
  }, [items, panelIndices, panelCount]);

  // Create PanResponders for each handle (between panel i and i+1)
  const handleResponders = useMemo(() => {
    return handleIndices.map((handleIdx) => {
      // Find the nearest panel on the left/top to get its index among panels
      const panelOrderIndex = panelIndices.findIndex((pi) => pi < handleIdx && (panelIndices[panelIndices.indexOf(pi) + 1] ?? Infinity) > handleIdx);
      // Fallback: derive by counting panels before this handle
      const leftPanelNumber = panelIndices.filter((pi) => pi < handleIdx).length - 1;
      const i = panelOrderIndex >= 0 ? panelOrderIndex : Math.max(0, leftPanelNumber);
      const j = i + 1;
      // Safety
      if (i < 0 || j >= panelCount) {
        return PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onMoveShouldSetPanResponder: () => false,
          onPanResponderMove: () => {},
          onPanResponderRelease: () => {},
        });
      }

      let startSizes: number[] = [];
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startSizes = [...sizes];
        },
        onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
          const px = direction === 'horizontal' ? g.dx : g.dy;
          const totalPx = containerSizeRef.current || 1;
          const deltaPct = (px / totalPx) * 100;

          const leftMin = limits[i].min;
          const leftMax = limits[i].max;
          const rightMin = limits[j].min;
          const rightMax = limits[j].max;

          let left = clamp(startSizes[i] + deltaPct, leftMin, leftMax);
          let right = clamp(startSizes[j] - deltaPct, rightMin, rightMax);

          // Reconcile if sum changed due to clamping
          const pairSum = startSizes[i] + startSizes[j];
          const newSum = left + right;
          if (newSum !== pairSum) {
            // try to keep pairSum by adjusting the one that isn't clamped hard
            const leftClamped = left === leftMin || left === leftMax;
            const rightClamped = right === rightMin || right === rightMax;
            if (!leftClamped) {
              left = clamp(pairSum - right, leftMin, leftMax);
            } else if (!rightClamped) {
              right = clamp(pairSum - left, rightMin, rightMax);
            }
          }

          const next = [...startSizes];
          next[i] = left;
          next[j] = right;
          setSizes(next);
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminationRequest: () => true,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, sizes, limits, handleIndices.join(','), panelIndices.join(','), panelCount]);

  // Render pass: clone children injecting sizing and pan handlers
  let handleCursor = 0;
  let panelCursor = 0;

  const out = items.map((child, idx) => {
    if (!React.isValidElement(child)) return child;

    const type = (child.type as any)?.name;

    if (type === ResizablePanel.name) {
      const sizePct = sizes[panelCursor] ?? 0;
      const injectedStyle: ViewStyle = {
        flexGrow: sizePct,
        flexShrink: 0,
        flexBasis: 0,
      };
      panelCursor++;
      return React.cloneElement(child, {
        key: idx,
        style: [styles.panel, child.props.style, injectedStyle],
      });
    }

    if (type === ResizableHandle.name) {
      const responder = handleResponders[handleCursor];
      handleCursor++;
      const isVertical = direction === 'vertical';
      const injectedStyle: ViewStyle = {
        width: isVertical ? '100%' : handleSize,
        height: isVertical ? handleSize : '100%',
        cursor: isVertical ? 'row-resize' : 'col-resize', // web only; harmless on native
      } as any;

      return React.cloneElement(child, {
        key: idx,
        style: [styles.handleBase, injectedStyle, child.props.style],
        ...responder?.panHandlers,
      });
    }

    // Anything else is passed through
    return child;
  });

  return (
    <View
      style={[
        styles.group,
        { flexDirection: direction === 'horizontal' ? 'row' : 'column' },
        style,
      ]}
      onLayout={onLayout}
    >
      {out}
    </View>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  group: {
    width: '100%',
    height: '100%',
  },
  panel: {
    overflow: 'hidden',
  },
  handleBase: {
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  handle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 8,
    height: '100%',
  },
  grip: {
    width: 12,
    height: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.18)',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
});
