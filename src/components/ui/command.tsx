import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* -------------------------------- Context -------------------------------- */

type CommandCtx = {
  query: string;
  setQuery: (q: string) => void;
  registerItem: (id: string, label: string) => void;
  unregisterItem: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const CommandContext = createContext<CommandCtx | null>(null);
const useCommand = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('Components must be used within <Command>');
  return ctx;
};

/* --------------------------------- Root ---------------------------------- */

type CommandProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function Command({ children, style }: CommandProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const itemsRef = useRef<Map<string, string>>(new Map());

  const registerItem = (id: string, label: string) => {
    itemsRef.current.set(id, label);
  };
  const unregisterItem = (id: string) => {
    itemsRef.current.delete(id);
  };

  const value = useMemo<CommandCtx>(
    () => ({ query, setQuery, registerItem, unregisterItem, selectedId, setSelectedId }),
    [query, selectedId]
  );

  return (
    <CommandContext.Provider value={value}>
      <View style={[styles.root, style]}>{children}</View>
    </CommandContext.Provider>
  );
}

/* ------------------------------- Dialog Wrap ------------------------------ */

type CommandDialogProps = {
  visible?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

export function CommandDialog({
  visible = false,
  onOpenChange,
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
}: CommandDialogProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => onOpenChange?.(false)}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.dialogRoot}
      >
        <Pressable style={styles.overlay} onPress={() => onOpenChange?.(false)} />
        <View style={styles.dialogCard}>
          {/* Screen-reader friendly header (hidden visually) */}
          <Text accessibilityElementsHidden style={styles.srOnly}>
            {title}
          </Text>
          <Text accessibilityElementsHidden style={styles.srOnly}>
            {description}
          </Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* --------------------------------- Input --------------------------------- */

type CommandInputProps = {
  placeholder?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus?: boolean;
};

export function CommandInput({
  placeholder = 'Type a command…',
  style,
  inputStyle,
  autoFocus = true,
}: CommandInputProps) {
  const { query, setQuery } = useCommand();
  return (
    <View style={[styles.inputWrap, style]}>
      <Feather name="search" size={16} color="#64748b" />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={[styles.input, inputStyle]}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

/* ---------------------------------- List --------------------------------- */

type CommandListProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  maxHeight?: number;
};

export function CommandList({ children, style, maxHeight = 300 }: CommandListProps) {
  return (
    <ScrollView
      style={[{ maxHeight }, styles.list, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {children}
    </ScrollView>
  );
}

/* ---------------------------------- Empty -------------------------------- */

type CommandEmptyProps = {
  children?: React.ReactNode;
  style?: TextStyle;
};

export function CommandEmpty({ children = 'No results found.', style }: CommandEmptyProps) {
  const { query } = useCommand();
  // Consumers should conditionally render based on results; we show when query is non-empty by default
  if (!query) return null;
  return <Text style={[styles.empty, style]}>{children as any}</Text>;
}

/* --------------------------------- Group --------------------------------- */

type CommandGroupProps = {
  heading?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  headingStyle?: TextStyle;
};

export function CommandGroup({ heading, children, style, headingStyle }: CommandGroupProps) {
  return (
    <View style={[styles.group, style]}>
      {heading ? <Text style={[styles.groupHeading, headingStyle]}>{heading}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

/* ------------------------------- Separator -------------------------------- */

type CommandSeparatorProps = {
  style?: ViewStyle;
};

export function CommandSeparator({ style }: CommandSeparatorProps) {
  return <View style={[styles.separator, style]} />;
}

/* ---------------------------------- Item --------------------------------- */

type CommandItemProps = {
  id?: string; // if not provided, generated
  value?: string; // searchable text (defaults to children string)
  disabled?: boolean;
  onSelect?: (val: string) => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

let _id = 0;
export function CommandItem({
  id,
  value,
  disabled,
  onSelect,
  children,
  style,
  textStyle,
  left,
  right,
}: CommandItemProps) {
  const { query, registerItem, unregisterItem, selectedId, setSelectedId } = useCommand();
  const key = useMemo(() => id ?? `cmd-item-${++_id}`, [id]);
  const label =
    typeof children === 'string'
      ? (children as string)
      : typeof value === 'string'
      ? value
      : '';

  useEffect(() => {
    registerItem(key, label);
    return () => unregisterItem(key);
  }, [key, label, registerItem, unregisterItem]);

  const visible = useMemo(() => {
    if (!query) return true;
    const target = (value ?? label).toLowerCase();
    return target.includes(query.toLowerCase());
  }, [query, value, label]);

  if (!visible) return null;

  const selected = selectedId === key;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => onSelect?.(value ?? label)}
      onFocus={() => setSelectedId(key)}
      style={({ pressed }) => [
        styles.item,
        selected && styles.itemSelected,
        disabled && styles.itemDisabled,
        pressed && !disabled && { opacity: 0.9 },
        style,
      ]}
    >
      {left ? <View style={styles.itemAffix}>{left}</View> : null}
      <Text numberOfLines={1} style={[styles.itemText, textStyle]}>
        {typeof children === 'string' ? (children as string) : value ?? ''}
      </Text>
      {right ? <View style={styles.itemAffix}>{right}</View> : null}
    </Pressable>
  );
}

/* ------------------------------- Shortcut -------------------------------- */

type CommandShortcutProps = {
  children?: React.ReactNode;
  style?: TextStyle;
};

export function CommandShortcut({ children, style }: CommandShortcutProps) {
  return <Text style={[styles.shortcut, style]}>{children as any}</Text>;
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dialogRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    borderWidth: 0,
    padding: 0,
    clipPath: 'inset(50%)' as any,
  },
  inputWrap: {
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#0f172a',
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#475569',
  },
  group: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  groupHeading: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 6,
  },
  itemSelected: {
    backgroundColor: '#e2e8f0',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  itemAffix: {
    width: 20,
    alignItems: 'center',
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    letterSpacing: 1,
    color: '#64748b',
  },
});
