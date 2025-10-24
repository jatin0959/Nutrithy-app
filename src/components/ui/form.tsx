import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  AccessibilityState,
} from 'react-native';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

/* -------------------------------------------------------------------------- */
/*                                   <Form>                                   */
/* -------------------------------------------------------------------------- */

export const Form = FormProvider;

/* -------------------------------------------------------------------------- */
/*                             FormField (Controller)                         */
/* -------------------------------------------------------------------------- */

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                                useFormField                                */
/* -------------------------------------------------------------------------- */

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name as any });

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }
  if (!itemContext) {
    throw new Error('useFormField should be used within a <FormItem>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    // For React Native, use nativeID for linking; keep IDs for parity
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 <FormItem>                                 */
/* -------------------------------------------------------------------------- */

export function FormItem({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const id = React.useId().replace(/:/g, '');
  return (
    <FormItemContext.Provider value={{ id }}>
      <View style={[styles.item, style]}>{children}</View>
    </FormItemContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 <FormLabel>                                */
/* -------------------------------------------------------------------------- */

export function FormLabel({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  const { error } = useFormField();
  return (
    <Text style={[styles.label, !!error && styles.labelError, style]}>
      {children as any}
    </Text>
  );
}

/* -------------------------------------------------------------------------- */
/*                                <FormControl>                               */
/* -------------------------------------------------------------------------- */
/**
 * Wrap your input element with <FormControl> to inject accessibility props.
 * It will clone the only child and pass:
 *  - nativeID
 *  - accessibilityState.invalid
 *  - accessibilityHint (from description id if desired by user)
 */
export function FormControl({
  children,
}: {
  children: React.ReactElement;
}) {
  const { error, formItemId } = useFormField();
  const accessibilityState: AccessibilityState = { invalid: !!error };

  return React.cloneElement(children, {
    nativeID: formItemId,
    accessibilityState,
  });
}

/* -------------------------------------------------------------------------- */
/*                              <FormDescription>                             */
/* -------------------------------------------------------------------------- */

export function FormDescription({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  const { formDescriptionId } = useFormField();
  return (
    <Text nativeID={formDescriptionId} style={[styles.description, style]}>
      {children as any}
    </Text>
  );
}

/* -------------------------------------------------------------------------- */
/*                                <FormMessage>                               */
/* -------------------------------------------------------------------------- */

export function FormMessage({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : (children as any);

  if (!body) return null;

  return (
    <Text nativeID={formMessageId} style={[styles.message, style]}>
      {body}
    </Text>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  item: {
    gap: 8, // grid gap-2
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  labelError: {
    color: '#ef4444',
  },
  description: {
    fontSize: 12,
    color: '#64748b',
  },
  message: {
    fontSize: 12,
    color: '#ef4444',
  },
});
