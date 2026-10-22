import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

/** Vista cenital: parabrisas delante, luces y cruz sanitaria en el techo. */
export function AmbulanceVehicle({ size = 48 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 64 96"
      accessibilityRole="image"
      accessibilityLabel="Ambulancia de demostración"
      testID="ambulance-vehicle"
    >
      <Rect
        x={9}
        y={10}
        width={48}
        height={80}
        rx={13}
        fill="#10283F"
        opacity={0.16}
      />
      <Rect x={4} y={22} width={8} height={18} rx={3} fill="#243647" />
      <Rect x={52} y={22} width={8} height={18} rx={3} fill="#243647" />
      <Rect x={4} y={65} width={8} height={17} rx={3} fill="#243647" />
      <Rect x={52} y={65} width={8} height={17} rx={3} fill="#243647" />
      <Rect
        x={10}
        y={5}
        width={44}
        height={82}
        rx={12}
        fill="#FFFFFF"
        stroke="#25435E"
        strokeWidth={1.8}
      />
      <Path d="M16 19Q32 13 48 19L45 31H19Z" fill="#204564" />
      <Path
        d="M20 20L28 18"
        stroke="#9CD9F7"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Rect x={10} y={39} width={5} height={31} fill="#EC5858" />
      <Rect x={49} y={39} width={5} height={31} fill="#EC5858" />
      <Rect x={18} y={34} width={28} height={7} rx={3} fill="#CDE6FA" />
      <Rect x={18} y={34} width={12} height={7} rx={3} fill="#258FF6" />
      <Rect x={34} y={34} width={12} height={7} rx={3} fill="#F36A6A" />
      <Path d="M28 48H36V56H44V64H36V72H28V64H20V56H28Z" fill="#2B86DE" />
      <Path d="M18 78H46M32 79V85" stroke="#BACCDC" strokeWidth={1.5} />
      <Rect x={16} y={82} width={7} height={3} rx={1} fill="#ED6868" />
      <Rect x={41} y={82} width={7} height={3} rx={1} fill="#ED6868" />
    </Svg>
  );
}
