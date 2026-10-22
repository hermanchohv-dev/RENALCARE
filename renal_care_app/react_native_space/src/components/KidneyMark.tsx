import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

export const KIDNEY_PATH = 'M42 18C29 10 14 20 11 38C8 54 12 77 26 84C38 90 49 80 47 69C46 63 37 60 36 52C35 44 44 42 47 34C50 27 48 22 42 18Z';

/** Dos riñones con los hilios hacia el centro y los uréteres diferenciados. */
export function KidneyMark({ size = 132, color = '#FFFFFF', detailColor = '#D6EAFE', vesselColor = '#E3F1FF' }: { size?: number; color?: string; detailColor?: string; vesselColor?: string }) {
  return <Svg width={size} height={size * 124 / 132} viewBox="0 0 128 112" fill="none"
    accessibilityRole="image" accessibilityLabel="Dos riñones" testID="kidney-mark">
    <Path d="M40 51C53 55 55 64 55 77V101M88 51C75 55 73 64 73 77V101"
      stroke={vesselColor} strokeWidth={3.5} strokeLinecap="round" />
    <Path d="M58 27V38C58 44 49 45 43 49M70 27V38C70 44 79 45 85 49"
      stroke={color} strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
    <G>
      <Path d={KIDNEY_PATH} fill={color} />
      <Path d="M30 24C20 28 17 40 18 51" stroke={detailColor} strokeWidth={3} strokeLinecap="round" />
    </G>
    <G transform="translate(128 0) scale(-1 1)">
      <Path d={KIDNEY_PATH} fill={color} />
      <Path d="M30 24C20 28 17 40 18 51" stroke={detailColor} strokeWidth={3} strokeLinecap="round" />
    </G>
  </Svg>;
}
