import React, { createContext, useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

/* ------------------------------- Types ----------------------------------- */

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<any>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: { light?: string; dark?: string } }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

type ContainerProps = {
  id?: string;
  className?: never; // web-only
  style?: ViewStyle;
  config: ChartConfig;
  children?: React.ReactNode; // Expect RN chart content (e.g., <Svg>…)
};

/* ------------------------------ Context ---------------------------------- */

const ChartContext = createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error('useChart must be used within a <ChartContainer />');
  return ctx;
}

/* ---------------------------- ChartContainer ----------------------------- */

export function ChartContainer({ id, style, config, children }: ContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <View style={[styles.container, style]}>{children}</View>
    </ChartContext.Provider>
  );
}

/* ------------------------------ ChartStyle ------------------------------- */
/** No-op in React Native (kept for API parity) */
export function ChartStyle(_props: { id: string; config: ChartConfig }) {
  return null;
}

/* -------------------------------- Tooltip -------------------------------- */

export type ChartTooltipItem = {
  name?: string;
  value?: number | string;
  color?: string;
  icon?: React.ComponentType<any>;
  labelKey?: string;
};

type ChartTooltipProps = {
  /** Pass `true` to render; keep API parity with Recharts */
  active?: boolean;
  /** Items to display inside tooltip */
  items?: ChartTooltipItem[];
  /** Optional title/label above items */
  label?: React.ReactNode;
  /** Hide the label header */
  hideLabel?: boolean;
  /** Hide color indicators */
  hideIndicator?: boolean;
  /** "dot" | "line" | "dashed" */
  indicator?: 'dot' | 'line' | 'dashed';
  /** Styles */
  style?: ViewStyle;
  labelStyle?: TextStyle;
  itemTextStyle?: TextStyle;
};

/** Placeholder to keep export name parity with web usage */
export function ChartTooltip(_props: any) {
  return null;
}

export function ChartTooltipContent({
  active,
  items,
  label,
  hideLabel,
  hideIndicator,
  indicator = 'dot',
  style,
  labelStyle,
  itemTextStyle,
}: ChartTooltipProps) {
  const { config } = useChart();

  if (!active || !items || !items.length) return null;

  return (
    <View style={[styles.tooltip, style]}>
      {!hideLabel && !!label && <Text style={[styles.tooltipLabel, labelStyle]}>{label as any}</Text>}
      <View style={styles.tooltipItems}>
        {items.map((it, idx) => {
          const key = it.labelKey || it.name || 'value';
          const conf = (config as any)[key] || {};
          const Icon = it.icon || conf.icon;
          const color = it.color || conf.color;

          return (
            <View key={`${key}-${idx}`} style={styles.tooltipRow}>
              {Icon ? (
                <Icon />
              ) : !hideIndicator ? (
                <View
                  style={[
                    styles.indicatorBase,
                    indicator === 'dot' && styles.indicatorDot,
                    indicator === 'line' && styles.indicatorLine,
                    indicator === 'dashed' && styles.indicatorDashed,
                    color ? { backgroundColor: indicator === 'dot' ? color : 'transparent', borderColor: color } : null,
                  ]}
                />
              ) : null}
              <View style={styles.tooltipRowTextWrap}>
                <Text style={[styles.tooltipName, itemTextStyle]}>
                  {(conf.label as any) || it.name || key}
                </Text>
                {it.value !== undefined && (
                  <Text style={[styles.tooltipValue, itemTextStyle]}>{String(it.value)}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* -------------------------------- Legend --------------------------------- */

type LegendItem = {
  value?: string;
  color?: string;
  icon?: React.ComponentType<any>;
  nameKey?: string;
};

type ChartLegendProps = {
  /** Items to render */
  payload?: LegendItem[];
  /** "top" | "bottom" */
  verticalAlign?: 'top' | 'bottom';
  /** Hide icon squares */
  hideIcon?: boolean;
  /** Custom styles */
  style?: ViewStyle;
  itemTextStyle?: TextStyle;
};

/** Placeholder to keep export name parity with web usage */
export function ChartLegend(_props: any) {
  return null;
}

export function ChartLegendContent({
  payload,
  verticalAlign = 'bottom',
  hideIcon = false,
  style,
  itemTextStyle,
}: ChartLegendProps) {
  const { config } = useChart();
  if (!payload || !payload.length) return null;

  return (
    <View
      style={[
        styles.legend,
        verticalAlign === 'top' ? styles.legendTopPad : styles.legendBottomPad,
        style,
      ]}
    >
      {payload.map((item, idx) => {
        const key = item.value || 'value';
        const conf = (config as any)[key] || {};
        const Icon = conf.icon || item.icon;

        return (
          <View key={`${key}-${idx}`} style={styles.legendItem}>
            {Icon && !hideIcon ? (
              <Icon />
            ) : (
              !hideIcon && (
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: item.color || conf.color || '#94a3b8' },
                  ]}
                />
              )
            )}
            <Text style={[styles.legendText, itemTextStyle]}>
              {(conf.label as any) || item.value || key}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* -------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  container: {
    // Mimic web container defaults (aspect-video + center content)
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tooltip */
  tooltip: {
    minWidth: 128,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: 6,
  },
  tooltipLabel: {
    fontWeight: '700',
    color: '#0f172a',
  },
  tooltipItems: {
    gap: 6,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipRowTextWrap: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  tooltipName: {
    color: '#64748b',
    fontSize: 12,
  },
  tooltipValue: {
    color: '#0f172a',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
  },

  /* Indicators */
  indicatorBase: {
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  indicatorDot: { width: 10, height: 10 },
  indicatorLine: { width: 4, height: 12, backgroundColor: 'transparent' },
  indicatorDashed: {
    width: 0,
    height: 12,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },

  /* Legend */
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  legendTopPad: { paddingBottom: 12 },
  legendBottomPad: { paddingTop: 12 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#0f172a',
  },
});
