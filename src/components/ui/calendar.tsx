import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Mode = 'single' | 'range';

type RangeValue = {
  from?: Date | null;
  to?: Date | null;
};

type CalendarProps = {
  mode?: Mode;
  /** For 'single', pass a Date; for 'range', pass { from, to } */
  selected?: Date | RangeValue | null;
  /** Called when selection changes */
  onSelect?: (value: Date | RangeValue | null) => void;
  /** Start month to display initially */
  initialMonth?: Date;
  /** Show outside days from previous/next months */
  showOutsideDays?: boolean;
  /** Customize styles */
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  dayStyle?: ViewStyle;
  dayTextStyle?: TextStyle;
  weekHeaderTextStyle?: TextStyle;
  /** Disable specific dates */
  isDateDisabled?: (d: Date) => boolean;
  /** Localized weekday labels (start on Sunday). Default: ['S','M','T','W','T','F','S'] */
  weekdayLabels?: string[];
};

export function Calendar({
  mode = 'single',
  selected = null,
  onSelect,
  initialMonth = new Date(),
  showOutsideDays = true,
  style,
  headerStyle,
  headerTextStyle,
  dayStyle,
  dayTextStyle,
  weekHeaderTextStyle,
  isDateDisabled,
  weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}: CalendarProps) {
  const [month, setMonth] = useState<Date>(startOfMonth(initialMonth));

  const sel = normalizeSelected(mode, selected);

  const grid = useMemo(() => buildMonthGrid(month, showOutsideDays), [month, showOutsideDays]);

  const onDayPress = (day: DayCell) => {
    if (!day.inCurrentMonth && !showOutsideDays) return;
    const date = day.date;
    if (isDateDisabled?.(date)) return;

    if (mode === 'single') {
      onSelect?.(date);
      return;
    }

    // range mode
    const { from, to } = sel as RangeValue;
    if (!from || (from && to)) {
      onSelect?.({ from: date, to: null });
    } else if (from && !to) {
      if (date < from) {
        onSelect?.({ from: date, to: from });
      } else if (date.getTime() === from.getTime()) {
        // allow collapsing to single-day range
        onSelect?.({ from: date, to: date });
      } else {
        onSelect?.({ from, to: date });
      }
    }
  };

  const isSelected = (d: Date) => {
    if (mode === 'single') {
      const s = sel as Date | null;
      return !!(s && isSameDay(s, d));
    } else {
      const { from, to } = sel as RangeValue;
      if (!from && !to) return false;
      if (from && !to) return isSameDay(from, d);
      if (from && to) return isWithinRange(d, from, to);
      return false;
    }
  };

  const isRangeEdge = (d: Date) => {
    if (mode !== 'range') return { start: false, end: false };
    const { from, to } = sel as RangeValue;
    return {
      start: !!(from && isSameDay(from, d)),
      end: !!(to && isSameDay(to, d)),
    };
  };

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.header, headerStyle]}>
        <Pressable onPress={() => setMonth(addMonths(month, -1))} style={styles.navBtn} accessibilityRole="button">
          <Feather name="chevron-left" size={18} color="#0f172a" />
        </Pressable>
        <Text style={[styles.headerText, headerTextStyle]}>{formatMonthYear(month)}</Text>
        <Pressable onPress={() => setMonth(addMonths(month, 1))} style={styles.navBtn} accessibilityRole="button">
          <Feather name="chevron-right" size={18} color="#0f172a" />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {weekdayLabels.map((wd, i) => (
          <Text key={i} style={[styles.weekHeaderText, weekHeaderTextStyle]}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((cell) => {
              const disabled = isDateDisabled?.(cell.date) ?? false;
              const selectedDay = isSelected(cell.date);
              const { start, end } = isRangeEdge(cell.date);
              const today = isToday(cell.date);
              const outside = !cell.inCurrentMonth;

              const containerStyles = [
                styles.dayContainer,
                dayStyle,
                outside && styles.dayOutside,
                disabled && styles.dayDisabled,
                selectedDay && styles.daySelected,
                today && !selectedDay && styles.dayToday,
                // range styling
                selectedDay && mode === 'range' && (start || end) && styles.dayRangeEdge,
                selectedDay && mode === 'range' && !start && !end && styles.dayRangeMiddle,
              ];

              const textStyles = [
                styles.dayText,
                dayTextStyle,
                outside && styles.dayTextOutside,
                disabled && styles.dayTextDisabled,
                selectedDay && styles.dayTextSelected,
                today && !selectedDay && styles.dayTextToday,
              ];

              return (
                <Pressable
                  key={cell.key}
                  disabled={disabled}
                  onPress={() => onDayPress(cell)}
                  style={({ pressed }) => [containerStyles, pressed && !disabled && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={cell.date.toDateString()}
                >
                  <Text style={textStyles}>{cell.date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------ Types & Utils ----------------------------- */

type DayCell = {
  key: string;
  date: Date;
  inCurrentMonth: boolean;
};

function startOfMonth(d: Date) {
  const t = new Date(d);
  t.setDate(1);
  t.setHours(0, 0, 0, 0);
  return t;
}

function addMonths(d: Date, n: number) {
  const t = new Date(d);
  t.setMonth(t.getMonth() + n);
  return startOfMonth(t);
}

function daysInMonth(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

function buildMonthGrid(month: Date, showOutside: boolean): DayCell[][] {
  const firstOfMonth = startOfMonth(month);
  const firstWeekday = firstOfMonth.getDay(); // 0-6, Sun-Sat
  const totalDays = daysInMonth(month);

  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);
  const prevDays = daysInMonth(prevMonth);

  const cells: DayCell[] = [];

  // Leading outside days
  for (let i = 0; i < firstWeekday; i++) {
    const day = prevDays - firstWeekday + i + 1;
    const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
    cells.push({
      key: `p-${date.toISOString()}`,
      date,
      inCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    cells.push({
      key: `c-${date.toISOString()}`,
      date,
      inCurrentMonth: true,
    });
  }

  // Trailing outside days to complete 6 rows x 7 cols (42 cells)
  const total = 42;
  const trailing = total - cells.length;
  for (let i = 1; i <= trailing; i++) {
    const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
    cells.push({
      key: `n-${date.toISOString()}`,
      date,
      inCurrentMonth: false,
    });
  }

  // If not showing outside days, replace them with blanks (but keep structure)
  if (!showOutside) {
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].inCurrentMonth) {
        // Put a zero-day in current month so layout remains (non-pressable)
        const blank = new Date(month.getFullYear(), month.getMonth(), 1);
        cells[i] = { ...cells[i], date: blank };
      }
    }
  }

  // Chunk into weeks
  const rows: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWithinRange(d: Date, from: Date, to: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return x >= a && x <= b;
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

function formatMonthYear(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function normalizeSelected(mode: Mode, value: CalendarProps['selected']): Date | RangeValue | null {
  if (mode === 'single') {
    return (value instanceof Date ? value : null) as Date | null;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return { from: value.from ?? null, to: value.to ?? null };
  }
  return { from: null, to: null };
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  root: {
    padding: 12, // p-3
  },
  header: {
    position: 'relative',
    width: '100%',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  navBtn: {
    position: 'absolute',
    top: 4,
    width: 28,
    height: 28,
    borderRadius: 6,
    right: undefined,
    left: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekHeader: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  weekHeaderText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },
  grid: {
    marginTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  dayOutside: {
    backgroundColor: 'transparent',
  },
  dayTextOutside: {
    color: '#94a3b8',
  },
  dayDisabled: {
    opacity: 0.4,
  },
  dayTextDisabled: {},
  daySelected: {
    backgroundColor: '#0ea5e9',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayToday: {
    backgroundColor: '#e2e8f0',
  },
  dayTextToday: {},
  dayRangeEdge: {
    backgroundColor: '#0ea5e9',
  },
  dayRangeMiddle: {
    backgroundColor: '#bae6fd',
  },
  pressed: { opacity: 0.85 },
});

// Adjust right nav button after styles declaration to avoid verbose inline styles
styles.navBtn = { ...styles.navBtn, right: 6 };
