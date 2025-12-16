// Fallback for using MaterialCommunityIcons on Android and web.

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialCommunityIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to MaterialCommunityIcons mappings here.
 * - see MaterialCommunityIcons in https://icons.expo.fyi/ or https://materialdesignicons.com
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code-tags',
  'chevron.right': 'chevron-right',
} as const;

/**
 * An icon component that uses MaterialCommunityIcons from react-native-vector-icons.
 * This ensures a consistent look across platforms using FontAwesome icons.
 * Icon `name`s are based on SF Symbols and require manual mapping to MaterialCommunityIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialCommunityIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
