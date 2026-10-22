import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { KIDNEY_PATH } from './KidneyMark';

export type ModalityIconName = 'hemodialysis' | 'peritoneal' | 'transplant';

/** Símbolos propios integrados en la app, sin fuentes ni imágenes externas. */
export function ModalityIcon({ modality, color, size = 42 }: {
  modality: ModalityIconName; color: string; size?: number;
}) {
  const label = { hemodialysis: 'Máquina de hemodiálisis', peritoneal: 'Bolsa de diálisis peritoneal colgada', transplant: 'Riñón trasplantado' }[modality];
  return <Svg width={size} height={size} viewBox="0 0 64 64" fill="none"
    accessibilityRole="image" accessibilityLabel={label} testID={`modality-icon-${modality}`}>
    {modality === 'hemodialysis' && <>
      <Rect x={10} y={6} width={32} height={47} rx={5} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.07} />
      <Rect x={15} y={12} width={22} height={15} rx={2} stroke={color} strokeWidth={2} fill="#FFFFFF" />
      <Path d="M18 20H22L24 16L27 23L29 19H34" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={20} cy={34} r={3} stroke={color} strokeWidth={2} />
      <Circle cx={32} cy={34} r={3} stroke={color} strokeWidth={2} />
      <Path d="M17 44H35M42 19H47C51 19 53 22 53 27V37C53 42 48 45 42 43" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Rect x={48} y={25} width={10} height={15} rx={3} stroke={color} strokeWidth={2} fill="#FFFFFF" />
      <Path d="M51 28V37M55 28V37M15 54V57M37 54V57" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={15} cy={58} r={3} fill={color} />
      <Circle cx={37} cy={58} r={3} fill={color} />
    </>}
    {modality === 'peritoneal' && <>
      <Path d="M17 56V9C17 7 19 5 21 5H43V12M8 59L17 55L26 59" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M38 17V15C38 12 48 12 48 15V17" stroke={color} strokeWidth={2} />
      <Rect x={31} y={17} width={24} height={27} rx={5} fill={color} fillOpacity={0.08} stroke={color} strokeWidth={2.5} />
      <Path d="M33 31C38 28 46 35 53 31V39C53 41 52 42 50 42H36C34 42 33 41 33 39Z" fill={color} fillOpacity={0.28} />
      <Path d="M38 23H44M38 27H42M43 45V49" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Rect x={40} y={49} width={6} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M43 57V60C43 62 48 62 51 59" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </>}
    {modality === 'transplant' && <G transform="translate(7 -6) scale(0.75)">
      <Path d="M40 51C53 55 55 64 55 77" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <Path d={KIDNEY_PATH} fill={color} />
      <Path d="M30 24C20 28 17 40 18 51" stroke="#FFFFFF" strokeOpacity={0.65} strokeWidth={3} strokeLinecap="round" />
    </G>}
  </Svg>;
}
