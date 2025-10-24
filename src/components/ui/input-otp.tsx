import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native';

/* -----------------------------------------------------------------------------
 * React Native OTP Input (drop-in alternative for `input-otp`)
 * Exports: InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, OTPInputContext
 * --------------------------------------------------------------------------- */

type SlotState = {
  char?: string;
  isActive: boolean;
  hasFakeCaret: boolean;
};

type Ctx = {
  length: number;
  value: string;
  disabled?: boolean;
  focused: boolean;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  focusInput: () => void;
  slots: SlotState[];
};

export const OTPInputContext = React.createContext<Ctx | null>(null);

type RootProps = {
  value?: string;                  // controlled
  defaultValue?: string;           // uncontrolled
  onChange?: (v: string) => void;
  length?: number;                 // number of slots
  disabled?: boolean;
  autoFocus?: boolean;
  onlyDigits?: boolean;            // default true
  containerStyle?: ViewStyle;
  style?: ViewStyle;               // styles for the outer pressable wrapper
  inputStyle?: TextStyle;          // hidden input
  gap?: number;                    // gap between groups/slots (default 8)
};

export function InputOTP({
  value,
  defaultValue = '',
  onChange,
  length = 6,
  disabled,
  autoFocus,
  onlyDigits = true,
  containerStyle,
  style,
  inputStyle,
  gap = 8,
  ...rest
}: RootProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue.slice(0, length));
  const v = isControlled ? (value as string) : internal;

  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.min(v.length, length - 1));
  const [blink, setBlink] = useState(true);
  const inputRef = useRef<TextInput>(null);

  // caret blink
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Clamp active index if value shrinks/expands
    setActiveIndex(Math.min(Math.max(v.length, 0), length - 1));
  }, [v, length]);

  const update = (next: string) => {
    const clean = onlyDigits ? next.replace(/[^\d]/g, '') : next;
    const sliced = clean.slice(0, length);
    onChange?.(sliced);
    if (!isControlled) setInternal(sliced);
  };

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (disabled) return;
    if (e.nativeEvent.key === 'Backspace') {
      if (v.length === 0) return;
      // If last slot is empty, delete previous char
      const next =
        v.length === activeIndex + 1
          ? v.slice(0, -1)
          : // fallback
            v.slice(0, -1);
      update(next);
      setActiveIndex(Math.max(0, next.length - 1));
    }
  };

  const onChangeText = (text: string) => {
    if (disabled) return;
    // Find the newly added chars only
    const clean = onlyDigits ? text.replace(/[^\d]/g, '') : text;
    if (clean.length <= v.length) {
      update(clean);
      setActiveIndex(Math.max(0, clean.length - 1));
      return;
    }
    // Append the new characters
    const appended = (v + clean.slice(v.length)).slice(0, length);
    update(appended);
    setActiveIndex(Math.min(appended.length, length - 1));
  };

  const focusInput = () => inputRef.current?.focus();

  const slots: SlotState[] = useMemo(() => {
    const arr: SlotState[] = [];
    for (let i = 0; i < length; i++) {
      arr.push({
        char: v[i],
        isActive: focused && (v.length === i || (v.length === length && i === length - 1)),
        hasFakeCaret: focused && (v.length === i || (v.length === length && i === length - 1)) && blink && !v[i],
      });
    }
    return arr;
  }, [v, length, focused, blink]);

  const ctx: Ctx = {
    length,
    value: v,
    disabled,
    focused,
    activeIndex,
    setActiveIndex,
    focusInput,
    slots,
  };

  return (
    <OTPInputContext.Provider value={ctx}>
      <Pressable
        onPress={focusInput}
        disabled={disabled}
        style={({ pressed }) => [
          { opacity: disabled ? 0.5 : 1 },
          pressed && !disabled && { opacity: 0.9 },
          style,
        ]}
        {...rest as any}
      >
        <View style={[styles.container, { columnGap: gap }, containerStyle]}>
          {/* Hidden capture input */}
          <TextInput
            ref={inputRef}
            value={v}
            onChangeText={onChangeText}
            onKeyPress={onKeyPress}
            autoFocus={autoFocus}
            editable={!disabled}
            keyboardType={onlyDigits ? (Platform.OS === 'ios' ? 'number-pad' : 'numeric') : 'default'}
            maxLength={length}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            caretHidden
            style={[styles.hiddenInput, inputStyle]}
            // Helpful for autofill/SMS on Android
            textContentType="oneTimeCode"
            importantForAutofill="yes"
          />
          {/* Children (groups/slots) */}
          {rest && (rest as any).children}
        </View>
      </Pressable>
    </OTPInputContext.Provider>
  );
}

/* --------------------------------- Group --------------------------------- */

export function InputOTPGroup({
  children,
  style,
  gap = 4,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
}) {
  return <View style={[styles.group, { columnGap: gap }, style]}>{children}</View>;
}

/* ---------------------------------- Slot ---------------------------------- */

export function InputOTPSlot({
  index,
  style,
  textStyle,
  size = 36,
  rounded = 8,
  borderColor = 'rgba(0,0,0,0.15)',
  activeBorderColor = '#0ea5e9',
  backgroundColor = 'rgba(0,0,0,0.03)',
}: {
  index: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: number;
  rounded?: number;
  borderColor?: string;
  activeBorderColor?: string;
  backgroundColor?: string;
}) {
  const ctx = React.useContext(OTPInputContext);
  if (!ctx) throw new Error('InputOTPSlot must be used within <InputOTP>');

  const s = ctx.slots[index];
  const active = !!s?.isActive;

  return (
    <Pressable onPress={ctx.focusInput} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <View
        style={[
          styles.slot,
          {
            width: size,
            height: size,
            borderRadius: rounded,
            borderColor: active ? activeBorderColor : borderColor,
            backgroundColor,
          },
          active && styles.slotActive,
          style,
        ]}
      >
        <Text style={[styles.slotText, textStyle]}>{s?.char || ''}</Text>
        {s?.hasFakeCaret ? <View style={styles.caret} /> : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------- Separator -------------------------------- */

export function InputOTPSeparator({
  children,
  style,
  textStyle,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <View style={[styles.sepWrap, style]}>
      <Text style={[styles.sepText, textStyle]}>{children ?? '–'}</Text>
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  hiddenInput: {
    // Keep it 0x0 but focusable
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  slotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  caret: {
    position: 'absolute',
    width: 1,
    height: 18,
    backgroundColor: '#0f172a',
  },
  sepWrap: {
    paddingHorizontal: 4,
  },
  sepText: {
    fontSize: 18,
    color: '#0f172a',
  },
});
