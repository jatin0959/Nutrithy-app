// utils.ts (React Native / Expo without NativeWind)
import { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Combine multiple style objects conditionally.
 * Example:
 *  <View style={cn(styles.base, isActive && styles.active)} />
 */
export function cn<T extends StyleProp<ViewStyle | TextStyle | ImageStyle>>(
  ...inputs: (T | false | null | undefined)[]
): T {
  return inputs.filter(Boolean) as T;
}
