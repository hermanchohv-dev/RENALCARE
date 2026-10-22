import React from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import paths from './icons/paths.json';

interface Props {
  name: keyof typeof paths;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}

/** Iconos SVG integrados: no necesitan fuentes ni ninguna descarga. */
export function AppIcon({ name, size = 24, color = '#000000', style }: Props) {
  const d = paths[name] ?? paths['information-outline'];
  return <Svg width={size} height={size} viewBox="0 0 24 24" style={style}
    testID={`app-icon-${name}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path d={d} fill={color} />
  </Svg>;
}
