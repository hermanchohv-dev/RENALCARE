import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

/** Dos riñones con los hilios hacia el centro y los uréteres diferenciados. */
export function KidneyMark() {
  const kidney = 'M42 18C29 10 14 20 11 38C8 54 12 77 26 84C38 90 49 80 47 69C46 63 37 60 36 52C35 44 44 42 47 34C50 27 48 22 42 18Z';
  return <Svg width={132} height={124} viewBox="0 0 128 112" fill="none"
    accessibilityRole="image" accessibilityLabel="Dos riñones" testID="kidney-mark">
    <Path d="M40 51C53 55 55 64 55 77V101M88 51C75 55 73 64 73 77V101"
      stroke="#E3F1FF" strokeWidth={3.5} strokeLinecap="round" />
    <Path d="M58 27V38C58 44 49 45 43 49M70 27V38C70 44 79 45 85 49"
      stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
    <G>
      <Path d={kidney} fill="#FFFFFF" />
      <Path d="M30 24C20 28 17 40 18 51" stroke="#D6EAFE" strokeWidth={3} strokeLinecap="round" />
    </G>
    <G transform="translate(128 0) scale(-1 1)">
      <Path d={kidney} fill="#FFFFFF" />
      <Path d="M30 24C20 28 17 40 18 51" stroke="#D6EAFE" strokeWidth={3} strokeLinecap="round" />
    </G>
  </Svg>;
}
